// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_REENTRY_STAFF :'GET_REENTRY_STAFF' = 'GET_REENTRY_STAFF';
const getReentryStaff :RequestSequence = newRequestSequence(GET_REENTRY_STAFF);

export {
  GET_REENTRY_STAFF,
  getReentryStaff,
};
