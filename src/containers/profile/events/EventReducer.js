// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PROVIDERS,
  RECORD_ENROLLMENT_EVENT,
  getProviders,
  recordEnrollmentEvent,
} from './EventActions';
import { EVENT, SHARED } from '../../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PROVIDERS } = EVENT;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_PROVIDERS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [RECORD_ENROLLMENT_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [PROVIDERS]: List()
});

export default function eventReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getProviders.case(action.type): {

      return getProviders.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PROVIDERS, action.id], action)
          .setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PROVIDERS, value)
            .setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PROVIDERS, action.id]),
      });
    }

    case recordEnrollmentEvent.case(action.type): {

      return recordEnrollmentEvent.reducer(state, action, {
        REQUEST: () => state.setIn([ACTIONS, RECORD_ENROLLMENT_EVENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, RECORD_ENROLLMENT_EVENT, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, RECORD_ENROLLMENT_EVENT, REQUEST_STATE], RequestStates.FAILURE),
      });
    }

    default:
      return state;
  }
}
