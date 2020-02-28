// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_NEW_PROVIDER,
  GET_CONTACT_INFO,
  GET_PROVIDERS,
  GET_PROVIDER_NEIGHBORS,
  createNewProvider,
  getContactInfo,
  getProviders,
  getProviderNeighbors,
} from './ProvidersActions';
import { PROVIDERS, SHARED } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  CONTACT_INFO_BY_CONTACT_PERSON_EKID,
  PROVIDER,
  PROVIDERS_LIST,
  PROVIDER_NEIGHBOR_MAP
} = PROVIDERS;
const { PROVIDER_ADDRESS } = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PROVIDERS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PROVIDER_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CONTACT_INFO_BY_CONTACT_PERSON_EKID]: Map(),
  [PROVIDER]: Map(),
  [PROVIDERS_LIST]: List(),
  [PROVIDER_NEIGHBOR_MAP]: Map(),
});

export default function providersReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case createNewProvider.case(action.type): {

      return createNewProvider.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, CREATE_NEW_PROVIDER, action.id], action)
          .setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newProvider, newProviderAddress, newProviderEKID } = value;
          const providersList :List = state.get(PROVIDERS_LIST)
            .push(newProvider);
          const providerNeighborMap :Map = state.get(PROVIDER_NEIGHBOR_MAP)
            .setIn([newProviderEKID, PROVIDER_ADDRESS], newProviderAddress);
          return state
            .set(PROVIDERS_LIST, providersList)
            .set(PROVIDER_NEIGHBOR_MAP, providerNeighborMap)
            .setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_NEW_PROVIDER, action.id]),
      });
    }

    case getContactInfo.case(action.type): {

      return getContactInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_CONTACT_INFO, action.id], action)
          .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(CONTACT_INFO_BY_CONTACT_PERSON_EKID, value)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CONTACT_INFO, action.id]),
      });
    }

    case getProviders.case(action.type): {

      return getProviders.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PROVIDERS, action.id], action)
          .setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PROVIDERS_LIST, value)
            .setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PROVIDERS, action.id]),
      });
    }

    case getProviderNeighbors.case(action.type): {

      return getProviderNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PROVIDER_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_PROVIDER_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PROVIDER_NEIGHBOR_MAP, value)
            .setIn([ACTIONS, GET_PROVIDER_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PROVIDER_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PROVIDER_NEIGHBORS, action.id]),
      });
    }

    default:
      return state;

  }
}
