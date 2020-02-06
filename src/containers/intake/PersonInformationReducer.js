// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_PERSON_INFORMATION_FORM,
  getIncarcerationFacilities,
  submitPersonInformationForm,
} from './PersonInformationActions';
import { PERSON_INFORMATION_FORM, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { INCARCERATION_FACILITIES, NEW_PARTICIPANT_EKID } = PERSON_INFORMATION_FORM;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_INCARCERATION_FACILITIES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [INCARCERATION_FACILITIES]: List(),
  [NEW_PARTICIPANT_EKID]: '',
});

export default function personInformationReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case getIncarcerationFacilities.case(action.type): {

      return getIncarcerationFacilities.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_INCARCERATION_FACILITIES, action.id], action)
          .setIn([ACTIONS, GET_INCARCERATION_FACILITIES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;

          return state
            .set(INCARCERATION_FACILITIES, value)
            .setIn([ACTIONS, GET_INCARCERATION_FACILITIES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_INCARCERATION_FACILITIES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INCARCERATION_FACILITIES, action.id]),
      });
    }

    case submitPersonInformationForm.case(action.type): {

      return submitPersonInformationForm.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_PERSON_INFORMATION_FORM, action.id], action)
          .setIn([ACTIONS, SUBMIT_PERSON_INFORMATION_FORM, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(NEW_PARTICIPANT_EKID, value)
            .setIn([ACTIONS, SUBMIT_PERSON_INFORMATION_FORM, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SUBMIT_PERSON_INFORMATION_FORM, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_PERSON_INFORMATION_FORM, action.id]),
      });
    }

    default:
      return state;
  }
}
