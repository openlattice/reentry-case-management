// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { GET_REENTRY_STAFF, getReentryStaff } from './CaseNotesActions';

import { PARTICIPANT_FOLLOW_UPS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_REENTRY_STAFF]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [REENTRY_STAFF_MEMBERS]: List(),
});

export default function caseNotesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

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

    default:
      return state;
  }
}
