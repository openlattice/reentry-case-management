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
  merge,
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_MEETING_AND_TASK,
  GET_REENTRY_STAFF,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeetingAndTask,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';

import Logger from '../../utils/Logger';
import { createOrReplaceAssociation, submitPartialReplace } from '../../core/data/DataActions';
import { createOrReplaceAssociationWorker, submitPartialReplaceWorker } from '../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp, getNeighborDetails } from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';

const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { FOLLOW_UPS, MEETINGS, REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('CaseNotesSagas');

/*
 *
 * CaseNotesActions.getMeetingAndTask()
 *
 */

function* getMeetingAndTaskWorker(action :SequenceAction) :Saga<*> {
  const { id } = action;

  try {
    yield put(getMeetingAndTask.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const meetingEKID = value;
    const app = yield select(getAppFromState);
    const meetingESID :UUID = getESIDFromApp(app, MEETINGS);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const filter = {
      entityKeyIds: [meetingEKID],
      sourceEntitySetIds: [],
      destinationEntitySetIds: [followUpsESID],
    };

    const [getMeetingResponse, getTaskResponse] = yield all([
      call(
        getEntityDataWorker,
        getEntityData({ entitySetId: meetingESID, entityKeyId: meetingEKID })
      ),
      call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: meetingESID, filter })
      ),
    ]);
    if (getMeetingResponse.error) throw getMeetingResponse.error;
    if (getTaskResponse.error) throw getTaskResponse.error;

    const meeting :Map = fromJS(getMeetingResponse.data);

    const neighbors :Map = fromJS(getTaskResponse.data);
    const task :Map = getNeighborDetails(neighbors.getIn([meetingEKID, 0], Map()));

    yield put(getMeetingAndTask.success(id, { meeting, task }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getMeetingAndTask.failure(id, error));
  }
  finally {
    yield put(getMeetingAndTask.finally(id));
  }
}

function* getMeetingAndTaskWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MEETING_AND_TASK, getMeetingAndTaskWorker);
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
  getMeetingAndTaskWatcher,
  getMeetingAndTaskWorker,
  getReentryStaffWatcher,
  getReentryStaffWorker,
  submitCaseNotesAndCompleteTaskWatcher,
  submitCaseNotesAndCompleteTaskWorker,
};
