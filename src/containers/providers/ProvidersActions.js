// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_EDIT_REQUEST_STATES :'CLEAR_EDIT_REQUEST_STATES' = 'CLEAR_EDIT_REQUEST_STATES';
const clearEditRequestStates = () => ({
  type: CLEAR_EDIT_REQUEST_STATES
});

const ADD_NEW_PROVIDER_CONTACTS :'ADD_NEW_PROVIDER_CONTACTS' = 'ADD_NEW_PROVIDER_CONTACTS';
const addNewProviderContacts :RequestSequence = newRequestSequence(ADD_NEW_PROVIDER_CONTACTS);

const CREATE_NEW_PROVIDER :'CREATE_NEW_PROVIDER' = 'CREATE_NEW_PROVIDER';
const createNewProvider :RequestSequence = newRequestSequence(CREATE_NEW_PROVIDER);

const EDIT_PROVIDER :'EDIT_PROVIDER' = 'EDIT_PROVIDER';
const editProvider :RequestSequence = newRequestSequence(EDIT_PROVIDER);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo :RequestSequence = newRequestSequence(GET_CONTACT_INFO);

const GET_PROVIDERS :'GET_PROVIDERS' = 'GET_PROVIDERS';
const getProviders :RequestSequence = newRequestSequence(GET_PROVIDERS);

const GET_PROVIDER_NEIGHBORS :'GET_PROVIDER_NEIGHBORS' = 'GET_PROVIDER_NEIGHBORS';
const getProviderNeighbors :RequestSequence = newRequestSequence(GET_PROVIDER_NEIGHBORS);

export {
  ADD_NEW_PROVIDER_CONTACTS,
  CLEAR_EDIT_REQUEST_STATES,
  CREATE_NEW_PROVIDER,
  EDIT_PROVIDER,
  GET_CONTACT_INFO,
  GET_PROVIDERS,
  GET_PROVIDER_NEIGHBORS,
  addNewProviderContacts,
  clearEditRequestStates,
  createNewProvider,
  editProvider,
  getContactInfo,
  getProviderNeighbors,
  getProviders,
};
