/*
 * @flow
 */

import { AccountUtils } from 'lattice-auth';
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { push } from 'connected-react-router';
import { AppApiActions, AppApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import * as Routes from '../../core/router/Routes';
import { APP_NAME } from '../../utils/constants/GeneralConstants';
import {
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  initializeApplication,
} from './AppActions';
import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));
    const [edmResponse, appResponse] :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getAppWorker, getApp(APP_NAME))
    ]);
    if (edmResponse.error) throw edmResponse.error;
    if (appResponse.error) throw appResponse.error;

    const app = appResponse.data;
    const appConfigsResponse = yield call(getAppConfigsWorker, getAppConfigs(app.id));
    if (appConfigsResponse.error) throw appConfigsResponse.error;

    const appConfigs :Object[] = appConfigsResponse.data || [];

    yield put(initializeApplication.success(action.id, { appConfigs }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

function* switchOrganizationWorker(action :Object) :Generator<*, *, *> {
  const { value } = action;
  AccountUtils.storeOrganizationId(value.orgId);
  yield put(push(Routes.ROOT));
  yield call(initializeApplicationWorker, initializeApplication());
}

function* switchOrganizationWatcher() :Generator<*, *, *> {
  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
  switchOrganizationWatcher,
  switchOrganizationWorker,
};
