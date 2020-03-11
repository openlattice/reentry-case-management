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
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
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
import { getProviders } from '../../providers/ProvidersActions';
import { getProvidersWorker } from '../../providers/ProvidersSagas';
import {
  GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  getEntitiesForNewFollowUpForm,
  getFollowUpNeighbors,
  loadTasks,
} from './FollowUpsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { DST } from '../../../utils/constants/GeneralConstants';

const LOG = new Logger('FollowUpsSagas');
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { FOLLOW_UPS, REENTRY_STAFF } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * FollowUpsActions.getEntitiesForNewFollowUpForm()
 *
 */

function* getEntitiesForNewFollowUpFormWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const sagaResponse :Object = {};

  try {
    yield put(getEntitiesForNewFollowUpForm.request(id));
    const app = yield select(getAppFromState);
    const reentryStaffESID :UUID = getESIDFromApp(app, REENTRY_STAFF);

    const [providersResponse, reentryStaffResponse] = yield all([
      call(getProvidersWorker, getProviders()),
      call(getEntitySetDataWorker, getEntitySetData({ entitySetId: reentryStaffESID })),
    ]);
    if (providersResponse.error) throw providersResponse.error;
    if (reentryStaffResponse.error) throw reentryStaffResponse.error;

    const reentryStaff :List = fromJS(reentryStaffResponse.data);
    sagaResponse.data = reentryStaff;
    yield put(getEntitiesForNewFollowUpForm.success(id, reentryStaff));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getEntitiesForNewFollowUpForm.failure(id, error));
  }
  finally {
    yield put(getEntitiesForNewFollowUpForm.finally(id));
  }
  return sagaResponse;
}

function* getEntitiesForNewFollowUpFormWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, getEntitiesForNewFollowUpFormWorker);
}

/*
 *
 * FollowUpsActions.getFollowUpNeighbors()
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
 * FollowUpsActions.loadTasks()
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
    const [neighborsResponse, participantResponse, formEntitiesResponse] :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
      call(getEntitiesForNewFollowUpFormWorker, getEntitiesForNewFollowUpForm()),
    ]);
    if (neighborsResponse.error) throw neighborsResponse.error;
    if (participantResponse.error) throw participantResponse.error;
    if (formEntitiesResponse.error) throw formEntitiesResponse.error;

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
  getEntitiesForNewFollowUpFormWatcher,
  getEntitiesForNewFollowUpFormWorker,
  getFollowUpNeighborsWatcher,
  getFollowUpNeighborsWorker,
  loadTasksWatcher,
  loadTasksWorker,
};
