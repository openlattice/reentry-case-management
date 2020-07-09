// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_SEX_OFFENDER :'EDIT_SEX_OFFENDER' = 'EDIT_SEX_OFFENDER';
const editSexOffender :RequestSequence = newRequestSequence(EDIT_SEX_OFFENDER);

export {
  EDIT_SEX_OFFENDER,
  editSexOffender,
};
