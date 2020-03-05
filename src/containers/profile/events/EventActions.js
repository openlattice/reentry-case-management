// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PROVIDERS :'GET_PROVIDERS' = 'GET_PROVIDERS';
const getProviders :RequestSequence = newRequestSequence(GET_PROVIDERS);

const RECORD_ENROLLMENT_EVENT :'RECORD_ENROLLMENT_EVENT' = 'RECORD_ENROLLMENT_EVENT';
const recordEnrollmentEvent :RequestSequence = newRequestSequence(RECORD_ENROLLMENT_EVENT);

export {
  GET_PROVIDERS,
  RECORD_ENROLLMENT_EVENT,
  getProviders,
  recordEnrollmentEvent,
};
