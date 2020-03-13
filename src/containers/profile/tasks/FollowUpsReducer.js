// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_ADD_REQUEST_STATE,
  CREATE_NEW_FOLLOW_UP,
  GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM,
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  createNewFollowUp,
  getEntitiesForNewFollowUpForm,
  getFollowUpNeighbors,
  loadTasks,
} from './FollowUpsActions';
import { PARTICIPANT_FOLLOW_UPS, SHARED } from '../../../utils/constants/ReduxStateConstants';

const { FOLLOW_UP_NEIGHBOR_MAP, REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [CREATE_NEW_FOLLOW_UP]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_FOLLOW_UP_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [LOAD_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [FOLLOW_UP_NEIGHBOR_MAP]: Map(),
  [REENTRY_STAFF_MEMBERS]: List(),
});

export default function participantTasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_ADD_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.STANDBY);
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

    case getEntitiesForNewFollowUpForm.case(action.type): {
      return getEntitiesForNewFollowUpForm.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, action.id], action)
          .setIn([ACTIONS, GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(REENTRY_STAFF_MEMBERS, value)
            .setIn([ACTIONS, GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENTITIES_FOR_NEW_FOLLOW_UP_FORM, action.id]),
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
          return state
            .set(FOLLOW_UP_NEIGHBOR_MAP, value)
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

    default:
      return state;
  }
}
