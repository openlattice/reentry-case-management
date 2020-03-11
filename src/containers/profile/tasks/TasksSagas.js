// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getESIDFromApp } from '../../../utils/DataUtils';
import { getParticipant, getParticipantNeighbors } from '../ProfileActions';
import { getParticipantWorker, getParticipantNeighborsWorker } from '../ProfileSagas';
import {
  LOAD_TASKS,
  loadTasks,
} from './TasksActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { DST } from '../../../utils/constants/GeneralConstants';

const LOG = new Logger('TasksSagas');
const { FOLLOW_UPS } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * ProfileActions.loadTasks()
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
  loadTasksWatcher,
  loadTasksWorker,
};
