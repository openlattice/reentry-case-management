// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_ATTORNEY :'EDIT_ATTORNEY' = 'EDIT_ATTORNEY';
const editAttorney :RequestSequence = newRequestSequence(EDIT_ATTORNEY);

const EDIT_OFFICER :'EDIT_OFFICER' = 'EDIT_OFFICER';
const editOfficer :RequestSequence = newRequestSequence(EDIT_OFFICER);

const EDIT_OFFICER_CONTACT_INFO :'EDIT_OFFICER_CONTACT_INFO' = 'EDIT_OFFICER_CONTACT_INFO';
const editOfficerContactInfo :RequestSequence = newRequestSequence(EDIT_OFFICER_CONTACT_INFO);

const EDIT_SUPERVISION :'EDIT_SUPERVISION' = 'EDIT_SUPERVISION';
const editSupervision :RequestSequence = newRequestSequence(EDIT_SUPERVISION);

const SUBMIT_ATTORNEY :'SUBMIT_ATTORNEY' = 'SUBMIT_ATTORNEY';
const submitAttorney :RequestSequence = newRequestSequence(SUBMIT_ATTORNEY);

const SUBMIT_OFFICER :'SUBMIT_OFFICER' = 'SUBMIT_OFFICER';
const submitOfficer :RequestSequence = newRequestSequence(SUBMIT_OFFICER);

const SUBMIT_OFFICER_CONTACT_INFO :'SUBMIT_OFFICER_CONTACT_INFO' = 'SUBMIT_OFFICER_CONTACT_INFO';
const submitOfficerContactInfo :RequestSequence = newRequestSequence(SUBMIT_OFFICER_CONTACT_INFO);

const SUBMIT_SUPERVISION :'SUBMIT_SUPERVISION' = 'SUBMIT_SUPERVISION';
const submitSupervision :RequestSequence = newRequestSequence(SUBMIT_SUPERVISION);

export {
  EDIT_ATTORNEY,
  EDIT_OFFICER,
  EDIT_OFFICER_CONTACT_INFO,
  EDIT_SUPERVISION,
  SUBMIT_ATTORNEY,
  SUBMIT_OFFICER,
  SUBMIT_OFFICER_CONTACT_INFO,
  SUBMIT_SUPERVISION,
  editAttorney,
  editOfficer,
  editOfficerContactInfo,
  editSupervision,
  submitAttorney,
  submitOfficer,
  submitOfficerContactInfo,
  submitSupervision,
};
