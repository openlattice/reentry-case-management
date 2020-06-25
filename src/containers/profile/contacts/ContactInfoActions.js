// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_CONTACT_INFO :'EDIT_CONTACT_INFO' = 'EDIT_CONTACT_INFO';
const editContactInfo :RequestSequence = newRequestSequence(EDIT_CONTACT_INFO);

const GET_EMERGENCY_CONTACT_INFO :'GET_EMERGENCY_CONTACT_INFO' = 'GET_EMERGENCY_CONTACT_INFO';
const getEmergencyContactInfo :RequestSequence = newRequestSequence(GET_EMERGENCY_CONTACT_INFO);

export {
  EDIT_CONTACT_INFO,
  GET_EMERGENCY_CONTACT_INFO,
  editContactInfo,
  getEmergencyContactInfo,
};
