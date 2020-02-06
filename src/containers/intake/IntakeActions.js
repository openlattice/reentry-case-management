// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_INCARCERATION_FACILITIES :'GET_INCARCERATION_FACILITIES' = 'GET_INCARCERATION_FACILITIES';
const getIncarcerationFacilities :RequestSequence = newRequestSequence(GET_INCARCERATION_FACILITIES);

const SUBMIT_INTAKE_FORM :'SUBMIT_INTAKE_FORM' = 'SUBMIT_INTAKE_FORM';
const submitIntakeForm :RequestSequence = newRequestSequence(SUBMIT_INTAKE_FORM);

export {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_INTAKE_FORM,
  getIncarcerationFacilities,
  submitIntakeForm,
};
