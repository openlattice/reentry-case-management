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
  getEKID,
  getESIDFromApp,
  // getEntityProperties,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
  // getPTIDFromEDM,
} from '../../utils/DataUtils';
import {
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PROFILE,
  getParticipant,
  getParticipantNeighbors,
  loadProfile,
} from './ProfileActions';
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
  ENROLLMENT_STATUS,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  PEOPLE,
  PERSON_DETAILS,
  PROVIDER,
} = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * ParticipantsSagas.getEnrollmentStatusNeighbors()
 *
 */

function* getEnrollmentStatusNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};

  try {
    yield put(getEnrollmentStatusNeighbors.request(id, value));
    const { enrollmentStatusEKIDs } = value;

    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    const searchFilter = {
      entityKeyIds: enrollmentStatusEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [providersESID],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let enrollmentStatusNeighborMap :Map = Map();
    const neighbors :Map = fromJS(response.data);
    if (!neighbors.isEmpty()) {
      neighbors.forEach((neighborList :List, enrollmentStatusEKID :UUID) => {
        neighborList.forEach((neighbor :Map) => {
          const entity :Map = getNeighborDetails(neighbor);
          let entityList :List = enrollmentStatusNeighborMap.get(PROVIDER, List());
          entityList = entityList.push(entity);
          personNeighborMap = personNeighborMap.set(neighborEntityFqn, entityList);
        });
        return personNeighborMap;
      });
    }

    workerResponse.data = response.data;
    yield put(getEnrollmentStatusNeighbors.success(id, personNeighborMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEnrollmentStatusNeighbors.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatusNeighbors.finally(id));
  }
  return workerResponse;
}

function* getEnrollmentStatusNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUS_NEIGHBORS, getEnrollmentStatusNeighborsWorker);
}

/*
 *
 * ParticipantsSagas.getParticipantNeighbors()
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
    if (response.error) {
      throw response.error;
    }
    let personNeighborMap :Map = Map();
    const neighbors :Map = fromJS(response.data);
    if (!neighbors.isEmpty()) {
      neighbors.forEach((neighborList :List) => {
        neighborList.forEach((neighbor :Map) => {
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

    workerResponse.data = response.data;
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
 * ProfileSagas.getParticipant()
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
 * ProfileSagas.loadProfile()
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
    const neighborsToGet = [
      { direction: DST, neighborESID: personDetailsESID },
      { direction: DST, neighborESID: needsAssessmentESID },
      { direction: DST, neighborESID: contactInfoESID },
      { direction: DST, neighborESID: enrollmentStatusESID },
      { direction: DST, neighborESID: manualJailStaysESID },
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
  getParticipantWatcher,
  getParticipantWorker,
  getParticipantNeighborsWatcher,
  getParticipantNeighborsWorker,
  loadProfileWatcher,
  loadProfileWorker,
};
