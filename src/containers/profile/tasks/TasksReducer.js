// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_TASKS,
  loadTasks,
} from './TasksActions';
import { SHARED } from '../../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [LOAD_TASKS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
});

export default function participantTasksReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

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
