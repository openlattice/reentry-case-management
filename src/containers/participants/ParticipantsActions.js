// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_RESULTS :'CLEAR_SEARCH_RESULTS' = 'CLEAR_SEARCH_RESULTS';
const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS
});

const GET_JAIL_NAMES_FOR_JAIL_STAYS :'GET_JAIL_NAMES_FOR_JAIL_STAYS' = 'GET_JAIL_NAMES_FOR_JAIL_STAYS';
const getJailNamesForJailStays :RequestSequence = newRequestSequence(GET_JAIL_NAMES_FOR_JAIL_STAYS);

const GET_PARTICIPANT_NEIGHBORS :'GET_PARTICIPANT_NEIGHBORS' = 'GET_PARTICIPANT_NEIGHBORS';
const getParticipantNeighbors :RequestSequence = newRequestSequence(GET_PARTICIPANT_NEIGHBORS);

const SEARCH_PARTICIPANTS :'SEARCH_PARTICIPANTS' = 'SEARCH_PARTICIPANTS';
const searchParticipants :RequestSequence = newRequestSequence(SEARCH_PARTICIPANTS);

export {
  CLEAR_SEARCH_RESULTS,
  GET_JAIL_NAMES_FOR_JAIL_STAYS,
  GET_PARTICIPANT_NEIGHBORS,
  SEARCH_PARTICIPANTS,
  clearSearchResults,
  getJailNamesForJailStays,
  getParticipantNeighbors,
  searchParticipants,
};
