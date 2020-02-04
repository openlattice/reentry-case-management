/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
const switchOrganization :RequestSequence = newRequestSequence(SWITCH_ORGANIZATION);

export {
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  initializeApplication,
  switchOrganization,
};
