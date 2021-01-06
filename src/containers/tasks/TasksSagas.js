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
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PEOPLE_FOR_NEW_TASK_FORM,
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  getPeopleForNewTaskForm,
  loadTaskManagerData,
  searchForTasks,
} from './TasksActions';

import Logger from '../../utils/Logger';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { getSearchTerm, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { getFollowUpNeighbors } from '../profile/tasks/FollowUpsActions';
import { FOLLOW_UPS_STATUSES } from '../profile/tasks/FollowUpsConstants';
import { getFollowUpNeighborsWorker } from '../profile/tasks/FollowUpsSagas';
import { getProviders } from '../providers/ProvidersActions';
import { getProvidersWorker } from '../providers/ProvidersSagas';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { FOLLOW_UPS, PEOPLE } = APP_TYPE_FQNS;
const { GENERAL_DATETIME, LAST_NAME, STATUS } = PROPERTY_TYPE_FQNS;

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
          searchCalls.push(call(searchEntitySetDataWorker, searchEntitySetData(searchOptions)));
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
          searchCalls.push(call(searchEntitySetDataWorker, searchEntitySetData(searchOptions)));
        }

        if (status === FOLLOW_UPS_STATUSES.DONE) {
          searchOptions = searchOptionsForCompletedTasks;
          searchCalls.push(call(searchEntitySetDataWorker, searchEntitySetData(searchOptions)));
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
 * TasksActions.getPeopleForNewTaskForm()
 *
 */

function* getPeopleForNewTaskFormWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(getPeopleForNewTaskForm.request(id));

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: peopleESID }));
    if (response.error) throw response.error;
    const people :List = fromJS(response.data)
      .sort((person1 :Map, person2 :Map) => {
        const { [LAST_NAME]: lastName1 } = getEntityProperties(person1, [LAST_NAME]);
        const { [LAST_NAME]: lastName2 } = getEntityProperties(person2, [LAST_NAME]);
        if (lastName1 < lastName2) return -1;
        if (lastName1 > lastName2) return 1;
        return 0;
      });

    yield put(getPeopleForNewTaskForm.success(id, people));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getPeopleForNewTaskForm.failure(id, error));
  }
  finally {
    yield put(getPeopleForNewTaskForm.finally(id));
  }
}

function* getPeopleForNewTaskFormWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PEOPLE_FOR_NEW_TASK_FORM, getPeopleForNewTaskFormWorker);
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
      call(getProvidersWorker, getProviders()),
      call(getPeopleForNewTaskFormWorker, getPeopleForNewTaskForm()),
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
  getPeopleForNewTaskFormWatcher,
  getPeopleForNewTaskFormWorker,
  loadTaskManagerDataWatcher,
  loadTaskManagerDataWorker,
  searchForTasksWatcher,
  searchForTasksWorker,
};
