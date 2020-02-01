// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_JAILS_BY_JAIL_STAY_EKID :'GET_JAILS_BY_JAIL_STAY_EKID' = 'GET_JAILS_BY_JAIL_STAY_EKID';
const getJailsByJailStayEKID :RequestSequence = newRequestSequence(GET_JAILS_BY_JAIL_STAY_EKID);

const SEARCH_PEOPLE_BY_JAIL_STAY :'SEARCH_PEOPLE_BY_JAIL_STAY' = 'SEARCH_PEOPLE_BY_JAIL_STAY';
const searchPeopleByJailStay :RequestSequence = newRequestSequence(SEARCH_PEOPLE_BY_JAIL_STAY);

const SEARCH_RELEASES :'SEARCH_RELEASES' = 'SEARCH_RELEASES';
const searchReleases :RequestSequence = newRequestSequence(SEARCH_RELEASES);

export {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES,
  getJailsByJailStayEKID,
  searchPeopleByJailStay,
  searchReleases,
};
