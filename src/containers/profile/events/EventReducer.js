// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  RECORD_ENROLLMENT_EVENT,
  recordEnrollmentEvent,
} from './EventActions';
import { EVENT, SHARED } from '../../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PROVIDERS } = EVENT;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [RECORD_ENROLLMENT_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [PROVIDERS]: List()
});

export default function eventReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

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
