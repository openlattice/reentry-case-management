// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getESIDFromApp } from '../../../utils/DataUtils';
import {
  GET_PROVIDERS,
  RECORD_ENROLLMENT_EVENT,
  getProviders,
  recordEnrollmentEvent,
} from './EventActions';
import { submitDataGraph } from '../../../core/data/DataActions';
import { submitDataGraphWorker } from '../../../core/data/DataSagas';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('EventSagas');
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { PROVIDER } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

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

    yield put(recordEnrollmentEvent.success(id));
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
