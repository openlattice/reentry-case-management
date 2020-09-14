// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_SUPERVISION :'EDIT_SUPERVISION' = 'EDIT_SUPERVISION';
const editSupervision :RequestSequence = newRequestSequence(EDIT_SUPERVISION);

const SUBMIT_SUPERVISION :'SUBMIT_SUPERVISION' = 'SUBMIT_SUPERVISION';
const submitSupervision :RequestSequence = newRequestSequence(SUBMIT_SUPERVISION);

export {
  EDIT_SUPERVISION,
  SUBMIT_SUPERVISION,
  editSupervision,
  submitSupervision,
};
