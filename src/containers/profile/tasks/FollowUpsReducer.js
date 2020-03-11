// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASKS,
  getFollowUpNeighbors,
  loadTasks,
} from './FollowUpsActions';
import { PARTICIPANT_TASKS, SHARED } from '../../../utils/constants/ReduxStateConstants';

const { FOLLOW_UP_NEIGHBOR_MAP } = PARTICIPANT_TASKS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [LOAD_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [FOLLOW_UP_NEIGHBOR_MAP]: Map(),
});

export default function participantTasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

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
