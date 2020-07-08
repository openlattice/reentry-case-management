// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_PERSON :'EDIT_PERSON' = 'EDIT_PERSON';
const editPerson :RequestSequence = newRequestSequence(EDIT_PERSON);

const EDIT_PERSON_DETAILS :'EDIT_PERSON_DETAILS' = 'EDIT_PERSON_DETAILS';
const editPersonDetails :RequestSequence = newRequestSequence(EDIT_PERSON_DETAILS);

const SUBMIT_PERSON_DETAILS :'SUBMIT_PERSON_DETAILS' = 'SUBMIT_PERSON_DETAILS';
const submitPersonDetails :RequestSequence = newRequestSequence(SUBMIT_PERSON_DETAILS);

export {
  EDIT_PERSON,
  EDIT_PERSON_DETAILS,
  SUBMIT_PERSON_DETAILS,
  editPerson,
  editPersonDetails,
  submitPersonDetails,
};
