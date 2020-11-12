/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_NEW_PROVIDER_CONTACTS,
  CLEAR_EDIT_REQUEST_STATES,
  CREATE_NEW_PROVIDER,
  DELETE_PROVIDER_STAFF_AND_CONTACTS,
  EDIT_PROVIDER,
  EDIT_PROVIDER_CONTACTS,
  GET_CONTACT_INFO,
  GET_PROVIDERS,
  GET_PROVIDER_NEIGHBORS,
  addNewProviderContacts,
  createNewProvider,
  deleteProviderStaffAndContacts,
  editProvider,
  editProviderContacts,
  getContactInfo,
  getProviderNeighbors,
  getProviders,
} from './ProvidersActions';

import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../utils/DataUtils';
import { PROVIDERS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  CONTACT_INFO_BY_CONTACT_PERSON_EKID,
  PROVIDERS_LIST,
  PROVIDER_NEIGHBOR_MAP
} = PROVIDERS;
const { PROVIDER_ADDRESS, PROVIDER_STAFF } = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [ADD_NEW_PROVIDER_CONTACTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CREATE_NEW_PROVIDER]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_PROVIDER_STAFF_AND_CONTACTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PROVIDER]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PROVIDER_CONTACTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
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
  [PROVIDERS_LIST]: List(),
  [PROVIDER_NEIGHBOR_MAP]: Map(),
});

export default function providersReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_EDIT_REQUEST_STATES: {
      return state
        .setIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_PROVIDER, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.STANDBY);
    }

    case addNewProviderContacts.case(action.type): {

      return addNewProviderContacts.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, action.id], action)
          .setIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newProviderContactInfo, newProviderStaffMembers, providerEKID } = value;
          const contactInfoByContactPersonEKID :Map = state.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID)
            .merge(newProviderContactInfo);
          return state
            .updateIn(
              [PROVIDER_NEIGHBOR_MAP, providerEKID, PROVIDER_STAFF],
              List(),
              (staffMembers) => staffMembers.concat(newProviderStaffMembers)
            )
            .set(CONTACT_INFO_BY_CONTACT_PERSON_EKID, contactInfoByContactPersonEKID)
            .setIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, action.id]),
      });
    }

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
            .setIn([newProviderEKID, PROVIDER_ADDRESS], List([newProviderAddress]));
          return state
            .set(PROVIDERS_LIST, providersList)
            .set(PROVIDER_NEIGHBOR_MAP, providerNeighborMap)
            .setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_NEW_PROVIDER, action.id]),
      });
    }

    case deleteProviderStaffAndContacts.case(action.type): {

      return deleteProviderStaffAndContacts.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, DELETE_PROVIDER_STAFF_AND_CONTACTS, action.id], action)
          .setIn([ACTIONS, DELETE_PROVIDER_STAFF_AND_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { arrayItemIndex, providerEKID } = value;

          let providerNeighborMap :Map = state.get(PROVIDER_NEIGHBOR_MAP);
          const staffToDelete :Map = providerNeighborMap.getIn([providerEKID, PROVIDER_STAFF, arrayItemIndex]);
          const staffEKID :UUID = getEKID(staffToDelete);
          providerNeighborMap = providerNeighborMap.deleteIn([providerEKID, PROVIDER_STAFF, arrayItemIndex]);

          const contactInfoByContactPersonEKID :Map = state.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID)
            .delete(staffEKID);
          return state
            .set(CONTACT_INFO_BY_CONTACT_PERSON_EKID, contactInfoByContactPersonEKID)
            .set(PROVIDER_NEIGHBOR_MAP, providerNeighborMap)
            .setIn([ACTIONS, DELETE_PROVIDER_STAFF_AND_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, DELETE_PROVIDER_STAFF_AND_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_PROVIDER_STAFF_AND_CONTACTS, action.id]),
      });
    }

    case editProvider.case(action.type): {

      return editProvider.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PROVIDER, action.id], action)
          .setIn([ACTIONS, EDIT_PROVIDER, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newProvider, newProviderAddress, providerEKID } = value;
          let providersList :List = state.get(PROVIDERS_LIST);
          let index :number = -1;
          let provider :Map = providersList.find((entity :Map, i :number) => {
            if (providerEKID === getEKID(entity)) {
              index = i;
              return true;
            }
            return false;
          });
          provider = provider.mergeWith((oldVal, newVal) => newVal, newProvider);
          providersList = providersList.set(index, provider);

          let providerNeighborMap :Map = state.get(PROVIDER_NEIGHBOR_MAP);
          let providerAddress :Map = providerNeighborMap.getIn([providerEKID, PROVIDER_ADDRESS, 0], Map());
          providerAddress = providerAddress.mergeWith((oldVal, newVal) => newVal, newProviderAddress);
          providerNeighborMap = providerNeighborMap.setIn([providerEKID, PROVIDER_ADDRESS, 0], providerAddress);
          return state
            .set(PROVIDERS_LIST, providersList)
            .set(PROVIDER_NEIGHBOR_MAP, providerNeighborMap)
            .setIn([ACTIONS, EDIT_PROVIDER, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, EDIT_PROVIDER, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PROVIDER, action.id]),
      });
    }

    case editProviderContacts.case(action.type): {

      return editProviderContacts.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PROVIDER_CONTACTS, action.id], action)
          .setIn([ACTIONS, EDIT_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newProviderContactInfo, newProviderContactPeople, providerEKID } = value;

          let providerNeighborMap :Map = state.get(PROVIDER_NEIGHBOR_MAP);
          let providerStaff :Map = providerNeighborMap.getIn([providerEKID, PROVIDER_STAFF], List());
          newProviderContactPeople.forEach((updatedPerson :Map) => {
            const personEKID :UUID = getEKID(updatedPerson);
            let personArrayIndex :number = -1;
            let person :Map = providerStaff.find((staff :Map, index :number) => {
              personArrayIndex = index;
              return getEKID(staff) === personEKID;
            });
            person = person.mergeWith((oldVal, newVal) => newVal, updatedPerson);
            providerStaff = providerStaff.set(personArrayIndex, person);
          });
          providerNeighborMap = providerNeighborMap.setIn([providerEKID, PROVIDER_STAFF], providerStaff);

          let contactInfoByContactPersonEKID = state.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID);
          newProviderContactInfo.forEach((contactsList :List, personEKID :UUID) => {
            let personContacts :Map = contactInfoByContactPersonEKID.get(personEKID);
            contactsList.forEach((updatedContact :Map) => {
              let contactEntityIndex :number = -1;
              let existingContact :Map = personContacts
                .find((contact :Map, index :number) => {
                  contactEntityIndex = index;
                  return getEKID(contact) === getEKID(updatedContact);
                });
              existingContact = existingContact.mergeWith((oldVal, newVal) => newVal, updatedContact);
              personContacts = personContacts.set(contactEntityIndex, existingContact);
            });
            contactInfoByContactPersonEKID = contactInfoByContactPersonEKID.set(personEKID, personContacts);
          });
          return state
            .set(PROVIDER_NEIGHBOR_MAP, providerNeighborMap)
            .set(CONTACT_INFO_BY_CONTACT_PERSON_EKID, contactInfoByContactPersonEKID)
            .setIn([ACTIONS, EDIT_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, EDIT_PROVIDER_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PROVIDER_CONTACTS, action.id]),
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
