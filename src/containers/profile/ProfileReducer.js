// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PARTICIPANT,
  getParticipant,
} from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT } = PROFILE;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [PARTICIPANT]: Map(),
});

export default function profileReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getParticipant.case(action.type): {

      return getParticipant.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, action.id], action)
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PARTICIPANT, value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, action.id]),
      });
    }

    default:
      return state;
  }
}
