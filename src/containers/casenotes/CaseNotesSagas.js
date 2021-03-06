/*
 * @flow
 */

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
import { LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_MEETING_AND_TASK,
  GET_STAFF_WHO_RECORDED_NOTES,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeetingAndTask,
  getStaffWhoRecordedNotes,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';

import { createOrReplaceAssociation, submitPartialReplace } from '../../core/data/DataActions';
import { createOrReplaceAssociationWorker, submitPartialReplaceWorker } from '../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp, getNeighborDetails } from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP } from '../../utils/constants/ReduxStateConstants';

const { isDefined } = LangUtils;
const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
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

function* getMeetingAndTaskWatcher() :Saga<*> {

  yield takeEvery(GET_MEETING_AND_TASK, getMeetingAndTaskWorker);
}

/*
 *
 * CaseNotesActions.getStaffWhoRecordedNotes()
 *
 */

function* getStaffWhoRecordedNotesWorker(action :SequenceAction) :Saga<*> {
  const { id } = action;

  try {
    yield put(getStaffWhoRecordedNotes.request(id));
    const { value } = action;
    const { meetingEKIDs } = value;

    const app = yield select(getAppFromState);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);

    const searchFilter = {
      entityKeyIds: meetingEKIDs,
      sourceEntitySetIds: [],
      destinationEntitySetIds: [reentryStaffESID],
    };
    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: meetingsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;

    const staffByMeetingEKID = Map().withMutations((mutator :Map) => {
      fromJS(response.data).forEach((neighborList :List, meetingEKID :UUID) => {
        const staffMemberRecordedBy :Map = getNeighborDetails(neighborList.get(0));
        mutator.set(meetingEKID, staffMemberRecordedBy);
      });
    });

    yield put(getStaffWhoRecordedNotes.success(id, staffByMeetingEKID));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStaffWhoRecordedNotes.failure(id, error));
  }
  finally {
    yield put(getStaffWhoRecordedNotes.finally(id));
  }
}

function* getStaffWhoRecordedNotesWatcher() :Saga<*> {

  yield takeEvery(GET_STAFF_WHO_RECORDED_NOTES, getStaffWhoRecordedNotesWorker);
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
    const { associations, meetingEntityData, taskEntityData } = value;

    const entityData = merge(meetingEntityData, taskEntityData);

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

function* submitCaseNotesAndCompleteTaskWatcher() :Saga<*> {

  yield takeEvery(SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, submitCaseNotesAndCompleteTaskWorker);
}

export {
  getMeetingAndTaskWatcher,
  getMeetingAndTaskWorker,
  getStaffWhoRecordedNotesWatcher,
  getStaffWhoRecordedNotesWorker,
  submitCaseNotesAndCompleteTaskWatcher,
  submitCaseNotesAndCompleteTaskWorker,
};
