// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_PARTICIPANTS :'DOWNLOAD_PARTICIPANTS' = 'DOWNLOAD_PARTICIPANTS';
const downloadParticipants :RequestSequence = newRequestSequence(DOWNLOAD_PARTICIPANTS);

export {
  DOWNLOAD_PARTICIPANTS,
  downloadParticipants,
};
