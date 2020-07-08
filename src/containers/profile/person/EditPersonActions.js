// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_EDUCATION :'EDIT_EDUCATION' = 'EDIT_EDUCATION';
const editEducation :RequestSequence = newRequestSequence(EDIT_EDUCATION);

const SUBMIT_EDUCATION :'SUBMIT_EDUCATION' = 'SUBMIT_EDUCATION';
const submitEducation :RequestSequence = newRequestSequence(SUBMIT_EDUCATION);

const EDIT_PERSON :'EDIT_PERSON' = 'EDIT_PERSON';
const editPerson :RequestSequence = newRequestSequence(EDIT_PERSON);

const EDIT_PERSON_DETAILS :'EDIT_PERSON_DETAILS' = 'EDIT_PERSON_DETAILS';
const editPersonDetails :RequestSequence = newRequestSequence(EDIT_PERSON_DETAILS);

const SUBMIT_PERSON_DETAILS :'SUBMIT_PERSON_DETAILS' = 'SUBMIT_PERSON_DETAILS';
const submitPersonDetails :RequestSequence = newRequestSequence(SUBMIT_PERSON_DETAILS);

const EDIT_STATE_ID :'EDIT_STATE_ID' = 'EDIT_STATE_ID';
const editStateId :RequestSequence = newRequestSequence(EDIT_STATE_ID);

const SUBMIT_STATE_ID :'SUBMIT_STATE_ID' = 'SUBMIT_STATE_ID';
const submitStateId :RequestSequence = newRequestSequence(SUBMIT_STATE_ID);

export {
  EDIT_EDUCATION,
  EDIT_PERSON,
  EDIT_PERSON_DETAILS,
  EDIT_STATE_ID,
  SUBMIT_EDUCATION,
  SUBMIT_PERSON_DETAILS,
  SUBMIT_STATE_ID,
  editEducation,
  editPerson,
  editPersonDetails,
  editStateId,
  submitEducation,
  submitPersonDetails,
  submitStateId,
};
