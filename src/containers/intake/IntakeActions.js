// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBMIT_REQUEST_STATE :'CLEAR_SUBMIT_REQUEST_STATE' = 'CLEAR_SUBMIT_REQUEST_STATE';
const clearSubmitRequestState = () => ({
  type: CLEAR_SUBMIT_REQUEST_STATE
});

const GET_INCARCERATION_FACILITIES :'GET_INCARCERATION_FACILITIES' = 'GET_INCARCERATION_FACILITIES';
const getIncarcerationFacilities :RequestSequence = newRequestSequence(GET_INCARCERATION_FACILITIES);

const SUBMIT_INTAKE_FORM :'SUBMIT_INTAKE_FORM' = 'SUBMIT_INTAKE_FORM';
const submitIntakeForm :RequestSequence = newRequestSequence(SUBMIT_INTAKE_FORM);

export {
  CLEAR_SUBMIT_REQUEST_STATE,
  GET_INCARCERATION_FACILITIES,
  SUBMIT_INTAKE_FORM,
  clearSubmitRequestState,
  getIncarcerationFacilities,
  submitIntakeForm,
};
