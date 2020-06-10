// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_FOLLOW_UP_NEIGHBORS :'GET_FOLLOW_UP_NEIGHBORS' = 'GET_FOLLOW_UP_NEIGHBORS';
const getFollowUpNeighbors :RequestSequence = newRequestSequence(GET_FOLLOW_UP_NEIGHBORS);

const LOAD_TASK_MANAGER_DATA :'LOAD_TASK_MANAGER_DATA' = 'LOAD_TASK_MANAGER_DATA';
const loadTaskManagerData :RequestSequence = newRequestSequence(LOAD_TASK_MANAGER_DATA);

const SEARCH_FOR_TASKS :'SEARCH_FOR_TASKS' = 'SEARCH_FOR_TASKS';
const searchForTasks :RequestSequence = newRequestSequence(SEARCH_FOR_TASKS);

export {
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  getFollowUpNeighbors,
  loadTaskManagerData,
  searchForTasks,
};
