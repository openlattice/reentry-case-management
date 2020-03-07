// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_DOWNLOAD_REQUEST_STATE :'CLEAR_DOWNLOAD_REQUEST_STATE' = 'CLEAR_DOWNLOAD_REQUEST_STATE';
const clearDownloadRequestState :RequestSequence = newRequestSequence(CLEAR_DOWNLOAD_REQUEST_STATE);

const DOWNLOAD_PARTICIPANTS :'DOWNLOAD_PARTICIPANTS' = 'DOWNLOAD_PARTICIPANTS';
const downloadParticipants :RequestSequence = newRequestSequence(DOWNLOAD_PARTICIPANTS);

const GET_REPORTS_DATA :'GET_REPORTS_DATA' = 'GET_REPORTS_DATA';
const getReportsData :RequestSequence = newRequestSequence(GET_REPORTS_DATA);

export {
  CLEAR_DOWNLOAD_REQUEST_STATE,
  DOWNLOAD_PARTICIPANTS,
  GET_REPORTS_DATA,
  clearDownloadRequestState,
  downloadParticipants,
  getReportsData,
};
