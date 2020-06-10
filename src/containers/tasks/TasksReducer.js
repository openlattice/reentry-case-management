// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_FOLLOW_UP_NEIGHBORS,
  SEARCH_FOR_TASKS,
  getFollowUpNeighbors,
  searchForTasks,
} from './TasksActions';
import { SHARED, TASK_MANAGER } from '../../utils/constants/ReduxStateConstants';

const { FOLLOW_UPS, FOLLOW_UP_NEIGHBOR_MAP } = TASK_MANAGER;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_FOLLOW_UP_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_FOR_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [FOLLOW_UP_NEIGHBOR_MAP]: Map(),
  [FOLLOW_UPS]: List(),
});

export default function tasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getFollowUpNeighbors.case(action.type): {
      return getFollowUpNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = action;
          return state
            .set(FOLLOW_UP_NEIGHBOR_MAP, value)
            .setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, action.id]),
      });
    }

    case searchForTasks.case(action.type): {
      return searchForTasks.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_FOR_TASKS, action.id], action)
          .setIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = action;
          return state
            .set(FOLLOW_UPS, value)
            .setIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_FOR_TASKS, action.id]),
      });
    }

    default:
      return state;
  }
}
