// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_MEETING,
  GET_REENTRY_STAFF,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeeting,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';

import Logger from '../../utils/Logger';
import { createOrReplaceAssociation, submitPartialReplace } from '../../core/data/DataActions';
import { createOrReplaceAssociationWorker, submitPartialReplaceWorker } from '../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp } from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';

const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { MEETINGS, REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('CaseNotesSagas');

/*
 *
 * CaseNotesActions.getMeeting()
 *
 */

function* getMeetingWorker(action :SequenceAction) :Saga<*> {
  const { id } = action;
  const sagaResponse = {};

  try {
    yield put(getMeeting.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const meetingEKID = value;
    const app = yield select(getAppFromState);
    const meetingESID :UUID = getESIDFromApp(app, MEETINGS);

    const response :Object = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: meetingESID, entityKeyId: meetingEKID })
    );
    if (response.error) throw response.error;
    const meeting :Map = fromJS(response.data);
    sagaResponse.data = meeting;
    yield put(getMeeting.success(id, meeting));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getMeeting.failure(id, error));
  }
  finally {
    yield put(getMeeting.finally(id));
  }
  return sagaResponse;
}

function* getMeetingWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MEETING, getMeetingWorker);
}

/*
 *
 * CaseNotesActions.getReentryStaff()
 *
 */

function* getReentryStaffWorker(action :SequenceAction) :Saga<*> {
  const { id } = action;
  const sagaResponse = {};

  try {
    yield put(getReentryStaff.request(id));
    const app = yield select(getAppFromState);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: reentryStaffESID }));
    if (response.error) throw response.error;
    const reentryStaff :List = fromJS(response.data);
    sagaResponse.data = reentryStaff;
    yield put(getReentryStaff.success(id, reentryStaff));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getReentryStaff.failure(id, error));
  }
  finally {
    yield put(getReentryStaff.finally(id));
  }
  return sagaResponse;
}

function* getReentryStaffWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REENTRY_STAFF, getReentryStaffWorker);
}

/*
 *
 * CaseNotesActions.submitCaseNotesAndCompleteTask()
 *
 */

function* submitCaseNotesAndCompleteTaskWorker(action :SequenceAction) :Saga<*> {
  const { id } = action;

  try {
    yield put(submitCaseNotesAndCompleteTask.request(id));
    const { value } = action;
    const { associations, entityData } = value;

    let response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    response = yield call(createOrReplaceAssociationWorker, createOrReplaceAssociation({ associations }));
    if (response.error) throw response.error;

    yield put(submitCaseNotesAndCompleteTask.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitCaseNotesAndCompleteTask.failure(id, error));
  }
  finally {
    yield put(submitCaseNotesAndCompleteTask.finally(id));
  }
}

function* submitCaseNotesAndCompleteTaskWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, submitCaseNotesAndCompleteTaskWorker);
}

export {
  getMeetingWatcher,
  getMeetingWorker,
  getReentryStaffWatcher,
  getReentryStaffWorker,
  submitCaseNotesAndCompleteTaskWatcher,
  submitCaseNotesAndCompleteTaskWorker,
};
