// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
  get,
  has,
} from 'immutable';
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_NEW_FOLLOW_UP,
  GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  MARK_FOLLOW_UP_AS_COMPLETE,
  createNewFollowUp,
  getEntitiesForNewFollowUpForm,
  getFollowUpNeighbors,
  loadTasks,
  markFollowUpAsComplete,
} from './FollowUpsActions';

import Logger from '../../../utils/Logger';
import { submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getAssociationESID,
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyFqnFromEDM,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { constructNewEntityFromSubmittedData } from '../../../utils/FormUtils';
import { isDefined } from '../../../utils/LangUtils';
import { DST } from '../../../utils/constants/GeneralConstants';
import {
  APP,
  EDM,
  PARTICIPANT_FOLLOW_UPS,
  PROVIDERS,
} from '../../../utils/constants/ReduxStateConstants';
import { getProviders } from '../../providers/ProvidersActions';
import { getProvidersWorker } from '../../providers/ProvidersSagas';
import { getParticipant, getParticipantNeighbors } from '../ProfileActions';
import { getParticipantNeighborsWorker, getParticipantWorker } from '../ProfileSagas';

const LOG = new Logger('FollowUpsSagas');
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPEARS_IN,
  FOLLOW_UPS,
  MANUAL_ASSIGNED_TO,
  MEETINGS,
  PEOPLE,
  PROVIDER,
  REENTRY_STAFF,
  REPORTED,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const getParticipantFollowUpsFromState = (state) => state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS, Map());
const getProvidersFromState = (state) => state.get(PROVIDERS.PROVIDERS, Map());

/*
 *
 * FollowUpsActions.createNewFollowUp()
 *
 */

function* createNewFollowUpWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const sagaResponse :Object = {};

  try {
    yield put(createNewFollowUp.request(id));
    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const participantFollowUps = yield select(getParticipantFollowUpsFromState);
    const providers = yield select(getProvidersFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const reportedESID :UUID = getESIDFromApp(app, REPORTED);
    const assignedToESID :UUID = getESIDFromApp(app, MANUAL_ASSIGNED_TO);
    const appearsInESID :UUID = getESIDFromApp(app, APPEARS_IN);

    const { data } = response;
    const { entityKeyIds } = data;
    const [newFollowUpEKID] :UUID = entityKeyIds[followUpsESID];
    let newMeetingsEKID :UUID = '';
    if (isDefined(entityKeyIds[meetingsESID])) [newMeetingsEKID] = entityKeyIds[meetingsESID];

    const { associationEntityData, entityData } = value;
    const followUpData :Object = entityData[followUpsESID][0];

    const newFollowUp :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newFollowUpEKID]));
      fromJS(followUpData).forEach((entityValue :List, ptid :UUID) => {
        const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
        map.set(propertyFqn, List(entityValue));
      });
    }).asImmutable();

    let newMeeting :Map = Map().asMutable();
    if (newMeetingsEKID.length) {
      newMeeting = Map().withMutations((map :Map) => {
        map.set(ENTITY_KEY_ID, List([newMeetingsEKID]));
        const meetingData :Map = fromJS(entityData[meetingsESID][0]);
        meetingData.forEach((entityValue :List, ptid :UUID) => {
          const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
          map.set(propertyFqn, List(entityValue));
        });
      }).asImmutable();
    }

    const reentryStaffMembers :List = participantFollowUps.get(PARTICIPANT_FOLLOW_UPS.REENTRY_STAFF_MEMBERS, List());
    const providersList :List = providers.get(PROVIDERS.PROVIDERS_LIST, List());
    const followUpNeighbors :Map = Map().withMutations((map :Map) => {
      map.set(MEETINGS, newMeeting);
      const assignedToAssociation :Object = associationEntityData[assignedToESID][0];
      const reentryStaffAssignedToEKID :UUID = assignedToAssociation.srcEntityKeyId;
      const staffMemberAssignedTo :Map = reentryStaffMembers
        .find((member :Map) => getEKID(member) === reentryStaffAssignedToEKID);
      map.set(MANUAL_ASSIGNED_TO, staffMemberAssignedTo);
      if (isDefined(associationEntityData[reportedESID])) {
        const reportedAssociation :Object = associationEntityData[reportedESID][0];
        const reentryStaffReportedByEKID :Object = reportedAssociation.srcEntityKeyId;
        const staffMemberWhoReported :Map = reentryStaffMembers
          .find((member :Map) => getEKID(member) === reentryStaffReportedByEKID);
        map.set(REPORTED, staffMemberWhoReported);
      }
      if (isDefined(associationEntityData[appearsInESID])) {
        const appearsInAssociation :Object = associationEntityData[appearsInESID][0];
        const providerEKID :Object = appearsInAssociation.srcEntityKeyId;
        const linkedProvider :Map = providersList.find((member :Map) => getEKID(member) === providerEKID);
        map.set(PROVIDER, linkedProvider);
      }
    });

    yield put(createNewFollowUp.success(id, { newFollowUp, newFollowUpEKID, followUpNeighbors }));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(createNewFollowUp.failure(id, error));
  }
  finally {
    yield put(createNewFollowUp.finally(id));
  }
  return sagaResponse;
}

function* createNewFollowUpWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_NEW_FOLLOW_UP, createNewFollowUpWorker);
}

/*
 *
 * FollowUpsActions.getEntitiesForNewFollowUpForm()
 *
 */

function* getEntitiesForNewFollowUpFormWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const sagaResponse :Object = {};

  try {
    yield put(getEntitiesForNewFollowUpForm.request(id));
    const app = yield select(getAppFromState);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);

    const [providersResponse, reentryStaffResponse] = yield all([
      call(getProvidersWorker, getProviders()),
      call(getEntitySetDataWorker, getEntitySetData({ entitySetId: reentryStaffESID })),
    ]);
    if (providersResponse.error) throw providersResponse.error;
    if (reentryStaffResponse.error) throw reentryStaffResponse.error;

    const reentryStaff :List = fromJS(reentryStaffResponse.data);
    sagaResponse.data = reentryStaff;
    yield put(getEntitiesForNewFollowUpForm.success(id, reentryStaff));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getEntitiesForNewFollowUpForm.failure(id, error));
  }
  finally {
    yield put(getEntitiesForNewFollowUpForm.finally(id));
  }
  return sagaResponse;
}

function* getEntitiesForNewFollowUpFormWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, getEntitiesForNewFollowUpFormWorker);
}

/*
 *
 * FollowUpsActions.getFollowUpNeighbors()
 *
 */

function* getFollowUpNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getFollowUpNeighbors.request(id));
    const { followUpEKIDs } = value;

    const app = yield select(getAppFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    let searchFilter = {
      entityKeyIds: followUpEKIDs,
      sourceEntitySetIds: [meetingsESID, peopleESID, providerESID, reentryStaffESID],
      destinationEntitySetIds: [],
    };
    let response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: followUpsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;

    const meetingsEKIDs :UUID[] = [];

    const followUpNeighborMap :Map = Map().withMutations((map :Map) => {
      fromJS(response.data).forEach((neighborList :List, followUpEKID :UUID) => {
        neighborList.forEach((neighbor :Map) => {
          // store reentry staff by their association ESIDs (reported vs. assigned to)
          const associationESID :UUID = getAssociationESID(neighbor);
          const neighborESID :UUID = getNeighborESID(neighbor);
          let esidToUseAsKey :UUID = associationESID;
          if (neighborESID === meetingsESID || neighborESID === providerESID) esidToUseAsKey = neighborESID;
          const fqn :FullyQualifiedName = getFqnFromApp(app, esidToUseAsKey);
          const entity :Map = getNeighborDetails(neighbor);
          map.update(followUpEKID, Map(), (entitiesMap) => entitiesMap.set(fqn, entity));

          if (neighborESID === meetingsESID) {
            meetingsEKIDs.push(getEKID(entity));
          }
        });
      });
    });

    let meetingNotesStaffMap = Map().asMutable();

    if (meetingsEKIDs.length) {
      searchFilter = {
        entityKeyIds: meetingsEKIDs,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [reentryStaffESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: meetingsESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      fromJS(response.data).forEach((neighborList :List, meetingEKID :UUID) => {
        const staffMemberRecordedBy :Map = getNeighborDetails(neighborList.get(0));
        meetingNotesStaffMap.set(meetingEKID, staffMemberRecordedBy);
      });
    }

    meetingNotesStaffMap = meetingNotesStaffMap.asImmutable();

    yield put(getFollowUpNeighbors.success(id, { followUpNeighborMap, meetingNotesStaffMap }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getFollowUpNeighbors.failure(id, error));
  }
  finally {
    yield put(getFollowUpNeighbors.finally(id));
  }
}

function* getFollowUpNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_FOLLOW_UP_NEIGHBORS, getFollowUpNeighborsWorker);
}

/*
 *
 * FollowUpsActions.loadTasks()
 *
 */

function* loadTasksWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(loadTasks.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const neighborsToGet = [
      { direction: DST, neighborESID: followUpsESID },
    ];
    const [neighborsResponse, participantResponse, formEntitiesResponse] :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
      call(getEntitiesForNewFollowUpFormWorker, getEntitiesForNewFollowUpForm()),
    ]);
    if (neighborsResponse.error) throw neighborsResponse.error;
    if (participantResponse.error) throw participantResponse.error;
    if (formEntitiesResponse.error) throw formEntitiesResponse.error;

    const neighborMap :Map = neighborsResponse.data;
    if (isDefined(get(neighborMap, FOLLOW_UPS))) {
      const followUpEKIDs :UUID[] = [];
      get(neighborMap, FOLLOW_UPS).forEach((followUpEntity :Map) => {
        followUpEKIDs.push(getEKID(followUpEntity));
      });
      yield call(getFollowUpNeighborsWorker, getFollowUpNeighbors({ followUpEKIDs }));
    }

    yield put(loadTasks.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadTasks.failure(id, error));
  }
  finally {
    yield put(loadTasks.finally(id));
  }
}

function* loadTasksWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_TASKS, loadTasksWorker);
}

/*
 *
 * FollowUpsActions.markFollowUpAsComplete()
 *
 */

function* markFollowUpAsCompleteWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(markFollowUpAsComplete.request(id, value));
    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);

    const { entityData } = value;
    let followUpData :Map = fromJS(get(entityData, followUpsESID));
    const followUpEKID :UUID = followUpData.keySeq().first();
    followUpData = get(followUpData, followUpEKID);
    const newFollowUp :Map = constructNewEntityFromSubmittedData(followUpData, followUpEKID, edm);
    let newMeeting :Map = Map();

    if (has(entityData, meetingsESID)) {
      let meetingData :Map = fromJS(get(entityData, meetingsESID));
      const meetingEKID :UUID = meetingData.keySeq().first();
      meetingData = get(meetingData, meetingEKID);
      newMeeting = constructNewEntityFromSubmittedData(meetingData, meetingEKID, edm);
    }

    yield put(markFollowUpAsComplete.success(id, { followUpEKID, newFollowUp, newMeeting }));
  }
  catch (error) {
    LOG.error('caught exception in markFollowUpAsCompleteWorker()', error);
    yield put(markFollowUpAsComplete.failure(id, error));
  }
  finally {
    yield put(markFollowUpAsComplete.finally(id));
  }
}

function* markFollowUpAsCompleteWatcher() :Generator<*, *, *> {

  yield takeEvery(MARK_FOLLOW_UP_AS_COMPLETE, markFollowUpAsCompleteWorker);
}

export {
  createNewFollowUpWatcher,
  createNewFollowUpWorker,
  getEntitiesForNewFollowUpFormWatcher,
  getEntitiesForNewFollowUpFormWorker,
  getFollowUpNeighborsWatcher,
  getFollowUpNeighborsWorker,
  loadTasksWatcher,
  loadTasksWorker,
  markFollowUpAsCompleteWatcher,
  markFollowUpAsCompleteWorker,
};
