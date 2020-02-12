// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_JAIL_NAMES_FOR_JAIL_STAYS,
  GET_PARTICIPANT_NEIGHBORS,
  SEARCH_PARTICIPANTS,
  getJailNamesForJailStays,
  getParticipantNeighbors,
  searchParticipants,
} from './ParticipantsActions';
import { PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const { JAIL_NAMES_BY_JAIL_STAY_EKID, NEIGHBORS, SEARCHED_PARTICIPANTS } = PARTICIPANTS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_PARTICIPANT_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [JAIL_NAMES_BY_JAIL_STAY_EKID]: Map(),
  [NEIGHBORS]: Map(),
  [SEARCHED_PARTICIPANTS]: List(),
  [TOTAL_HITS]: 0,
});

export default function participantsReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getJailNamesForJailStays.case(action.type): {

      return getJailNamesForJailStays.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_JAIL_NAMES_FOR_JAIL_STAYS, action.id], action)
          .setIn([ACTIONS, GET_JAIL_NAMES_FOR_JAIL_STAYS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(JAIL_NAMES_BY_JAIL_STAY_EKID, value)
            .setIn([ACTIONS, GET_JAIL_NAMES_FOR_JAIL_STAYS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_JAIL_NAMES_FOR_JAIL_STAYS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_JAIL_NAMES_FOR_JAIL_STAYS, action.id]),
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
            .set(NEIGHBORS, value)
            .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, action.id]),
      });
    }

    case searchParticipants.case(action.type): {

      return searchParticipants.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_PARTICIPANTS, action.id], action)
          .setIn([ACTIONS, SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { searchedParticipants, totalHits } = value;
          return state
            .set(SEARCHED_PARTICIPANTS, searchedParticipants)
            .set(TOTAL_HITS, totalHits)
            .setIn([ACTIONS, SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_PARTICIPANTS, action.id]),
      });
    }

    default:
      return state;

  }
}
