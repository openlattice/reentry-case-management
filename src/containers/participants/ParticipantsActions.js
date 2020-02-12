// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_JAIL_NAMES_FOR_JAIL_STAYS :'GET_JAIL_NAMES_FOR_JAIL_STAYS' = 'GET_JAIL_NAMES_FOR_JAIL_STAYS';
const getJailNamesForJailStays :RequestSequence = newRequestSequence(GET_JAIL_NAMES_FOR_JAIL_STAYS);

const GET_PARTICIPANT_NEIGHBORS :'GET_PARTICIPANT_NEIGHBORS' = 'GET_PARTICIPANT_NEIGHBORS';
const getParticipantNeighbors :RequestSequence = newRequestSequence(GET_PARTICIPANT_NEIGHBORS);

const SEARCH_PARTICIPANTS :'SEARCH_PARTICIPANTS' = 'SEARCH_PARTICIPANTS';
const searchParticipants :RequestSequence = newRequestSequence(SEARCH_PARTICIPANTS);

export {
  GET_JAIL_NAMES_FOR_JAIL_STAYS,
  GET_PARTICIPANT_NEIGHBORS,
  SEARCH_PARTICIPANTS,
  getJailNamesForJailStays,
  getParticipantNeighbors,
  searchParticipants,
};
