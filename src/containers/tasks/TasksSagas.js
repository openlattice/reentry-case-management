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
} from 'immutable';
import { DateTime } from 'luxon';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import {
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  loadTaskManagerData,
  searchForTasks,
} from './TasksActions';
import { getEntitiesForNewFollowUpForm, getFollowUpNeighbors } from '../profile/tasks/FollowUpsActions';
import { getEntitiesForNewFollowUpFormWorker, getFollowUpNeighborsWorker } from '../profile/tasks/FollowUpsSagas';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { FOLLOW_UPS_STATUSES } from '../profile/tasks/FollowUpsConstants';

const { executeSearch } = SearchApiActions;
const { executeSearchWorker } = SearchApiSagas;
const {
  FOLLOW_UPS,
} = APP_TYPE_FQNS;
const { GENERAL_DATETIME, STATUS } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const LOG = new Logger('TasksSagas');

/*
 *
 * TasksActions.searchForTasks()
 *
 */

function* searchForTasksWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;
  let followUps :List = List();

  try {
    yield put(searchForTasks.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { statuses } = value;

    if (isDefined(statuses) && statuses.length) {
      const app = yield select(getAppFromState);
      const edm = yield select(getEdmFromState);
      const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
      const statusPTID :UUID = getPTIDFromEDM(edm, STATUS);

      const searchOptionsForLateTasks = {
        entitySetIds: [followUpsESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      const searchOptionsForPendingTasks = {
        entitySetIds: [followUpsESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      const searchOptionsForCompletedTasks = {
        entitySetIds: [followUpsESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      const searchCalls = [];

      statuses.forEach((status :string) => {
        let searchString :string = status;
        let searchOptions = {};

        const yesterday = DateTime.local().minus({ days: 1 }).endOf('day');
        const dueDatePTID :UUID = getPTIDFromEDM(edm, GENERAL_DATETIME);

        if (status === FOLLOW_UPS_STATUSES.LATE) {
          searchString = FOLLOW_UPS_STATUSES.PENDING;
          searchOptions = searchOptionsForLateTasks;
          const datetimeSearchTerm = getUTCDateRangeSearchString(dueDatePTID, 'day', undefined, yesterday);
          searchOptions.constraints.push({
            min: 1,
            constraints: [{
              searchTerm: datetimeSearchTerm,
              fuzzy: false
            }]
          });
          searchCalls.push(call(executeSearchWorker, executeSearch({ searchOptions })));
        }

        if (status === FOLLOW_UPS_STATUSES.PENDING) {
          searchOptions = searchOptionsForPendingTasks;
          const datetimeSearchTerm = getUTCDateRangeSearchString(dueDatePTID, 'day', yesterday, undefined);
          searchOptionsForPendingTasks.constraints.push({
            min: 1,
            constraints: [{
              searchTerm: datetimeSearchTerm,
              fuzzy: false
            }]
          });
          searchCalls.push(call(executeSearchWorker, executeSearch({ searchOptions })));
        }

        if (status === FOLLOW_UPS_STATUSES.DONE) {
          searchOptions = searchOptionsForCompletedTasks;
          searchCalls.push(call(executeSearchWorker, executeSearch({ searchOptions })));
        }

        const statusConstraint = getSearchTerm(statusPTID, searchString);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: statusConstraint,
            fuzzy: true
          }]
        });
      });

      const responses :Object[] = yield all(searchCalls);
      const responseError = responses.reduce(
        (error :any, r :Object) => (isDefined(error) ? error : r.error),
        undefined,
      );
      if (responseError) throw responseError;
      responses.forEach((response :Object) => {
        followUps = followUps.concat(fromJS(response.data.hits));
      });

      if (!followUps.isEmpty()) {
        const followUpEKIDs :UUID[] = [];
        followUps.forEach((followUp :Map) => followUpEKIDs.push(getEKID(followUp)));

        yield call(getFollowUpNeighborsWorker, getFollowUpNeighbors({ followUpEKIDs }));
      }
    }

    yield put(searchForTasks.success(id, followUps));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchForTasks.failure(id, error));
  }
  finally {
    yield put(searchForTasks.finally(id));
  }
}

function* searchForTasksWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_FOR_TASKS, searchForTasksWorker);
}

/*
 *
 * TasksActions.loadTaskManagerData()
 *
 */

function* loadTaskManagerDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(loadTaskManagerData.request(id));

    yield all([
      call(searchForTasksWorker, searchForTasks({ statuses: [] })),
      call(getEntitiesForNewFollowUpFormWorker, getEntitiesForNewFollowUpForm()),
    ]);

    yield put(loadTaskManagerData.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadTaskManagerData.failure(id, error));
  }
  finally {
    yield put(loadTaskManagerData.finally(id));
  }
}

function* loadTaskManagerDataWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_TASK_MANAGER_DATA, loadTaskManagerDataWorker);
}

export {
  // getFollowUpNeighborsWatcher,
  // getFollowUpNeighborsWorker,
  loadTaskManagerDataWatcher,
  loadTaskManagerDataWorker,
  searchForTasksWatcher,
  searchForTasksWorker,
};
