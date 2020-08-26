// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_MEETING_AND_TASK :'GET_MEETING_AND_TASK' = 'GET_MEETING_AND_TASK';
const getMeetingAndTask :RequestSequence = newRequestSequence(GET_MEETING_AND_TASK);

const GET_REENTRY_STAFF :'GET_REENTRY_STAFF' = 'GET_REENTRY_STAFF';
const getReentryStaff :RequestSequence = newRequestSequence(GET_REENTRY_STAFF);

const GET_STAFF_WHO_RECORDED_NOTES :'GET_STAFF_WHO_RECORDED_NOTES' = 'GET_STAFF_WHO_RECORDED_NOTES';
const getStaffWhoRecordedNotes :RequestSequence = newRequestSequence(GET_STAFF_WHO_RECORDED_NOTES);

const SUBMIT_CASE_NOTES_AND_COMPLETE_TASK
  :'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK' = 'SUBMIT_CASE_NOTES_AND_COMPLETE_TASK';
const submitCaseNotesAndCompleteTask :RequestSequence = newRequestSequence(SUBMIT_CASE_NOTES_AND_COMPLETE_TASK);

export {
  GET_MEETING_AND_TASK,
  GET_REENTRY_STAFF,
  GET_STAFF_WHO_RECORDED_NOTES,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeetingAndTask,
  getReentryStaff,
  getStaffWhoRecordedNotes,
  submitCaseNotesAndCompleteTask,
};
