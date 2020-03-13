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
} from 'immutable';
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import {
  getAssociationESID,
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../../utils/DataUtils';
import { getParticipant, getParticipantNeighbors } from '../ProfileActions';
import { getParticipantWorker, getParticipantNeighborsWorker } from '../ProfileSagas';
import { getProviders } from '../../providers/ProvidersActions';
import { getProvidersWorker } from '../../providers/ProvidersSagas';
import { submitDataGraph } from '../../../core/data/DataActions'
import { submitDataGraphWorker } from '../../../core/data/DataSagas'
import {
  CREATE_NEW_FOLLOW_UP,
  GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  createNewFollowUp,
  getEntitiesForNewFollowUpForm,
  getFollowUpNeighbors,
  loadTasks,
} from './FollowUpsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { DST } from '../../../utils/constants/GeneralConstants';

const LOG = new Logger('FollowUpsSagas');
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { FOLLOW_UPS, REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

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

    // const app = yield select(getAppFromState);
    // const edm = yield select(getEdmFromState);
    // const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    // const providerAddressESID :UUID = getESIDFromApp(app, PROVIDER_ADDRESS);
    //
    // const { data } = response;
    // const { entityKeyIds } = data;
    // const newProviderEKID :UUID = entityKeyIds[providerESID][0];
    // const newProviderAddressEKID :UUID = entityKeyIds[providerAddressESID][0];
    // const { entityData } = value;
    // const providerData :Object = entityData[providerESID][0];
    //
    // let newProvider :Map = fromJS({
    //   [ENTITY_KEY_ID]: [newProviderEKID]
    // });
    // fromJS(providerData).forEach((entityValue :List, ptid :UUID) => {
    //   const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
    //   newProvider = newProvider.set(propertyFqn, entityValue);
    // });
    // const newProviderAddress :Map = fromJS({
    //   [ENTITY_KEY_ID]: [newProviderAddressEKID]
    // });

    yield put(createNewFollowUp.success(id));
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

  yield takeEvery(GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, createNewFollowUpWorker);
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
    const searchFilter = {
      entityKeyIds: followUpEKIDs,
      sourceEntitySetIds: [meetingsESID, providerESID, reentryStaffESID],
      destinationEntitySetIds: [],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: followUpsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
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
        });
      });
    });

    yield put(getFollowUpNeighbors.success(id, followUpNeighborMap));
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

export {
  getEntitiesForNewFollowUpFormWatcher,
  getEntitiesForNewFollowUpFormWorker,
  getFollowUpNeighborsWatcher,
  getFollowUpNeighborsWorker,
  loadTasksWatcher,
  loadTasksWorker,
};
