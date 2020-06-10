// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_FOLLOW_UP_NEIGHBORS :'GET_FOLLOW_UP_NEIGHBORS' = 'GET_FOLLOW_UP_NEIGHBORS';
const getFollowUpNeighbors :RequestSequence = newRequestSequence(GET_FOLLOW_UP_NEIGHBORS);

const SEARCH_FOR_TASKS :'SEARCH_FOR_TASKS' = 'SEARCH_FOR_TASKS';
const searchForTasks :RequestSequence = newRequestSequence(SEARCH_FOR_TASKS);

export {
  GET_FOLLOW_UP_NEIGHBORS,
  SEARCH_FOR_TASKS,
  getFollowUpNeighbors,
  searchForTasks,
};
