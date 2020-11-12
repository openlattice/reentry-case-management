/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';

import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { isDefined } from '../../utils/LangUtils';
import { APP, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  APP_TYPES_BY_ORG_ID,
  ENTITY_SET_IDS_BY_ORG_ID,
  ORGS,
  SELECTED_ORG_ID
} = APP;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [INITIALIZE_APPLICATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [APP_TYPES_BY_ORG_ID]: Map(),
  [ENTITY_SET_IDS_BY_ORG_ID]: Map(),
  [ORGS]: Map(),
  [SELECTED_ORG_ID]: '',
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

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id], seqAction)
          .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { id, value } = action;
          if (!state.hasIn([ACTIONS, INITIALIZE_APPLICATION, id]) || !isDefined(value)) {
            return state;
          }

          const { appConfigs } = value;
          let organizations :Map = state.get(ORGS);

          let entitySetIdsByOrgId :Map = state.get(ENTITY_SET_IDS_BY_ORG_ID);
          let appTypesByOrgId :Map = state.get(APP_TYPES_BY_ORG_ID);

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const { id: orgId } = organization;

            if (!fromJS(appConfig.config).isEmpty()) {
              organizations = organizations.set(orgId, {
                id: orgId,
                title: organization.title,
              });

              fromJS(APP_TYPE_FQNS).forEach((fqn) => {
                entitySetIdsByOrgId = entitySetIdsByOrgId.setIn(
                  [orgId, fqn],
                  appConfig.config[fqn].entitySetId
                );
                appTypesByOrgId = appTypesByOrgId.setIn(
                  [orgId, appConfig.config[fqn].entitySetId],
                  fqn
                );
              });
            }
          });

          // alphabetize
          entitySetIdsByOrgId = entitySetIdsByOrgId
            .map((orgFqnMap :Map) => orgFqnMap.sortBy((esid :UUID, fqn) => fqn.toString()));

          let selectedOrganizationId :UUID = '';
          if (!organizations.isEmpty() && !selectedOrganizationId.length) {
            selectedOrganizationId = organizations.valueSeq().getIn([0, 'id'], '');
          }
          const storedOrganizationId :?UUID = AccountUtils.retrieveOrganizationId();
          if (storedOrganizationId && organizations.has(storedOrganizationId)) {
            selectedOrganizationId = storedOrganizationId;
          }

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
