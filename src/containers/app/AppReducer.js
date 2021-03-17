/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CURRENT_STAFF,
  INITIALIZE_APPLICATION,
  getCurrentStaff,
  initializeApplication,
} from './AppActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { APP, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  APP_TYPES_BY_ORG_ID,
  CURRENT_USER_EKID,
  ENTITY_SET_IDS_BY_ORG_ID,
  ORGS,
  SELECTED_ORG_ID,
  STAFF_MEMBERS,
} = APP;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [INITIALIZE_APPLICATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [APP_TYPES_BY_ORG_ID]: Map(),
  [CURRENT_USER_EKID]: '',
  [ENTITY_SET_IDS_BY_ORG_ID]: Map(),
  [ORGS]: Map(),
  [SELECTED_ORG_ID]: '',
  [STAFF_MEMBERS]: List(),
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getCurrentStaff.case(action.type): {
      return getCurrentStaff.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_CURRENT_STAFF, action.id])
          .setIn([ACTIONS, GET_CURRENT_STAFF, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(STAFF_MEMBERS, action.value.staff)
          .set(CURRENT_USER_EKID, action.value.currentUserEKID)
          .setIn([ACTIONS, GET_CURRENT_STAFF, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, GET_CURRENT_STAFF, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CURRENT_STAFF, action.id])
      });
    }

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id], seqAction)
          .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = action;
          const {
            appTypesByOrgId,
            entitySetIdsByOrgId,
            organizations,
            selectedOrganizationId,
          } = value;
          return state
            .set(APP_TYPES_BY_ORG_ID, appTypesByOrgId)
            .set(ENTITY_SET_IDS_BY_ORG_ID, entitySetIdsByOrgId)
            .set(ORGS, organizations)
            .set(SELECTED_ORG_ID, selectedOrganizationId)
            .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id])
      });
    }

    default:
      return state;
  }
}
