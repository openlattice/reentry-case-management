// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import { getPeopleByJailStay } from '../people/PeopleActions';
import { getPeopleByJailStayWorker } from '../people/PeopleSagas';
import {
  getEKID,
  getESIDFromApp,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { checkIfDatesAreEqual } from '../../utils/DateTimeUtils';
import {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_RELEASES,
  getJailsByJailStayEKID,
  searchReleases,
} from './ReleasesActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('ReleasesSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { JAIL_STAYS, JAILS_PRISONS } = APP_TYPE_FQNS;
const { PROJECTED_RELEASE_DATETIME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

/*
 *
 * ReleasesActions.getJailsByJailStayEKID()
 *
 */

function* getJailsByJailStayEKIDWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let jailsByJailStayEKID :List = List();

  try {
    yield put(getJailsByJailStayEKID.request(id));

    const { jailStayEKIDs } = value;
    const app = yield select(getAppFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const jailsPrisonsESID :UUID = getESIDFromApp(app, JAILS_PRISONS);

    const searchFilter = {
      entityKeyIds: jailStayEKIDs,
      destinationEntitySetIds: [jailsPrisonsESID],
      sourceEntitySetIds: [],
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
      jailsByJailStayEKID = jailStayNeighbors
        .map((neighborList :List) => neighborList
          .map((neighbor :Map) => getNeighborDetails(neighbor)));
    }

    yield put(getJailsByJailStayEKID.success(id, jailsByJailStayEKID));
  }
  catch (error) {
    LOG.error('caught exception in getJailsByJailStayEKIDWorker()', error);
    yield put(getJailsByJailStayEKID.failure(id, error));
  }
  finally {
    yield put(getJailsByJailStayEKID.finally(id));
  }
}

function* getJailsByJailStayEKIDWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_JAILS_BY_JAIL_STAY_EKID, getJailsByJailStayEKIDWorker);
}

/*
 *
 * ReleasesActions.searchReleases()
 *
 */

function* searchReleasesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let jailStays :List = List();

  try {
    yield put(searchReleases.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const {
      endDate,
      firstName,
      lastName,
      startDate,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);

    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const projectedReleaseDateTimePTID :UUID = getPTIDFromEDM(edm, PROJECTED_RELEASE_DATETIME);

    const searchOptions = {
      entitySetIds: [jailStaysESID],
      start: 0,
      maxHits: 10000,
      constraints: [{
        min: 1,
        constraints: []
      }]
    };
    let searchTerm :string = '';

    if (checkIfDatesAreEqual(startDate, endDate)) {
      searchTerm = getSearchTerm(projectedReleaseDateTimePTID, startDate);
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }
    else {
      const startDateAsDateTime :DateTime = DateTime.fromISO(startDate);
      const endDateAsDateTime :DateTime = DateTime.fromISO(endDate);
      searchTerm = getUTCDateRangeSearchString(
        projectedReleaseDateTimePTID,
        'day',
        startDateAsDateTime,
        endDateAsDateTime
      );
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }

    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    jailStays = fromJS(response.data.hits);

    if (!jailStays.isEmpty()) {
      const jailStayEKIDs :UUID[] = [];
      jailStays.forEach((jailStay :Map) => {
        const jailStayEKID :UUID = getEKID(jailStay);
        jailStayEKIDs.push(jailStayEKID);
      });

      yield all([
        call(getPeopleByJailStayWorker, getPeopleByJailStay({ jailStayEKIDs })),
        call(getJailsByJailStayEKID, getJailsByJailStayEKID({ jailStayEKIDs })),
      ]);
    }

    yield put(searchReleases.success(id, jailStays));
  }
  catch (error) {
    LOG.error('caught exception in searchReleasesWorker()', error);
    yield put(searchReleases.failure(id, error));
  }
  finally {
    yield put(searchReleases.finally(id));
  }
}

function* searchReleasesWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_RELEASES, searchReleasesWorker);
}

export {
  getJailsByJailStayEKIDWatcher,
  getJailsByJailStayEKIDWorker,
  searchReleasesWatcher,
  searchReleasesWorker
};
