// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_EVENT :'EDIT_EVENT' = 'EDIT_EVENT';
const editEvent :RequestSequence = newRequestSequence(EDIT_EVENT);

const EDIT_RELEASE_INFO :'EDIT_RELEASE_INFO' = 'EDIT_RELEASE_INFO';
const editReleaseInfo :RequestSequence = newRequestSequence(EDIT_RELEASE_INFO);

export {
  EDIT_EVENT,
  EDIT_RELEASE_INFO,
  editEvent,
  editReleaseInfo,
};
