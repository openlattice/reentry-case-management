// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo :RequestSequence = newRequestSequence(GET_CONTACT_INFO);

const GET_PROVIDER_NEIGHBORS :'GET_PROVIDER_NEIGHBORS' = 'GET_PROVIDER_NEIGHBORS';
const getProviderNeighbors :RequestSequence = newRequestSequence(GET_PROVIDER_NEIGHBORS);

export {
  GET_CONTACT_INFO,
  GET_PROVIDER_NEIGHBORS,
  getContactInfo,
  getProviderNeighbors,
};
