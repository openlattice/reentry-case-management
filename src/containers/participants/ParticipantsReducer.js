// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH_PARTICIPANTS, searchParticipants } from './ParticipantsActions';
import { PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const { SEARCHED_PARTICIPANTS } = PARTICIPANTS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [SEARCH_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [SEARCHED_PARTICIPANTS]: List(),
  [TOTAL_HITS]: 0,
});

export default function participantsReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

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
