// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import {
  GET_PEOPLE_BY_JAIL_STAY,
  getPeopleByJailStay,
} from './PeopleActions';
import { getESIDFromApp, getNeighborDetails } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('ParticipantsSagas');
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { JAIL_STAYS, PEOPLE } = APP_TYPE_FQNS;

/*
 *
 * PeopleActions.getPeopleByJailStay()
 *
 */

function* getPeopleByJailStayWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let peopleByJailStayEKID :List = List();

  try {
    yield put(getPeopleByJailStay.request(id));

    const { jailStayEKIDs } = value;
    const app = yield select(getAppFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);

    const searchFilter = {
      entityKeyIds: jailStayEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [peopleESID],
    };

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: jailStaysESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const jailStayNeighbors :Map = fromJS(response.data);
    if (!jailStayNeighbors.isEmpty()) {
      peopleByJailStayEKID = jailStayNeighbors
        .map((neighborList :List) => neighborList
          .map((neighbor :Map) => getNeighborDetails(neighbor)));
    }

    yield put(getPeopleByJailStay.success(id, peopleByJailStayEKID));
  }
  catch (error) {
    LOG.error('caught exception in getPeopleByJailStayWorker()', error);
    yield put(getPeopleByJailStay.failure(id, error));
  }
  finally {
    yield put(getPeopleByJailStay.finally(id));
  }
}

function* getPeopleByJailStayWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PEOPLE_BY_JAIL_STAY, getPeopleByJailStayWorker);
}

export {
  getPeopleByJailStayWatcher,
  getPeopleByJailStayWorker,
};
