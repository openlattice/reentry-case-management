// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_REENTRY_STAFF, getReentryStaff } from './CaseNotesActions';

import Logger from '../../utils/Logger';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp } from '../../utils/DataUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('CaseNotesSagas');

/*
 *
 * CaseNotesActions.getReentryStaff()
 *
 */

function* getReentryStaffWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(getReentryStaff.request(id));
    const app = yield select(getAppFromState);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: reentryStaffESID }));
    if (response.error) throw response.error;
    const reentryStaff :List = fromJS(response.data);
    yield put(getReentryStaff.success(id, reentryStaff));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getReentryStaff.failure(id, error));
  }
  finally {
    yield put(getReentryStaff.finally(id));
  }
}

function* getReentryStaffWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REENTRY_STAFF, getReentryStaffWorker);
}

export {
  getReentryStaffWatcher,
  getReentryStaffWorker,
};
