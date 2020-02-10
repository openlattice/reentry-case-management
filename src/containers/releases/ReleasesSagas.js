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
import { isDefined, isNonEmptyString } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm, getSearchTermNotExact, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { checkIfDatesAreEqual } from '../../utils/DateTimeUtils';
import {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_JAIL_STAYS_BY_PERSON,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES_BY_DATE,
  SEARCH_RELEASES_BY_PERSON_NAME,
  getJailsByJailStayEKID,
  searchJailStaysByPerson,
  searchPeopleByJailStay,
  searchReleasesByDate,
  searchReleasesByPersonName,
} from './ReleasesActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('ReleasesSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { INMATES, JAIL_STAYS, JAILS_PRISONS } = APP_TYPE_FQNS;
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
  let response :Object = {};
  let peopleByJailStayEKID :List = List();

  try {
    yield put(searchPeopleByJailStay.request(id));

    const { jailStayEKIDs } = value;

    const app = yield select(getAppFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const inmatesESID :UUID = getESIDFromApp(app, INMATES);

    const searchFilter = {
      entityKeyIds: jailStayEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [inmatesESID],
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
    }

    yield put(searchPeopleByJailStay.success(id, peopleByJailStayEKID));
  }
  catch (error) {
    LOG.error('caught exception in searchPeopleByJailStayWorker()', error);
    yield put(searchPeopleByJailStay.failure(id, error));
  }
  finally {
    yield put(searchPeopleByJailStay.finally(id));
  }
}

function* searchPeopleByJailStayWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_PEOPLE_BY_JAIL_STAY, searchPeopleByJailStayWorker);
}

/*
 *
 * ReleasesActions.searchReleasesByDate()
 *
 */

function* searchReleasesByDateWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let jailStays :List = List();
  let totalHits :number = 0;

  try {
    yield put(searchReleasesByDate.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const {
      endDate,
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

      yield all([
        call(searchPeopleByJailStayWorker, searchPeopleByJailStay({ jailStayEKIDs })),
        call(getJailsByJailStayEKIDWorker, getJailsByJailStayEKID({ jailStayEKIDs })),
      ]);
    }

    yield put(searchReleasesByDate.success(id, { jailStays, totalHits }));
  }
  catch (error) {
    LOG.error('caught exception in searchReleasesByDateWorker()', error);
    yield put(searchReleasesByDate.failure(id, error));
  }
  finally {
    yield put(searchReleasesByDate.finally(id));
  }
}

function* searchReleasesByDateWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_RELEASES_BY_DATE, searchReleasesByDateWorker);
}

/*
 *
 * ReleasesActions.searchJailStaysByPerson()
 *
 */

function* searchJailStaysByPersonWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let jailStaysByPersonEKID :List = List();

  try {
    yield put(searchJailStaysByPerson.request(id));

    const { peopleEKIDs } = value;

    const app = yield select(getAppFromState);
    const inmatesESID :UUID = getESIDFromApp(app, INMATES);
    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);

    const searchFilter = {
      entityKeyIds: peopleEKIDs,
      destinationEntitySetIds: [jailStaysESID],
      sourceEntitySetIds: [],
    };

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: inmatesESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const peopleNeighborMap :Map = fromJS(response.data);
    if (!peopleNeighborMap.isEmpty()) {
      jailStaysByPersonEKID = peopleNeighborMap
        .map((neighborList :List) => neighborList.get(0))
        .map((neighbor :Map) => getNeighborDetails(neighbor));

      const jailStayEKIDs :UUID[] = [];
      jailStaysByPersonEKID.forEach((jailStay :Map) => {
        const jailStayEKID :UUID = getEKID(jailStay);
        jailStayEKIDs.push(jailStayEKID);
      });

      yield call(getJailsByJailStayEKIDWorker, getJailsByJailStayEKID({ jailStayEKIDs }));
    }

    yield put(searchJailStaysByPerson.success(id, jailStaysByPersonEKID));
  }
  catch (error) {
    LOG.error('caught exception in searchJailStaysByPersonWorker()', error);
    yield put(searchJailStaysByPerson.failure(id, error));
  }
  finally {
    yield put(searchJailStaysByPerson.finally(id));
  }
}

function* searchJailStaysByPersonWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_JAIL_STAYS_BY_PERSON, searchJailStaysByPersonWorker);
}

/*
 *
 * ReleasesActions.searchReleasesByPersonName()
 *
 */

function* searchReleasesByPersonNameWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let people :List = List();
  let totalHits :number = 0;

  try {
    yield put(searchReleasesByPersonName.request(id, value));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const {
      firstName,
      lastName,
      maxHits,
      start,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);

    const inmatesESID :UUID = getESIDFromApp(app, INMATES);

    const searchOptions = {
      entitySetIds: [inmatesESID],
      start,
      maxHits,
      constraints: []
    };

    const firstNamePTID :UUID = getPTIDFromEDM(edm, FIRST_NAME);
    if (firstName.length) {
      const firstNameConstraint = getSearchTerm(firstNamePTID, firstName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: firstNameConstraint,
          fuzzy: true
        }]
      });
    }

    const lastNamePTID :UUID = getPTIDFromEDM(edm, LAST_NAME);
    if (lastName.length) {
      const lastNameConstraint = getSearchTerm(lastNamePTID, lastName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: lastNameConstraint,
          fuzzy: true
        }]
      });
    }

    // get all people
    if (!firstName.length && !lastName.length) {
      const firstNameAllConstraint = getSearchTermNotExact(firstNamePTID, '*');
      const lastNameAllConstraint = getSearchTermNotExact(lastNamePTID, '*');
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: firstNameAllConstraint,
          fuzzy: false
        }]
      });
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: lastNameAllConstraint,
          fuzzy: false
        }]
      });
    }

    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    people = fromJS(response.data.hits);
    totalHits = response.data.numHits;

    if (!people.isEmpty()) {
      const peopleEKIDs :UUID[] = [];
      people.forEach((person :Map) => {
        const personEKID :UUID = getEKID(person);
        peopleEKIDs.push(personEKID);
      });

      yield all([
        call(searchJailStaysByPersonWorker, searchJailStaysByPerson({ peopleEKIDs })),
      ]);
    }

    yield put(searchReleasesByPersonName.success(id, { people, totalHits }));
  }
  catch (error) {
    LOG.error('caught exception in searchReleasesByPersonNameWorker()', error);
    yield put(searchReleasesByPersonName.failure(id, error));
  }
  finally {
    yield put(searchReleasesByPersonName.finally(id));
  }
}

function* searchReleasesByPersonNameWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_RELEASES_BY_PERSON_NAME, searchReleasesByPersonNameWorker);
}

export {
  getJailsByJailStayEKIDWatcher,
  getJailsByJailStayEKIDWorker,
  searchJailStaysByPersonWatcher,
  searchJailStaysByPersonWorker,
  searchPeopleByJailStayWatcher,
  searchPeopleByJailStayWorker,
  searchReleasesByDateWatcher,
  searchReleasesByDateWorker,
  searchReleasesByPersonNameWatcher,
  searchReleasesByPersonNameWorker,
};
