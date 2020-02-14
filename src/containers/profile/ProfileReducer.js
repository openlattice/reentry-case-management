// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PROFILE,
  getParticipant,
  getParticipantNeighbors,
  loadProfile,
} from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [LOAD_PROFILE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [PARTICIPANT]: Map(),
  [PARTICIPANT_NEIGHBORS]: Map(),
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

    case getParticipantNeighbors.case(action.type): {

      return getParticipantNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PARTICIPANT_NEIGHBORS, value)
            .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, action.id]),
      });
    }

    case loadProfile.case(action.type): {

      return loadProfile.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, LOAD_PROFILE, action.id], action)
          .setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, LOAD_PROFILE, action.id]),
      });
    }

    default:
      return state;
  }
}
