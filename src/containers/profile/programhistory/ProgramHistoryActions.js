// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_EVENT :'EDIT_EVENT' = 'EDIT_EVENT';
const editEvent :RequestSequence = newRequestSequence(EDIT_EVENT);

const EDIT_RELEASE_INFO :'EDIT_RELEASE_INFO' = 'EDIT_RELEASE_INFO';
const editReleaseInfo :RequestSequence = newRequestSequence(EDIT_RELEASE_INFO);

const EDIT_RELEASE_DATE :'EDIT_RELEASE_DATE' = 'EDIT_RELEASE_DATE';
const editReleaseDate :RequestSequence = newRequestSequence(EDIT_RELEASE_DATE);

const SUBMIT_RELEASE_DATE :'SUBMIT_RELEASE_DATE' = 'SUBMIT_RELEASE_DATE';
const submitReleaseDate :RequestSequence = newRequestSequence(SUBMIT_RELEASE_DATE);

export {
  EDIT_EVENT,
  EDIT_RELEASE_DATE,
  EDIT_RELEASE_INFO,
  SUBMIT_RELEASE_DATE,
  editEvent,
  editReleaseDate,
  editReleaseInfo,
  submitReleaseDate,
};
