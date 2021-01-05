/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_CURRENT_STAFF :'GET_CURRENT_STAFF' = 'GET_CURRENT_STAFF';
const getCurrentStaff :RequestSequence = newRequestSequence(GET_CURRENT_STAFF);

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
const switchOrganization :RequestSequence = newRequestSequence(SWITCH_ORGANIZATION);

export {
  GET_CURRENT_STAFF,
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  getCurrentStaff,
  initializeApplication,
  switchOrganization,
};
