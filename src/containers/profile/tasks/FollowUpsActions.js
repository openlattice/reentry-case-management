// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBMISSION_REQUEST_STATES :'CLEAR_SUBMISSION_REQUEST_STATES' = 'CLEAR_SUBMISSION_REQUEST_STATES';
const clearSubmissionRequestStates = () => ({
  type: CLEAR_SUBMISSION_REQUEST_STATES
});

const CREATE_NEW_FOLLOW_UP :'CREATE_NEW_FOLLOW_UP' = 'CREATE_NEW_FOLLOW_UP';
const createNewFollowUp :RequestSequence = newRequestSequence(CREATE_NEW_FOLLOW_UP);

const GET_FOLLOW_UP_NEIGHBORS :'GET_FOLLOW_UP_NEIGHBORS' = 'GET_FOLLOW_UP_NEIGHBORS';
const getFollowUpNeighbors :RequestSequence = newRequestSequence(GET_FOLLOW_UP_NEIGHBORS);

const LOAD_TASKS :'LOAD_TASKS' = 'LOAD_TASKS';
const loadTasks :RequestSequence = newRequestSequence(LOAD_TASKS);

const MARK_FOLLOW_UP_AS_COMPLETE :'MARK_FOLLOW_UP_AS_COMPLETE' = 'MARK_FOLLOW_UP_AS_COMPLETE';
const markFollowUpAsComplete :RequestSequence = newRequestSequence(MARK_FOLLOW_UP_AS_COMPLETE);

export {
  CLEAR_SUBMISSION_REQUEST_STATES,
  CREATE_NEW_FOLLOW_UP,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  MARK_FOLLOW_UP_AS_COMPLETE,
  clearSubmissionRequestStates,
  createNewFollowUp,
  getFollowUpNeighbors,
  loadTasks,
  markFollowUpAsComplete,
};
