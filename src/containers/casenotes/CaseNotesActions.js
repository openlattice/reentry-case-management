// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_MEETING :'GET_MEETING' = 'GET_MEETING';
const getMeeting :RequestSequence = newRequestSequence(GET_MEETING);

const GET_REENTRY_STAFF :'GET_REENTRY_STAFF' = 'GET_REENTRY_STAFF';
const getReentryStaff :RequestSequence = newRequestSequence(GET_REENTRY_STAFF);

export {
  GET_MEETING,
  GET_REENTRY_STAFF,
  getMeeting,
  getReentryStaff,
};
