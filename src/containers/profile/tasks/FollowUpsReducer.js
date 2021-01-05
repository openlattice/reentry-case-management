// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_SUBMISSION_REQUEST_STATES,
  CREATE_NEW_FOLLOW_UP,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  MARK_FOLLOW_UP_AS_COMPLETE,
  createNewFollowUp,
  getFollowUpNeighbors,
  loadTasks,
  markFollowUpAsComplete,
} from './FollowUpsActions';

import { PARTICIPANT_FOLLOW_UPS, SHARED } from '../../../utils/constants/ReduxStateConstants';

const { FOLLOW_UP_NEIGHBOR_MAP, MEETING_NOTES_STAFF_MAP } = PARTICIPANT_FOLLOW_UPS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [CREATE_NEW_FOLLOW_UP]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_FOLLOW_UP_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [LOAD_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [MARK_FOLLOW_UP_AS_COMPLETE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [FOLLOW_UP_NEIGHBOR_MAP]: Map(),
  [MEETING_NOTES_STAFF_MAP]: Map(),
});

export default function participantTasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_SUBMISSION_REQUEST_STATES: {
      return state
        .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.STANDBY);
    }

    case createNewFollowUp.case(action.type): {
      return createNewFollowUp.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, action.id], action)
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newFollowUpEKID, followUpNeighbors } = value;
          const followUpNeighborMap :Map = state.get(FOLLOW_UP_NEIGHBOR_MAP)
            .mergeDeepIn([newFollowUpEKID], followUpNeighbors);
          return state
            .set(FOLLOW_UP_NEIGHBOR_MAP, followUpNeighborMap)
            .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_NEW_FOLLOW_UP, action.id]),
      });
    }

    case getFollowUpNeighbors.case(action.type): {
      return getFollowUpNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { followUpNeighborMap, meetingNotesStaffMap } = value;
          return state
            .set(FOLLOW_UP_NEIGHBOR_MAP, followUpNeighborMap)
            .set(MEETING_NOTES_STAFF_MAP, meetingNotesStaffMap)
            .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, action.id]),
      });
    }

    case loadTasks.case(action.type): {
      return loadTasks.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, LOAD_TASKS, action.id], action)
          .setIn([ACTIONS, LOAD_TASKS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, LOAD_TASKS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, LOAD_TASKS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, LOAD_TASKS, action.id]),
      });
    }

    case markFollowUpAsComplete.case(action.type): {
      return markFollowUpAsComplete.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, action.id], action)
          .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { followUpEKID, newMeeting } = value;
          const followUpNeighborMap = state.get(FOLLOW_UP_NEIGHBOR_MAP)
            .update(followUpEKID,
              Map(),
              (existingMeeting :Map) => existingMeeting.mergeWith((oldVal, newVal) => newVal, newMeeting));
          return state
            .set(FOLLOW_UP_NEIGHBOR_MAP, followUpNeighborMap)
            .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, action.id]),
      });
    }

    default:
      return state;
  }
}
