// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_SEARCH_RESULTS,
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_JAIL_STAYS_BY_PERSON,
  SEARCH_PEOPLE_BY_JAIL_STAY,
  SEARCH_RELEASES_BY_DATE,
  SEARCH_RELEASES_BY_PERSON_NAME,
  getJailsByJailStayEKID,
  searchJailStaysByPerson,
  searchPeopleByJailStay,
  searchReleasesByDate,
  searchReleasesByPersonName,
} from './ReleasesActions';
import { RELEASES, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const {
  JAILS_BY_JAIL_STAY_EKID,
  JAIL_STAYS_BY_PERSON_EKID,
  PEOPLE_BY_JAIL_STAY_EKID,
  SEARCHED_JAIL_STAYS,
  SEARCHED_PEOPLE,
} = RELEASES;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_JAILS_BY_JAIL_STAY_EKID]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_JAIL_STAYS_BY_PERSON]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_PEOPLE_BY_JAIL_STAY]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_RELEASES_BY_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_RELEASES_BY_PERSON_NAME]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [JAILS_BY_JAIL_STAY_EKID]: Map(),
  [JAIL_STAYS_BY_PERSON_EKID]: Map(),
  [PEOPLE_BY_JAIL_STAY_EKID]: Map(),
  [SEARCHED_JAIL_STAYS]: List(),
  [SEARCHED_PEOPLE]: List(),
  [TOTAL_HITS]: 0,
});

export default function releasesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_SEARCH_RESULTS: {
      return state
        .set(JAILS_BY_JAIL_STAY_EKID, Map())
        .set(JAIL_STAYS_BY_PERSON_EKID, Map())
        .set(PEOPLE_BY_JAIL_STAY_EKID, Map())
        .set(SEARCHED_JAIL_STAYS, List())
        .set(SEARCHED_PEOPLE, List())
        .set(TOTAL_HITS, 0);
    }

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

    case searchJailStaysByPerson.case(action.type): {

      return searchJailStaysByPerson.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_JAIL_STAYS_BY_PERSON, action.id], action)
          .setIn([ACTIONS, SEARCH_JAIL_STAYS_BY_PERSON, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(JAIL_STAYS_BY_PERSON_EKID, value)
            .setIn([ACTIONS, SEARCH_JAIL_STAYS_BY_PERSON, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_JAIL_STAYS_BY_PERSON, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_JAIL_STAYS_BY_PERSON, action.id]),
      });
    }

    case searchReleasesByDate.case(action.type): {

      return searchReleasesByDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_RELEASES_BY_DATE, action.id], action)
          .setIn([ACTIONS, SEARCH_RELEASES_BY_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { jailStays, totalHits } = value;
          return state
            .set(SEARCHED_JAIL_STAYS, jailStays)
            .set(TOTAL_HITS, totalHits)
            .setIn([ACTIONS, SEARCH_RELEASES_BY_DATE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_RELEASES_BY_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_RELEASES_BY_DATE, action.id]),
      });
    }

    case searchReleasesByPersonName.case(action.type): {

      return searchReleasesByPersonName.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, action.id], action)
          .setIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { people, totalHits } = value;
          return state
            .set(SEARCHED_PEOPLE, people)
            .set(TOTAL_HITS, totalHits)
            .setIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, action.id]),
      });
    }

    default:
      return state;
  }
}
