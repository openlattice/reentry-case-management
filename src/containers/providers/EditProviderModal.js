/*
 * @flow
 */

import React, { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  get,
  has,
  mergeDeep,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  ADD_NEW_PROVIDER_CONTACTS,
  EDIT_PROVIDER,
  EDIT_PROVIDER_CONTACTS,
  addNewProviderContacts,
  clearEditRequestStates,
  deleteProviderStaffAndContacts,
  editProvider,
  editProviderContacts,
} from './ProvidersActions';
import {
  contactsSchema,
  contactsUiSchema,
  providerSchema,
  providerUiSchema,
} from './schemas/EditProviderSchemas';
import {
  formatEntityIndexToIdMap,
  getContactsAssociations,
  getDataForFormPrepopulation,
  preprocessContactsData,
} from './utils/ProvidersUtils';

import ModalHeader from '../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../utils/DataUtils';
import { reduceRequestStates, requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROVIDERS,
  SHARED
} from '../../utils/constants/ReduxStateConstants';

const FixedWidthModal = styled.div`
  padding-bottom: 30px;
  width: 600px;
`;

const {
  INDEX_MAPPERS,
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
  wrapFormDataInPageSection,
} = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const {
  PROVIDER,
  PROVIDER_ADDRESS,
  PROVIDER_CONTACT_INFO,
  PROVIDER_STAFF,
} = APP_TYPE_FQNS;
const {
  CITY,
  DESCRIPTION,
  EMAIL,
  NAME,
  PHONE_NUMBER,
  STREET,
  TYPE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

type Props = {
  actions :{
    addNewProviderContacts :RequestSequence;
    clearEditRequestStates :() => { type :string };
    deleteProviderStaffAndContacts :RequestSequence;
    editProvider :RequestSequence;
    editProviderContacts :RequestSequence;
  };
  address :Map;
  contactInfoByContactPersonEKID :Map;
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  propertyTypeIdsByFqn :Map;
  provider :Map;
  providerStaff :List;
  requestStates :{
    ADD_NEW_PROVIDER_CONTACTS :RequestState;
    EDIT_PROVIDER :RequestState;
    EDIT_PROVIDER_CONTACTS :RequestState;
  };
};

const EditProviderForm = ({
  actions,
  address,
  contactInfoByContactPersonEKID,
  entitySetIdsByFqn,
  isVisible,
  onClose,
  provider,
  providerStaff,
  propertyTypeIdsByFqn,
  requestStates
} :Props) => {

  const providerEKID :UUID = getEKID(provider);
  const [providerFormData, updateProviderFormData] = useState({});
  const [contactsFormData, updateContactsFormData] = useState({});
  const [originalProviderFormData, setOriginalProviderFormData] = useState({});
  const [originalContactsFormData, setOriginalContactsFormData] = useState({});

  const onProviderChange = ({ formData: newFormData } :Object) => {
    updateProviderFormData(newFormData);
  };
  const onContactsChange = ({ formData: newFormData } :Object) => {
    updateContactsFormData(newFormData);
  };

  useEffect(() => {
    const reducedState = reduceRequestStates([
      requestStates[ADD_NEW_PROVIDER_CONTACTS],
      requestStates[EDIT_PROVIDER],
      requestStates[EDIT_PROVIDER_CONTACTS],
    ]);
    // $FlowFixMe
    if (requestIsSuccess(reducedState)) {
      actions.clearEditRequestStates();
      onClose();
    }
  }, [actions, onClose, requestStates]);

  const entityIndexToIdMap :Map = useRef();
  useEffect(() => {
    const {
      city,
      pointsOfContact,
      providerDescription,
      providerName,
      providerTypes,
      state,
      streetAddress,
      zipCode,
    } = getDataForFormPrepopulation(provider, address, providerStaff, contactInfoByContactPersonEKID);

    entityIndexToIdMap.current = formatEntityIndexToIdMap(
      providerEKID,
      address,
      providerStaff,
      contactInfoByContactPersonEKID
    );

    const prepopulatedProviderFormData :Object = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, PROVIDER, NAME)]: providerName,
        [getEntityAddressKey(0, PROVIDER, TYPE)]: providerTypes,
        [getEntityAddressKey(0, PROVIDER, DESCRIPTION)]: providerDescription,
      },
      [getPageSectionKey(1, 2)]: {
        [getEntityAddressKey(0, PROVIDER_ADDRESS, STREET)]: streetAddress,
        [getEntityAddressKey(0, PROVIDER_ADDRESS, CITY)]: city,
        [getEntityAddressKey(0, PROVIDER_ADDRESS, US_STATE)]: state,
        [getEntityAddressKey(0, PROVIDER_ADDRESS, ZIP)]: zipCode,
      },
    };
    updateProviderFormData(prepopulatedProviderFormData);
    setOriginalProviderFormData(prepopulatedProviderFormData);

    const prepopulatedContactsFormData :Object = {
      [getPageSectionKey(1, 1)]: pointsOfContact
    };
    updateContactsFormData(prepopulatedContactsFormData);
    setOriginalContactsFormData(fromJS(prepopulatedContactsFormData));
  }, [address, contactInfoByContactPersonEKID, provider, providerEKID, providerStaff]);

  const onSubmit = () => {
    const providerDraftWithKeys :Object = replaceEntityAddressKeys(
      providerFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap.current)
    );
    const providerDataToEdit :Object = processEntityDataForPartialReplace(
      providerDraftWithKeys,
      replaceEntityAddressKeys(originalProviderFormData, findEntityAddressKeyFromMap(entityIndexToIdMap.current)),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      {}
    );
    if (Object.keys(providerDataToEdit).length) {
      const addressEKID :UUID = entityIndexToIdMap.current.getIn([PROVIDER_ADDRESS, 0], '');
      actions.editProvider({ addressEKID, entityData: providerDataToEdit, providerEKID });
    }

    const originalContactsFormDataLength :number = originalContactsFormData.get(getPageSectionKey(1, 1)).count();
    const contactsWereAdded :boolean = contactsFormData[getPageSectionKey(1, 1)].length
      > originalContactsFormDataLength;
    if (contactsWereAdded) {
      const contactsMappers :Map = Map().withMutations((mappers :Map) => {
        const indexMappers :Map = Map().withMutations((map :Map) => {
          map.set(getEntityAddressKey(-1, PROVIDER_CONTACT_INFO, PHONE_NUMBER), (i) => i * 2);
          map.set(getEntityAddressKey(-2, PROVIDER_CONTACT_INFO, EMAIL), (i) => i * 2 + 1);
        });
        mappers.set(INDEX_MAPPERS, indexMappers);
      });
      const updatedContactsInFormData = contactsFormData[getPageSectionKey(1, 1)].slice(originalContactsFormDataLength);
      const updatedFormData = {
        [getPageSectionKey(1, 1)]: updatedContactsInFormData,
      };
      const preprocessedContactsFormData :Object = preprocessContactsData(updatedFormData, PROVIDER_CONTACT_INFO);
      const contactsDataToSubmit :Object = processEntityData(
        preprocessedContactsFormData,
        entitySetIdsByFqn,
        propertyTypeIdsByFqn,
        contactsMappers
      );
      const providerStaffESID :UUID = entitySetIdsByFqn.get(PROVIDER_STAFF);
      const newContacts :Object[] = contactsDataToSubmit[providerStaffESID];
      const associations = getContactsAssociations(newContacts, updatedFormData, providerEKID);
      const contactsAssociations :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn,
      );
      actions.addNewProviderContacts({ associationEntityData: contactsAssociations, entityData: contactsDataToSubmit });
    }

    const newContactsAsImm :List = fromJS(contactsFormData[getPageSectionKey(1, 1)]);
    const originalContacts :List = originalContactsFormData.get(getPageSectionKey(1, 1));
    const contactsHaveChanged :boolean = !originalContacts.equals(newContactsAsImm);
    if (!originalContacts.isEmpty() && !newContactsAsImm.isEmpty() && contactsHaveChanged) {
      let contactDataToEdit :Object = {};
      newContactsAsImm.slice(0, originalContacts.count()).forEach((contact :Map, index :number) => {
        const contactDraftWithKeys :Map = replaceEntityAddressKeys(
          contact,
          findEntityAddressKeyFromMap(entityIndexToIdMap.current, index)
        );
        const originalContactWithKeys :Map = replaceEntityAddressKeys(
          originalContacts.get(index),
          findEntityAddressKeyFromMap(entityIndexToIdMap.current, index)
        );
        const contactsDataDiff = processEntityDataForPartialReplace(
          wrapFormDataInPageSection(contactDraftWithKeys),
          wrapFormDataInPageSection(originalContactWithKeys),
          entitySetIdsByFqn,
          propertyTypeIdsByFqn,
          {}
        );
        contactDataToEdit = mergeDeep(contactDataToEdit, contactsDataDiff);
      });
      let contactEKIDToPersonEKID :Map = Map();
      const providerContactInfoESID :UUID = entitySetIdsByFqn.get(PROVIDER_CONTACT_INFO);
      if (has(contactDataToEdit, providerContactInfoESID)) {
        const contactEKIDs :UUID[] = Object.keys(get(contactDataToEdit, providerContactInfoESID));
        contactEKIDs.forEach((contactEKID :UUID) => {
          const personEKID :UUID = contactInfoByContactPersonEKID
            .findKey((contactList :List, contactPersonEKID :UUID) => {
              if (contactList.find((contact :Map) => getEKID(contact) === contactEKID)) {
                return contactPersonEKID;
              }
              return undefined;
            });
          contactEKIDToPersonEKID = contactEKIDToPersonEKID.set(contactEKID, personEKID);
        });
      }
      actions.editProviderContacts({ contactEKIDToPersonEKID, entityData: contactDataToEdit, providerEKID });
    }
  };

  const onDelete = (deleteValue) => {
    actions.deleteProviderStaffAndContacts({ deleteValue, providerEKID });
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Provider" />);
  const renderFooter = () => {
    const reducedState = reduceRequestStates([
      requestStates[ADD_NEW_PROVIDER_CONTACTS],
      requestStates[EDIT_PROVIDER],
      requestStates[EDIT_PROVIDER_CONTACTS]
    ]);
    const isSubmitting :boolean = reducedState ? requestIsPending(reducedState) : false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          textPrimary="Save" />
    );
  };
  const formContext :Object = {
    deleteAction: onDelete,
    entityIndexToIdMap: entityIndexToIdMap.current,
    entitySetIds: entitySetIdsByFqn,
    propertyTypeIds: propertyTypeIdsByFqn,
  };
  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textPrimary="Save"
        viewportScrolling
        withHeader={renderHeader}
        withFooter={renderFooter}>
      <FixedWidthModal>
        <Form
            formData={providerFormData}
            hideSubmit
            onChange={onProviderChange}
            onSubmit={onSubmit}
            schema={providerSchema}
            uiSchema={providerUiSchema} />
        <Form
            formContext={formContext}
            formData={contactsFormData}
            hideSubmit
            onChange={onContactsChange}
            onSubmit={onSubmit}
            schema={contactsSchema}
            uiSchema={contactsUiSchema} />
      </FixedWidthModal>
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [ADD_NEW_PROVIDER_CONTACTS]: providers.getIn([ACTIONS, ADD_NEW_PROVIDER_CONTACTS, REQUEST_STATE]),
      [EDIT_PROVIDER]: providers.getIn([ACTIONS, EDIT_PROVIDER, REQUEST_STATE]),
      [EDIT_PROVIDER_CONTACTS]: providers.getIn([ACTIONS, EDIT_PROVIDER_CONTACTS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addNewProviderContacts,
    clearEditRequestStates,
    deleteProviderStaffAndContacts,
    editProvider,
    editProviderContacts,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditProviderForm);
