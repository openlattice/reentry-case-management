// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PEOPLE_BY_JAIL_STAY,
  getPeopleByJailStay,
} from './PeopleActions';
import { PEOPLE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PEOPLE_BY_JAIL_STAY } = PEOPLE;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_PEOPLE_BY_JAIL_STAY]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [PEOPLE_BY_JAIL_STAY]: Map(),
});

export default function peopleReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getPeopleByJailStay.case(action.type): {

      return getPeopleByJailStay.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PEOPLE_BY_JAIL_STAY, action.id], action)
          .setIn([ACTIONS, GET_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PEOPLE_BY_JAIL_STAY, value)
            .setIn([ACTIONS, GET_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PEOPLE_BY_JAIL_STAY, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PEOPLE_BY_JAIL_STAY, action.id]),
      });
    }

    default:
      return state;
  }
}
