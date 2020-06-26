// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DELETE_EMERGENCY_CONTACT :'DELETE_EMERGENCY_CONTACT' = 'DELETE_EMERGENCY_CONTACT';
const deleteEmergencyContact :RequestSequence = newRequestSequence(DELETE_EMERGENCY_CONTACT);

const EDIT_CONTACT_INFO :'EDIT_CONTACT_INFO' = 'EDIT_CONTACT_INFO';
const editContactInfo :RequestSequence = newRequestSequence(EDIT_CONTACT_INFO);

const EDIT_EMERGENCY_CONTACTS :'EDIT_EMERGENCY_CONTACTS' = 'EDIT_EMERGENCY_CONTACTS';
const editEmergencyContacts :RequestSequence = newRequestSequence(EDIT_EMERGENCY_CONTACTS);

const GET_EMERGENCY_CONTACT_INFO :'GET_EMERGENCY_CONTACT_INFO' = 'GET_EMERGENCY_CONTACT_INFO';
const getEmergencyContactInfo :RequestSequence = newRequestSequence(GET_EMERGENCY_CONTACT_INFO);

export {
  DELETE_EMERGENCY_CONTACT,
  EDIT_CONTACT_INFO,
  EDIT_EMERGENCY_CONTACTS,
  GET_EMERGENCY_CONTACT_INFO,
  deleteEmergencyContact,
  editContactInfo,
  editEmergencyContacts,
  getEmergencyContactInfo,
};
