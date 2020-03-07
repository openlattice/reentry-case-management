// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const RECORD_ENROLLMENT_EVENT :'RECORD_ENROLLMENT_EVENT' = 'RECORD_ENROLLMENT_EVENT';
const recordEnrollmentEvent :RequestSequence = newRequestSequence(RECORD_ENROLLMENT_EVENT);

export {
  RECORD_ENROLLMENT_EVENT,
  recordEnrollmentEvent,
};
