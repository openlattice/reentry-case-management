// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_DOWNLOAD_REQUEST_STATE,
  DOWNLOAD_PARTICIPANTS,
  downloadParticipants,
} from './ReportsActions';
import { SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [DOWNLOAD_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
});

export default function reportsReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_DOWNLOAD_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, DOWNLOAD_PARTICIPANTS, REQUEST_STATE], RequestStates.STANDBY);
    }

    case downloadParticipants.case(action.type): {
      return downloadParticipants.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, DOWNLOAD_PARTICIPANTS, action.id], action)
          .setIn([ACTIONS, DOWNLOAD_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, DOWNLOAD_PARTICIPANTS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, DOWNLOAD_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DOWNLOAD_PARTICIPANTS, action.id]),
      });
    }

    default:
      return state;
  }
}
