// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_OFFICER :'EDIT_OFFICER' = 'EDIT_OFFICER';
const editOfficer :RequestSequence = newRequestSequence(EDIT_OFFICER);

const EDIT_SUPERVISION :'EDIT_SUPERVISION' = 'EDIT_SUPERVISION';
const editSupervision :RequestSequence = newRequestSequence(EDIT_SUPERVISION);

const SUBMIT_OFFICER :'SUBMIT_OFFICER' = 'SUBMIT_OFFICER';
const submitOfficer :RequestSequence = newRequestSequence(SUBMIT_OFFICER);

const SUBMIT_SUPERVISION :'SUBMIT_SUPERVISION' = 'SUBMIT_SUPERVISION';
const submitSupervision :RequestSequence = newRequestSequence(SUBMIT_SUPERVISION);

export {
  EDIT_OFFICER,
  EDIT_SUPERVISION,
  SUBMIT_OFFICER,
  SUBMIT_SUPERVISION,
  editOfficer,
  editSupervision,
  submitOfficer,
  submitSupervision,
};
