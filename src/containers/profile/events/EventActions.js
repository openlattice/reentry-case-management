// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PROVIDERS :'GET_PROVIDERS' = 'GET_PROVIDERS';
const getProviders :RequestSequence = newRequestSequence(GET_PROVIDERS);

export {
  GET_PROVIDERS,
  getProviders,
};
