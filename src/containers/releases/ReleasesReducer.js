// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_JAILS_BY_JAIL_STAY_EKID,
  SEARCH_RELEASES,
  getJailsByJailStayEKID,
  searchReleases,
} from './ReleasesActions';
import { RELEASES, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { JAILS_BY_JAIL_STAY_EKID } = RELEASES;

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

    default:
      return state;
  }
}
