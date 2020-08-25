// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_MEETING,
  GET_REENTRY_STAFF,
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeeting,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';

import { CASE_NOTES, PARTICIPANT_FOLLOW_UPS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { MEETING } = CASE_NOTES;
const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_MEETING]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_REENTRY_STAFF]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_CASE_NOTES_AND_COMPLETE_TASK]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [MEETING]: Map(),
  [REENTRY_STAFF_MEMBERS]: List(),
});

export default function caseNotesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getMeeting.case(action.type): {

      return getMeeting.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_MEETING, action.id], action)
          .setIn([ACTIONS, GET_MEETING, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(MEETING, action.value)
          .setIn([ACTIONS, GET_MEETING, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, GET_MEETING, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_MEETING, action.id]),
      });
    }

    case getReentryStaff.case(action.type): {

      return getReentryStaff.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_REENTRY_STAFF, action.id], action)
          .setIn([ACTIONS, GET_REENTRY_STAFF, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(REENTRY_STAFF_MEMBERS, action.value)
          .setIn([ACTIONS, GET_REENTRY_STAFF, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, GET_REENTRY_STAFF, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_REENTRY_STAFF, action.id]),
      });
    }

    case submitCaseNotesAndCompleteTask.case(action.type): {

      return submitCaseNotesAndCompleteTask.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, action.id], action)
          .setIn([ACTIONS, SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_CASE_NOTES_AND_COMPLETE_TASK, action.id]),
      });
    }

    default:
      return state;
  }
}
