// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES,
  getJailsByJailStayEKID,
  searchPeopleByJailStay,
  searchReleases,
} from './ReleasesActions';
import { RELEASES, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  JAILS_BY_JAIL_STAY_EKID,
  PEOPLE_BY_JAIL_STAY_EKID,
  SEARCHED_JAIL_STAYS,
  TOTAL_HITS,
} = RELEASES;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_JAILS_BY_JAIL_STAY_EKID]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_RELEASES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [JAILS_BY_JAIL_STAY_EKID]: Map(),
  [PEOPLE_BY_JAIL_STAY_EKID]: Map(),
  [SEARCHED_JAIL_STAYS]: Map(),
  [TOTAL_HITS]: 0,
});

export default function peopleReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getJailsByJailStayEKID.case(action.type): {

      return getJailsByJailStayEKID.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_JAILS_BY_JAIL_STAY_EKID, action.id], action)
          .setIn([ACTIONS, GET_JAILS_BY_JAIL_STAY_EKID, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(JAILS_BY_JAIL_STAY_EKID, value)
            .setIn([ACTIONS, GET_JAILS_BY_JAIL_STAY_EKID, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_JAILS_BY_JAIL_STAY_EKID, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_JAILS_BY_JAIL_STAY_EKID, action.id]),
      });
    }

    case searchPeopleByJailStay.case(action.type): {

      return searchPeopleByJailStay.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_PEOPLE_BY_JAIL_STAY, action.id], action)
          .setIn([ACTIONS, SEARCH_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PEOPLE_BY_JAIL_STAY_EKID, value)
            .setIn([ACTIONS, SEARCH_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_PEOPLE_BY_JAIL_STAY, action.id]),
      });
    }

    case searchReleases.case(action.type): {

      return searchReleases.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_RELEASES, action.id], action)
          .setIn([ACTIONS, SEARCH_RELEASES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { jailStays, totalHits } = value;
          return state
            .set(SEARCHED_JAIL_STAYS, jailStays)
            .set(TOTAL_HITS, totalHits)
            .setIn([ACTIONS, SEARCH_RELEASES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_RELEASES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_RELEASES, action.id]),
      });
    }

    default:
      return state;
  }
}
