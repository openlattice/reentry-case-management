// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PEOPLE_BY_JAIL_STAY :'GET_PEOPLE_BY_JAIL_STAY' = 'GET_PEOPLE_BY_JAIL_STAY';
const getPeopleByJailStay :RequestSequence = newRequestSequence(GET_PEOPLE_BY_JAIL_STAY);

export {
  GET_PEOPLE_BY_JAIL_STAY,
  getPeopleByJailStay,
};
