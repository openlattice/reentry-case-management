// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_PARTICIPANTS :'CLEAR_PARTICIPANTS' = 'CLEAR_PARTICIPANTS';
const clearParticipants = () => ({
  type: CLEAR_PARTICIPANTS
});

const CREATE_SUBSCRIPTION :'CREATE_SUBSCRIPTION' = 'CREATE_SUBSCRIPTION';
const createSubscription :RequestSequence = newRequestSequence(CREATE_SUBSCRIPTION);

const EXPIRE_SUBSCRIPTION :'EXPIRE_SUBSCRIPTION' = 'EXPIRE_SUBSCRIPTION';
const expireSubscription :RequestSequence = newRequestSequence(EXPIRE_SUBSCRIPTION);

const GET_PEOPLE_FOR_NEW_TASK_FORM :'GET_PEOPLE_FOR_NEW_TASK_FORM' = 'GET_PEOPLE_FOR_NEW_TASK_FORM';
const getPeopleForNewTaskForm :RequestSequence = newRequestSequence(GET_PEOPLE_FOR_NEW_TASK_FORM);

const GET_SUBSCRIPTIONS :'GET_SUBSCRIPTIONS' = 'GET_SUBSCRIPTIONS';
const getSubscriptions :RequestSequence = newRequestSequence(GET_SUBSCRIPTIONS);

const LOAD_TASK_MANAGER_DATA :'LOAD_TASK_MANAGER_DATA' = 'LOAD_TASK_MANAGER_DATA';
const loadTaskManagerData :RequestSequence = newRequestSequence(LOAD_TASK_MANAGER_DATA);

const SEARCH_FOR_TASKS :'SEARCH_FOR_TASKS' = 'SEARCH_FOR_TASKS';
const searchForTasks :RequestSequence = newRequestSequence(SEARCH_FOR_TASKS);

const UPDATE_SUBSCRIPTION :'UPDATE_SUBSCRIPTION' = 'UPDATE_SUBSCRIPTION';
const updateSubscription :RequestSequence = newRequestSequence(UPDATE_SUBSCRIPTION);

export {
  CLEAR_PARTICIPANTS,
  CREATE_SUBSCRIPTION,
  EXPIRE_SUBSCRIPTION,
  GET_PEOPLE_FOR_NEW_TASK_FORM,
  GET_SUBSCRIPTIONS,
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  UPDATE_SUBSCRIPTION,
  clearParticipants,
  createSubscription,
  expireSubscription,
  getPeopleForNewTaskForm,
  getSubscriptions,
  loadTaskManagerData,
  searchForTasks,
  updateSubscription,
};
