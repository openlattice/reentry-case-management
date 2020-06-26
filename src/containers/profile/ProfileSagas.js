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
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { Models } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  getAssociationDetails,
  getAssociationESID,
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../utils/DataUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import {
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PROFILE,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  loadProfile,
} from './ProfileActions';
import { getEmergencyContactInfo } from './contacts/ContactInfoActions';
import { getEmergencyContactInfoWorker } from './contacts/ContactInfoSagas';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { DST, SRC } from '../../utils/constants/GeneralConstants';

const LOG = new Logger('ProfileSagas');
const { FullyQualifiedName } = Models;
const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  CONTACT_INFO,
  EMERGENCY_CONTACT,
  ENROLLMENT_STATUS,
  HEARINGS,
  IS_EMERGENCY_CONTACT_FOR,
  LOCATION,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  PEOPLE,
  PERSON_DETAILS,
  PROVIDER,
  PROVIDER_STAFF,
  REFERRAL_REQUEST,
  STATE_ID,
} = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * ProfileActions.getEnrollmentStatusNeighbors()
 *
 */

function* getEnrollmentStatusNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getEnrollmentStatusNeighbors.request(id, value));
    const { enrollmentStatusEKIDs } = value;

    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    let searchFilter :Object = {
      entityKeyIds: enrollmentStatusEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [providersESID],
    };
    let response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    let providerByStatusEKID :Map = Map();
    const providerEKIDs :UUID[] = [];
    fromJS(response.data).forEach((neighborList :List, enrollmentStatusEKID :UUID) => {
      const entity :Map = getNeighborDetails(neighborList.first());
      providerByStatusEKID = providerByStatusEKID.set(enrollmentStatusEKID, entity);
      providerEKIDs.push(getEKID(entity));
    });

    let contactNameByProviderEKID :Map = Map();
    if (providerEKIDs.length) {
      const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
      searchFilter = {
        entityKeyIds: providerEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [providerStaffESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      fromJS(response.data).forEach((neighborList :List, providerEKID :UUID) => {
        const firstContactPerson :Map = getNeighborDetails(neighborList.first());
        const contactName :string = getPersonFullName(firstContactPerson);
        contactNameByProviderEKID = contactNameByProviderEKID.set(providerEKID, contactName);
      });
    }

    yield put(getEnrollmentStatusNeighbors.success(id, { contactNameByProviderEKID, providerByStatusEKID }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEnrollmentStatusNeighbors.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatusNeighbors.finally(id));
  }
}

function* getEnrollmentStatusNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUS_NEIGHBORS, getEnrollmentStatusNeighborsWorker);
}

/*
 *
 * ProfileActions.getParticipantNeighbors()
 *
 */

function* getParticipantNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};

  try {
    yield put(getParticipantNeighbors.request(id, value));
    const { neighborsToGet, participantEKID } = value;

    const app = yield select(getAppFromState);
    const participantsESID :UUID = getESIDFromApp(app, PEOPLE);

    const searchFilter = {
      entityKeyIds: [participantEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [],
    };
    neighborsToGet.forEach((neighborMap :Object) => {
      const { direction, neighborESID } = neighborMap;
      if (direction === DST) searchFilter.destinationEntitySetIds.push(neighborESID);
      if (direction === SRC) searchFilter.sourceEntitySetIds.push(neighborESID);
    });

    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: participantsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;

    let personNeighborMap :Map = Map();
    const neighbors :Map = fromJS(response.data);
    if (!neighbors.isEmpty()) {
      neighbors.forEach((neighborList :List) => {
        neighborList.forEach((neighbor :Map) => {
          const associationESID :UUID = getAssociationESID(neighbor);
          if (associationESID === getESIDFromApp(app, IS_EMERGENCY_CONTACT_FOR)) {
            personNeighborMap = personNeighborMap.setIn(
              [IS_EMERGENCY_CONTACT_FOR, getEKID(getNeighborDetails(neighbor))],
              getAssociationDetails(neighbor)
            );
          }

          const neighborESID :UUID = getNeighborESID(neighbor);
          const neighborEntityFqn :FullyQualifiedName = getFqnFromApp(app, neighborESID);
          const entity :Map = getNeighborDetails(neighbor);
          let entityList :List = personNeighborMap.get(neighborEntityFqn, List());
          entityList = entityList.push(entity);
          personNeighborMap = personNeighborMap.set(neighborEntityFqn, entityList);
        });
        return personNeighborMap;
      });
    }
    if (isDefined(get(personNeighborMap, ENROLLMENT_STATUS))) {
      const enrollmentStatusEKIDs :UUID[] = personNeighborMap.get(ENROLLMENT_STATUS)
        .map((statusEntity :Map) => getEKID(statusEntity))
        .toJS();
      yield call(getEnrollmentStatusNeighborsWorker, getEnrollmentStatusNeighbors({ enrollmentStatusEKIDs }));
    }
    if (isDefined(get(personNeighborMap, EMERGENCY_CONTACT))) {
      const emergencyContactEKIDs :UUID[] = personNeighborMap.get(EMERGENCY_CONTACT)
        .map((emergencyContact :Map) => getEKID(emergencyContact))
        .toJS();
      yield call(getEmergencyContactInfoWorker, getEmergencyContactInfo({ emergencyContactEKIDs }));
    }

    workerResponse.data = personNeighborMap;
    yield put(getParticipantNeighbors.success(id, personNeighborMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipantNeighbors.failure(id, error));
  }
  finally {
    yield put(getParticipantNeighbors.finally(id));
  }
  return workerResponse;
}

function* getParticipantNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_NEIGHBORS, getParticipantNeighborsWorker);
}

/*
 *
 * ProfileActions.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};

  try {
    yield put(getParticipant.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);

    const response :Object = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: peopleESID, entityKeyId: participantEKID })
    );
    if (response.error) {
      throw response.error;
    }
    const participant :Map = fromJS(response.data);

    workerResponse.data = response.data;
    yield put(getParticipant.success(id, participant));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
  return workerResponse;
}

function* getParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT, getParticipantWorker);
}

/*
 *
 * ProfileActions.loadProfile()
 *
 */

function* loadProfileWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(loadProfile.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const manualJailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const referralToReentryESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);
    const addressESID :UUID = getESIDFromApp(app, LOCATION);
    const emergencyContactESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT);
    const hearingsESID :UUID = getESIDFromApp(app, HEARINGS);
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);
    const neighborsToGet = [
      { direction: DST, neighborESID: personDetailsESID },
      { direction: DST, neighborESID: needsAssessmentESID },
      { direction: DST, neighborESID: contactInfoESID },
      { direction: DST, neighborESID: enrollmentStatusESID },
      { direction: DST, neighborESID: manualJailStaysESID },
      { direction: DST, neighborESID: referralToReentryESID },
      { direction: DST, neighborESID: addressESID },
      { direction: SRC, neighborESID: emergencyContactESID },
      { direction: DST, neighborESID: hearingsESID },
      { direction: DST, neighborESID: stateIdESID },
    ];
    const workerResponses :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }

    yield put(loadProfile.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadProfile.failure(id, error));
  }
  finally {
    yield put(loadProfile.finally(id));
  }
}

function* loadProfileWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_PROFILE, loadProfileWorker);
}

export {
  getEnrollmentStatusNeighborsWatcher,
  getEnrollmentStatusNeighborsWorker,
  getParticipantWatcher,
  getParticipantWorker,
  getParticipantNeighborsWatcher,
  getParticipantNeighborsWorker,
  loadProfileWatcher,
  loadProfileWorker,
};
