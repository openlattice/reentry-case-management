// @flow
import {
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
import { isDefined, isNonEmptyString } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { checkIfDatesAreEqual } from '../../utils/DateTimeUtils';
import {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES,
  getJailsByJailStayEKID,
  searchPeopleByJailStay,
  searchReleases,
} from './ReleasesActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('ReleasesSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { JAIL_STAYS, JAILS_PRISONS, PEOPLE } = APP_TYPE_FQNS;
const { FIRST_NAME, LAST_NAME, PROJECTED_RELEASE_DATETIME } = PROPERTY_TYPE_FQNS;

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

    const { updatedJailStayEKIDList } = value;
    const jailStayEKIDs :string[] = updatedJailStayEKIDList.toJS();

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
        .map((neighborList :List) => neighborList.get(0))
        .map((neighbor :Map) => getNeighborDetails(neighbor));
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
 * ReleasesActions.searchPeopleByJailStay()
 *
 */

function* searchPeopleByJailStayWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};
  let response :Object = {};
  let peopleByJailStayEKID :List = List();
  let updatedJailStayEKIDList :List = List();

  try {
    yield put(searchPeopleByJailStay.request(id));

    const { firstName, jailStayEKIDs, lastName } = value;
    console.log(firstName, ' ', lastName);
    const trimmedInputFirstName :string = firstName.trim().toLowerCase();
    const trimmedInputLastName :string = lastName.trim().toLowerCase();
    console.log('trimmedInputFirstName ', trimmedInputFirstName);
    console.log('trimmedInputLastName ', trimmedInputLastName);

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
    const jailStayNeighborMap :Map = fromJS(response.data);
    if (!jailStayNeighborMap.isEmpty()) {
      peopleByJailStayEKID = jailStayNeighborMap
        .map((neighborList :List) => neighborList.get(0))
        .map((neighbor :Map) => getNeighborDetails(neighbor));

      if (firstName.length || lastName.length) {
        console.log(firstName, ' ', lastName);
        peopleByJailStayEKID = peopleByJailStayEKID.filter((person :Map) => {
          // $FlowFixMe
          const { [FIRST_NAME]: personFirstName, [LAST_NAME]: personLastName } = getEntityProperties(
            person,
            [FIRST_NAME, LAST_NAME]
          );
          const trimmedFirstName :string = personFirstName.trim().toLowerCase();
          const trimmedLastName :string = personLastName.trim().toLowerCase();
          console.log('trimmedFirstName ', trimmedFirstName);
          console.log('trimmedLastName ', trimmedLastName);
          console.log('trimmedInputFirstName.length: ', trimmedInputFirstName.length)
          console.log(trimmedFirstName.includes(trimmedInputFirstName) || trimmedLastName.includes(trimmedInputLastName));
          return (trimmedFirstName.includes(trimmedInputFirstName) && trimmedInputFirstName.length)
            || (trimmedLastName.includes(trimmedInputLastName) && trimmedInputLastName.length);
        });
        console.log('peopleByJailStayEKID.toJS() ', peopleByJailStayEKID.toJS());
      }

      updatedJailStayEKIDList = peopleByJailStayEKID.keySeq().toList();
      console.log('updatedJailStayEKIDList.toJS() ', updatedJailStayEKIDList.toJS());
      workerResponse.data = updatedJailStayEKIDList;
    }

    yield put(searchPeopleByJailStay.success(id, peopleByJailStayEKID));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in searchPeopleByJailStayWorker()', error);
    yield put(searchPeopleByJailStay.failure(id, error));
  }
  finally {
    yield put(searchPeopleByJailStay.finally(id));
  }
  return workerResponse;
}

function* searchPeopleByJailStayWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_PEOPLE_BY_JAIL_STAY, searchPeopleByJailStayWorker);
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
  let totalHits :number = 0;

  try {
    yield put(searchReleases.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const {
      endDate,
      firstName,
      lastName,
      maxHits,
      start,
      startDate,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);

    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const projectedReleaseDateTimePTID :UUID = getPTIDFromEDM(edm, PROJECTED_RELEASE_DATETIME);

    const searchOptions = {
      entitySetIds: [jailStaysESID],
      start,
      maxHits,
      constraints: []
    };
    let searchTerm :string = '';

    if (checkIfDatesAreEqual(startDate, endDate)) {
      searchTerm = getSearchTerm(projectedReleaseDateTimePTID, startDate);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
    }
    else {
      const startDateAsDateTime :DateTime = DateTime.fromISO(startDate);
      if (isNonEmptyString(endDate)) {
        const endDateAsDateTime :DateTime = DateTime.fromISO(endDate);
        searchTerm = getUTCDateRangeSearchString(
          projectedReleaseDateTimePTID,
          'day',
          startDateAsDateTime,
          endDateAsDateTime
        );
      }
      else {
        searchTerm = getUTCDateRangeSearchString(
          projectedReleaseDateTimePTID,
          'day',
          startDateAsDateTime
        );
      }
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
    }
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    jailStays = fromJS(response.data.hits);
    totalHits = response.data.numHits;

    if (!jailStays.isEmpty()) {
      const jailStayEKIDs :UUID[] = [];
      jailStays.forEach((jailStay :Map) => {
        const jailStayEKID :UUID = getEKID(jailStay);
        jailStayEKIDs.push(jailStayEKID);
      });

      response = yield call(
        searchPeopleByJailStayWorker,
        searchPeopleByJailStay({ firstName, jailStayEKIDs, lastName })
      );
      if (response.error) {
        throw response.error;
      }
      const updatedJailStayEKIDList :List = response.data;

      yield call(getJailsByJailStayEKIDWorker, getJailsByJailStayEKID({ updatedJailStayEKIDList }));

      jailStays = jailStays.filter((jailStay :Map) => updatedJailStayEKIDList.includes(getEKID(jailStay)));
      if (jailStays.count() !== updatedJailStayEKIDList.count()) totalHits = jailStays.count();
    }

    yield put(searchReleases.success(id, { jailStays, totalHits }));
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
  searchPeopleByJailStayWatcher,
  searchPeopleByJailStayWorker,
  searchReleasesWatcher,
  searchReleasesWorker
};
