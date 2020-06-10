// @flow
import {
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
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { Models } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  getAssociationESID,
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm } from '../../utils/SearchUtils';
import {
  GET_FOLLOW_UP_NEIGHBORS,
  SEARCH_FOR_TASKS,
  getFollowUpNeighbors,
  searchForTasks,
} from './TasksActions';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { FOLLOW_UPS_STATUSES } from '../profile/tasks/FollowUpsConstants';

const { FullyQualifiedName } = Models;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  FOLLOW_UPS,
  MEETINGS,
  PEOPLE,
  PROVIDER,
  REENTRY_STAFF,
} = APP_TYPE_FQNS;
const { STATUS } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const LOG = new Logger('TasksSagas');

/*
 *
 * TasksActions.getFollowUpNeighbors()
 *
 */

function* getFollowUpNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(getFollowUpNeighbors.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { followUpEKIDs } = value;

    const app = yield select(getAppFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    const searchFilter = {
      entityKeyIds: followUpEKIDs,
      sourceEntitySetIds: [meetingsESID, peopleESID, providerESID, reentryStaffESID],
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
          // store reentry staff by their association ESIDs (reported vs. assigned to)
          const associationESID :UUID = getAssociationESID(neighbor);
          const neighborESID :UUID = getNeighborESID(neighbor);
          let esidToUseAsKey :UUID = associationESID;
          if (neighborESID === meetingsESID || neighborESID === providerESID) esidToUseAsKey = neighborESID;
          const fqn :FullyQualifiedName = getFqnFromApp(app, esidToUseAsKey);
          const entity :Map = getNeighborDetails(neighbor);
          map.update(followUpEKID, Map(), (entitiesMap) => entitiesMap.set(fqn, entity));
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
 * TasksActions.searchForTasks()
 *
 */

function* searchForTasksWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(searchForTasks.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { completed } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const statusPTID :UUID = getPTIDFromEDM(edm, STATUS);

    const searchOptions = {
      entitySetIds: [followUpsESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };

    const searchString :string = completed ? FOLLOW_UPS_STATUSES.DONE : FOLLOW_UPS_STATUSES.PENDING;
    const statusConstraint = getSearchTerm(statusPTID, searchString);
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm: statusConstraint,
        fuzzy: true
      }]
    });
    const response :Object = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    const followUps :List = fromJS(response.data.hits);

    if (response.data.numHits) {
      const followUpEKIDs :UUID[] = [];
      followUps.forEach((followUp :Map) => followUpEKIDs.push(getEKID(followUp)));

      yield call(getFollowUpNeighborsWorker, getFollowUpNeighbors({ followUpEKIDs }));
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

export {
  getFollowUpNeighborsWatcher,
  getFollowUpNeighborsWorker,
  searchForTasksWatcher,
  searchForTasksWorker,
};
