// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_DOWNLOAD_REQUEST_STATE,
  DOWNLOAD_PARTICIPANTS,
  GET_INTAKES_PER_YEAR,
  GET_REPORTS_DATA,
  downloadParticipants,
  getIntakesPerYear,
  getReportsData,
} from './ReportsActions';
import { REPORTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  NUMBER_OF_INTAKES_PER_MONTH,
  NUMBER_OF_INTAKES_THIS_MONTH,
  NUMBER_OF_RELEASES_THIS_WEEK,
  SERVICES_TABLE_DATA
} = REPORTS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [DOWNLOAD_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [NUMBER_OF_INTAKES_PER_MONTH]: [],
  [NUMBER_OF_INTAKES_THIS_MONTH]: 0,
  [SERVICES_TABLE_DATA]: [],
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

    case getIntakesPerYear.case(action.type): {
      return getIntakesPerYear.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_INTAKES_PER_YEAR, action.id], action)
          .setIn([ACTIONS, GET_INTAKES_PER_YEAR, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(NUMBER_OF_INTAKES_PER_MONTH, value)
            .setIn([ACTIONS, GET_INTAKES_PER_YEAR, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_INTAKES_PER_YEAR, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INTAKES_PER_YEAR, action.id]),
      });
    }

    case getReportsData.case(action.type): {
      return getReportsData.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_REPORTS_DATA, action.id], action)
          .setIn([ACTIONS, GET_REPORTS_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { numberOfIntakesThisMonth, numberOfReleasesThisWeek, servicesTableData } = value;
          return state
            .set(NUMBER_OF_INTAKES_THIS_MONTH, numberOfIntakesThisMonth)
            .set(NUMBER_OF_RELEASES_THIS_WEEK, numberOfReleasesThisWeek)
            .set(SERVICES_TABLE_DATA, servicesTableData)
            .setIn([ACTIONS, GET_REPORTS_DATA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_REPORTS_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_REPORTS_DATA, action.id]),
      });
    }

    default:
      return state;
  }
}
