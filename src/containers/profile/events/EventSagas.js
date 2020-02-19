// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import {
  GET_PROVIDERS,
  RECORD_ENROLLMENT_EVENT,
  getProviders,
  recordEnrollmentEvent,
} from './EventActions';
import { submitDataGraph } from '../../../core/data/DataActions';
import { submitDataGraphWorker } from '../../../core/data/DataSagas';
import { getEnrollmentStatusNeighbors } from '../ProfileActions';
import { getEnrollmentStatusNeighborsWorker } from '../ProfileSagas';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP, EDM, PROFILE } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('EventSagas');
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { ENROLLMENT_STATUS, PROVIDER } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { PARTICIPANT_NEIGHBORS } = PROFILE;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const getProfileFromState = (state) => state.get(PROFILE.PROFILE, Map());

/*
 *
 * EventSagas.getProviders()
 *
 */

function* getProvidersWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getProviders.request(id));

    const app = yield select(getAppFromState);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: providersESID }));
    if (response.error) {
      throw response.error;
    }
    const participant :Map = fromJS(response.data);

    yield put(getProviders.success(id, participant));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getProviders.failure(id, error));
  }
  finally {
    yield put(getProviders.finally(id));
  }
}

function* getProvidersWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PROVIDERS, getProvidersWorker);
}

/*
 *
 * EventSagas.recordEnrollmentEvent()
 *
 */

function* recordEnrollmentEventWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(recordEnrollmentEvent.request(id));

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { entityKeyIds } = response.data;
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const profile = yield select(getProfileFromState);
    const existingEnrollmentStatuses :List = profile.getIn([PARTICIPANT_NEIGHBORS, ENROLLMENT_STATUS], List());
    const existingEnrollmentStatusEKIDs :UUID[] = [];
    existingEnrollmentStatuses.forEach((status :Map) => {
      existingEnrollmentStatusEKIDs.push(getEKID(status));
    });

    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const newEnrollmentStatusEKID :UUID = entityKeyIds[enrollmentStatusESID][0];
    const enrollmentStatusData :Object = entityData[enrollmentStatusESID][0];
    let newEnrollmentStatus :Map = fromJS({
      [ENTITY_KEY_ID]: [newEnrollmentStatusEKID]
    });
    fromJS(enrollmentStatusData).forEach((entityValue :List, ptid :UUID) => {
      const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
      newEnrollmentStatus = newEnrollmentStatus.set(propertyFqn, entityValue);
    });

    yield call(
      getEnrollmentStatusNeighborsWorker,
      getEnrollmentStatusNeighbors({
        enrollmentStatusEKIDs: [newEnrollmentStatusEKID].concat(existingEnrollmentStatusEKIDs)
      })
    );

    yield put(recordEnrollmentEvent.success(id, { newEnrollmentStatus }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(recordEnrollmentEvent.failure(id, error));
  }
  finally {
    yield put(recordEnrollmentEvent.finally(id));
  }
}

function* recordEnrollmentEventWatcher() :Generator<*, *, *> {

  yield takeEvery(RECORD_ENROLLMENT_EVENT, recordEnrollmentEventWorker);
}

export {
  getProvidersWatcher,
  getProvidersWorker,
  recordEnrollmentEventWatcher,
  recordEnrollmentEventWorker,
};
