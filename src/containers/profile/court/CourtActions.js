// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DELETE_COURT_HEARING :'DELETE_COURT_HEARING' = 'DELETE_COURT_HEARING';
const deleteCourtHearing :RequestSequence = newRequestSequence(DELETE_COURT_HEARING);

const EDIT_COURT_HEARINGS :'EDIT_COURT_HEARINGS' = 'EDIT_COURT_HEARINGS';
const editCourtHearings :RequestSequence = newRequestSequence(EDIT_COURT_HEARINGS);

export {
  DELETE_COURT_HEARING,
  EDIT_COURT_HEARINGS,
  deleteCourtHearing,
  editCourtHearings,
};
