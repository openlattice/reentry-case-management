// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  loadTaskManagerData,
  searchForTasks,
} from './TasksActions';
import { SHARED, TASK_MANAGER } from '../../utils/constants/ReduxStateConstants';

const { FOLLOW_UPS } = TASK_MANAGER;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [LOAD_TASK_MANAGER_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_FOR_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [FOLLOW_UPS]: List(),
});

export default function tasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case loadTaskManagerData.case(action.type): {
      return loadTaskManagerData.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, LOAD_TASK_MANAGER_DATA, action.id], action)
          .setIn([ACTIONS, LOAD_TASK_MANAGER_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, LOAD_TASK_MANAGER_DATA, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, LOAD_TASK_MANAGER_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, LOAD_TASK_MANAGER_DATA, action.id]),
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
