// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_NEW_PROVIDER :'CREATE_NEW_PROVIDER' = 'CREATE_NEW_PROVIDER';
const createNewProvider :RequestSequence = newRequestSequence(CREATE_NEW_PROVIDER);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo :RequestSequence = newRequestSequence(GET_CONTACT_INFO);

const GET_PROVIDER_NEIGHBORS :'GET_PROVIDER_NEIGHBORS' = 'GET_PROVIDER_NEIGHBORS';
const getProviderNeighbors :RequestSequence = newRequestSequence(GET_PROVIDER_NEIGHBORS);

export {
  CREATE_NEW_PROVIDER,
  GET_CONTACT_INFO,
  GET_PROVIDER_NEIGHBORS,
  createNewProvider,
  getContactInfo,
  getProviderNeighbors,
};
