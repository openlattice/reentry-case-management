// @flow
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  has
} from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ModalHeader from '../../components/modal/ModalHeader';
import {
  contactsSchema,
  contactsUiSchema,
  providerSchema,
  providerUiSchema,
} from './schemas/EditProviderSchemas';
import { formatEntityIndexToIdMap, getContactsAssociations, getDataForFormPrepopulation } from './utils/ProvidersUtils';
import { requestIsPending, requestIsSuccess, reduceRequestStates } from '../../utils/RequestStateUtils';
import { getEKID } from '../../utils/DataUtils';
import {
  ADD_NEW_PROVIDER_CONTACTS,
  EDIT_PROVIDER,
  addNewProviderContacts,
  editProvider,
} from './ProvidersActions';
import {
  APP,
  EDM,
  PROVIDERS,
  SHARED
} from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

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
    editProvider :RequestSequence;
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
  console.log('providerEKID: ', providerEKID);
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
      requestStates[EDIT_PROVIDER]
    ]);
    // $FlowFixMe
    if (requestIsSuccess(reducedState)) {
      onClose();
    }
  }, [onClose, requestStates]);
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
        [getEntityAddressKey(0, PROVIDER_ADDRESS, STREET)]: city,
        [getEntityAddressKey(0, PROVIDER_ADDRESS, CITY)]: streetAddress,
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
    setOriginalContactsFormData(prepopulatedProviderFormData);
  }, [address, contactInfoByContactPersonEKID, provider, providerEKID, providerStaff]);

  const onSubmit = () => {
    const draftWithKeys :Object = replaceEntityAddressKeys(
      providerFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap.current)
    );
    const providerDataToEdit :Object = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalProviderFormData, findEntityAddressKeyFromMap(entityIndexToIdMap.current)),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      {}
    );
    if (Object.keys(providerDataToEdit).length) {
      const addressEKID :UUID = entityIndexToIdMap.current.getIn([PROVIDER_ADDRESS, 0], '');
      actions.editProvider({ addressEKID, entityData: providerDataToEdit, providerEKID });
    }

    if (!originalContactsFormData[getPageSectionKey(1, 1)].length) {
      const contactsMappers :Map = Map().withMutations((mappers :Map) => {
        const indexMappers :Map = Map().withMutations((map :Map) => {
          map.set(getEntityAddressKey(-2, PROVIDER_CONTACT_INFO, EMAIL), (i) => {
            const contactObject :Object = contactsFormData[getPageSectionKey(1, 1)][i];
            if (has(contactObject, getEntityAddressKey(-1, PROVIDER_CONTACT_INFO, PHONE_NUMBER))) return i + 1;
            return i;
          });
        });
        mappers.set(INDEX_MAPPERS, indexMappers);
      });
      const contactsDataToSubmit :Object = processEntityData(
        contactsFormData,
        entitySetIdsByFqn,
        propertyTypeIdsByFqn,
        contactsMappers
      );
      const providerStaffESID :UUID = entitySetIdsByFqn.get(PROVIDER_STAFF);
      const newContacts :Object[] = contactsDataToSubmit[providerStaffESID];
      const associations = getContactsAssociations(newContacts, contactsFormData, providerEKID);
      const contactsAssociations :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn,
      );
      actions.addNewProviderContacts({ associationEntityData: contactsAssociations, entityData: contactsDataToSubmit });
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Provider" />);
  const renderFooter = () => {
    const reducedState = reduceRequestStates([
      requestStates[ADD_NEW_PROVIDER_CONTACTS],
      requestStates[EDIT_PROVIDER]
    ]);
    const isSubmitting :boolean = reducedState ? requestIsPending(reducedState) : false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          textPrimary="Save" />
    );
  };
  const formContext = {
    entityIndexToIdMap,
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
            formContext={formContext}
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
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addNewProviderContacts,
    editProvider,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditProviderForm);
