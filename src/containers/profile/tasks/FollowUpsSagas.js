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
import { Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../../utils/DataUtils';
import { getParticipant, getParticipantNeighbors } from '../ProfileActions';
import { getParticipantWorker, getParticipantNeighborsWorker } from '../ProfileSagas';
import {
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  getFollowUpNeighbors,
  loadTasks,
} from './FollowUpsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { DST } from '../../../utils/constants/GeneralConstants';

const LOG = new Logger('TasksSagas');
const { FullyQualifiedName } = Models;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { FOLLOW_UPS, REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * TasksActions.getFollowUpNeighbors()
 *
 */

function* getFollowUpNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getFollowUpNeighbors.request(id));
    const { followUpEKIDs } = value;

    const app = yield select(getAppFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);
    const searchFilter = {
      entityKeyIds: followUpEKIDs,
      sourceEntitySetIds: [reentryStaffESID],
      destinationEntitySetIds: [],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: followUpsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const followUpNeighborMap :Map = Map().withMutations((map :Map) => {
      fromJS(response.data).forEach((neighborList :List, followUpEKID :UUID) => {
        neighborList.forEach((neighbor :Map) => {
          const neighborESID :UUID = getNeighborESID(neighbor);
          const neighborEntityFqn :FullyQualifiedName = getFqnFromApp(app, neighborESID);
          const entity :Map = getNeighborDetails(neighbor);
          map.updateIn([followUpEKID, neighborEntityFqn], List(), (entityList) => entityList.push(entity));
        });
      });
    });

    yield put(getFollowUpNeighbors.success(id, followUpNeighborMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getFollowUpNeighbors.failure(id, error));
  }
  finally {
    yield put(getFollowUpNeighbors.finally(id));
  }
}

function* getFollowUpNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_FOLLOW_UP_NEIGHBORS, getFollowUpNeighborsWorker);
}

/*
 *
 * TasksActions.loadTasks()
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
    const [neighborsResponse, participantResponse] :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
    ]);
    if (neighborsResponse.error) throw neighborsResponse.error;
    if (participantResponse.error) throw participantResponse.error;

    const neighborMap :Map = neighborsResponse.data;
    if (isDefined(get(neighborMap, FOLLOW_UPS))) {
      const followUpEKIDs :UUID[] = [];
      get(neighborMap, FOLLOW_UPS).forEach((followUpEntity :Map) => {
        followUpEKIDs.push(getEKID(followUpEntity));
      });
      yield call(getFollowUpNeighborsWorker, getFollowUpNeighbors({ followUpEKIDs }));
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
  getFollowUpNeighborsWatcher,
  getFollowUpNeighborsWorker,
  loadTasksWatcher,
  loadTasksWorker,
};
