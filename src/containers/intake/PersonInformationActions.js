// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_INCARCERATION_FACILITIES :'GET_INCARCERATION_FACILITIES' = 'GET_INCARCERATION_FACILITIES';
const getIncarcerationFacilities :RequestSequence = newRequestSequence(GET_INCARCERATION_FACILITIES);

const SUBMIT_PERSON_INFORMATION_FORM :'SUBMIT_PERSON_INFORMATION_FORM' = 'SUBMIT_PERSON_INFORMATION_FORM';
const submitPersonInformationForm :RequestSequence = newRequestSequence(SUBMIT_PERSON_INFORMATION_FORM);

export {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_PERSON_INFORMATION_FORM,
  getIncarcerationFacilities,
  submitPersonInformationForm,
};
