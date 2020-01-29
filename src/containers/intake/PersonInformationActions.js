// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_INCARCERATION_FACILITIES :'GET_INCARCERATION_FACILITIES' = 'GET_INCARCERATION_FACILITIES';
const getIncarcerationFacilities :RequestSequence = newRequestSequence(GET_INCARCERATION_FACILITIES);

export {
  GET_INCARCERATION_FACILITIES,
  getIncarcerationFacilities,
};
