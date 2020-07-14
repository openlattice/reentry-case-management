// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_RESULTS :'CLEAR_SEARCH_RESULTS' = 'CLEAR_SEARCH_RESULTS';
const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS
});

const GET_JAILS_BY_JAIL_STAY_EKID :'GET_JAILS_BY_JAIL_STAY_EKID' = 'GET_JAILS_BY_JAIL_STAY_EKID';
const getJailsByJailStayEKID :RequestSequence = newRequestSequence(GET_JAILS_BY_JAIL_STAY_EKID);

const SEARCH_PEOPLE_BY_JAIL_STAY :'SEARCH_PEOPLE_BY_JAIL_STAY' = 'SEARCH_PEOPLE_BY_JAIL_STAY';
const searchPeopleByJailStay :RequestSequence = newRequestSequence(SEARCH_PEOPLE_BY_JAIL_STAY);

const SEARCH_JAIL_STAYS_BY_PERSON :'SEARCH_JAIL_STAYS_BY_PERSON' = 'SEARCH_JAIL_STAYS_BY_PERSON';
const searchJailStaysByPerson :RequestSequence = newRequestSequence(SEARCH_JAIL_STAYS_BY_PERSON);

const SEARCH_RELEASES_BY_DATE :'SEARCH_RELEASES_BY_DATE' = 'SEARCH_RELEASES_BY_DATE';
const searchReleasesByDate :RequestSequence = newRequestSequence(SEARCH_RELEASES_BY_DATE);

const SEARCH_RELEASES_BY_PERSON_NAME :'SEARCH_RELEASES_BY_PERSON_NAME' = 'SEARCH_RELEASES_BY_PERSON_NAME';
const searchReleasesByPersonName :RequestSequence = newRequestSequence(SEARCH_RELEASES_BY_PERSON_NAME);

const SELECT_RELEASE_RESULT :'SELECT_RELEASE_RESULT' = 'SELECT_RELEASE_RESULT';
const selectReleaseResult = (value :any) => ({
  type: SELECT_RELEASE_RESULT,
  value,
});

export {
  CLEAR_SEARCH_RESULTS,
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_JAIL_STAYS_BY_PERSON,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES_BY_DATE,
  SEARCH_RELEASES_BY_PERSON_NAME,
  SELECT_RELEASE_RESULT,
  clearSearchResults,
  getJailsByJailStayEKID,
  searchJailStaysByPerson,
  searchPeopleByJailStay,
  searchReleasesByDate,
  searchReleasesByPersonName,
  selectReleaseResult,
};
