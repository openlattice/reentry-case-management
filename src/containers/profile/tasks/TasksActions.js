// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_FOLLOW_UP_NEIGHBORS :'GET_FOLLOW_UP_NEIGHBORS' = 'GET_FOLLOW_UP_NEIGHBORS';
const getFollowUpNeighbors :RequestSequence = newRequestSequence(GET_FOLLOW_UP_NEIGHBORS);

const LOAD_TASKS :'LOAD_TASKS' = 'LOAD_TASKS';
const loadTasks :RequestSequence = newRequestSequence(LOAD_TASKS);

export {
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  getFollowUpNeighbors,
  loadTasks,
};
