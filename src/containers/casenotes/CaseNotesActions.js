// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_MEETING_AND_TASK :'GET_MEETING_AND_TASK' = 'GET_MEETING_AND_TASK';
const getMeetingAndTask :RequestSequence = newRequestSequence(GET_MEETING_AND_TASK);

const GET_REENTRY_STAFF :'GET_REENTRY_STAFF' = 'GET_REENTRY_STAFF';
const getReentryStaff :RequestSequence = newRequestSequence(GET_REENTRY_STAFF);

const SUBMIT_CASE_NOTES_AND_COMPLETE_TASK
  :'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK' = 'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK';
const submitCaseNotesAndCompleteTask :RequestSequence = newRequestSequence(SUBMIT_CASE_NOTES_AND_COMPLETE_TASK);

export {
  GET_MEETING_AND_TASK,
  GET_REENTRY_STAFF,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeetingAndTask,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
};
