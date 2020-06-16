// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_EDIT_REQUEST_STATE :'CLEAR_EDIT_REQUEST_STATE' = 'CLEAR_EDIT_REQUEST_STATE';
const clearEditRequestState = () => ({
  type: CLEAR_EDIT_REQUEST_STATE
});

const EDIT_NEEDS :'EDIT_NEEDS' = 'EDIT_NEEDS';
const editNeeds :RequestSequence = newRequestSequence(EDIT_NEEDS);

export {
  CLEAR_EDIT_REQUEST_STATE,
  EDIT_NEEDS,
  clearEditRequestState,
  editNeeds,
};
