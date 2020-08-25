// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_MEETING :'GET_MEETING' = 'GET_MEETING';
const getMeeting :RequestSequence = newRequestSequence(GET_MEETING);

const GET_REENTRY_STAFF :'GET_REENTRY_STAFF' = 'GET_REENTRY_STAFF';
const getReentryStaff :RequestSequence = newRequestSequence(GET_REENTRY_STAFF);

const SUBMIT_CASE_NOTES_AND_COMPLETE_TASK
  :'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK' = 'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK';
const submitCaseNotesAndCompleteTask :RequestSequence = newRequestSequence(SUBMIT_CASE_NOTES_AND_COMPLETE_TASK);

export {
  GET_MEETING,
  GET_REENTRY_STAFF,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeeting,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
};
