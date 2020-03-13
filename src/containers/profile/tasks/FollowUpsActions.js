// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_ADD_REQUEST_STATE :'CLEAR_ADD_REQUEST_STATE' = 'CLEAR_ADD_REQUEST_STATE';
const clearAddRequestState = () => ({
  type: CLEAR_ADD_REQUEST_STATE
});

const CREATE_NEW_FOLLOW_UP :'CREATE_NEW_FOLLOW_UP' = 'CREATE_NEW_FOLLOW_UP';
const createNewFollowUp :RequestSequence = newRequestSequence(CREATE_NEW_FOLLOW_UP);

const GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM
  :'GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM' = 'GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM';
const getEntitiesForNewFollowUpForm :RequestSequence = newRequestSequence(GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM);

const GET_FOLLOW_UP_NEIGHBORS :'GET_FOLLOW_UP_NEIGHBORS' = 'GET_FOLLOW_UP_NEIGHBORS';
const getFollowUpNeighbors :RequestSequence = newRequestSequence(GET_FOLLOW_UP_NEIGHBORS);

const LOAD_TASKS :'LOAD_TASKS' = 'LOAD_TASKS';
const loadTasks :RequestSequence = newRequestSequence(LOAD_TASKS);

export {
  CLEAR_ADD_REQUEST_STATE,
  CREATE_NEW_FOLLOW_UP,
  GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  clearAddRequestState,
  createNewFollowUp,
  getEntitiesForNewFollowUpForm,
  getFollowUpNeighbors,
  loadTasks,
};
