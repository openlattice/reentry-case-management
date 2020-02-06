// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_INTAKE_FORM,
  getIncarcerationFacilities,
  submitIntakeForm,
} from './IntakeActions';
import { INTAKE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { INCARCERATION_FACILITIES, NEW_PARTICIPANT_EKID } = INTAKE;

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

    case submitIntakeForm.case(action.type): {

      return submitIntakeForm.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_INTAKE_FORM, action.id], action)
          .setIn([ACTIONS, SUBMIT_INTAKE_FORM, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(NEW_PARTICIPANT_EKID, value)
            .setIn([ACTIONS, SUBMIT_INTAKE_FORM, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, SUBMIT_INTAKE_FORM, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_INTAKE_FORM, action.id]),
      });
    }

    default:
      return state;
  }
}
