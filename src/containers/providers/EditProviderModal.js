// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  get
} from 'immutable';
import { Modal, ModalFooter, Spinner } from 'lattice-ui-kit';
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
import { getContactsAssociations, getDataForFormPrepopulation } from './utils/ProvidersUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { ADD_NEW_PROVIDER_CONTACTS, addNewProviderContacts } from './ProvidersActions';
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
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
} = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const {
  CONTACTED_VIA,
  EMPLOYED_BY,
  IS,
  PROVIDER,
  PROVIDER_ADDRESS,
  PROVIDER_CONTACT_INFO,
  PROVIDER_EMPLOYEES,
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

let entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
  map.setIn([PROVIDER, 0], '');
  map.setIn([PROVIDER_ADDRESS, 0], '');
  map.setIn([PROVIDER_STAFF, -1], []);
  map.setIn([PROVIDER_CONTACT_INFO, -1], []);
  map.setIn([PROVIDER_CONTACT_INFO, -2], []);
});

type Props = {
  actions :{
    addNewProviderContacts :RequestSequence;
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
    if (requestIsSuccess(requestStates[ADD_NEW_PROVIDER_CONTACTS])) {
      // resetFormData();
      onClose();
    }
  }, [onClose, requestStates]);

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

    entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER, 0], providerEKID);
    if (!address.isEmpty()) entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_ADDRESS, 0], getEKID(address));
    providerStaff.forEach((staffMember :Map, index :number) => {
      const staffMemberEKID :UUID = getEKID(staffMember);
      entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_STAFF, -1, index], staffMemberEKID);
      const contactMethods :List = contactInfoByContactPersonEKID.get(staffMemberEKID, List());
      contactMethods.forEach((method :Map) => {
        if (method.has(PHONE_NUMBER)) {
          entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_CONTACT_INFO, -1, index], getEKID(method));
        }
        if (method.has(EMAIL)) {
          entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_CONTACT_INFO, -2, index], getEKID(method));
        }
      });
    });

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
    setOriginalContactsFormData(prepopulatedContactsFormData);
  }, [address, contactInfoByContactPersonEKID, provider, providerEKID, providerStaff]);

  const onSubmit = () => {
    const providerDataToEdit :Object = processEntityDataForPartialReplace(
      providerFormData,
      originalProviderFormData,
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      {}
    );
    console.log('providerDataToEdit: ', providerDataToEdit);
    console.log('contactsFormData: ', contactsFormData);

    const contactsMappers :Map = Map().withMutations((mappers :Map) => {
      const indexMappers :Map = Map().withMutations((map :Map) => {
        map.set(getEntityAddressKey(-2, PROVIDER_CONTACT_INFO, EMAIL), (i) => i + 1);
      });
      mappers.set(INDEX_MAPPERS, indexMappers);
    });
    const contactsDataToSubmit :Object = processEntityData(
      contactsFormData,
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      contactsMappers
    );
    console.log('contactsDataToSubmit: ', contactsDataToSubmit);
    const providerStaffESID :UUID = entitySetIdsByFqn.get(PROVIDER_STAFF);
    const newContacts :Object[] = contactsDataToSubmit[providerStaffESID];
    const associations = getContactsAssociations(newContacts, contactsFormData, providerEKID);
    console.log('associations: ', associations);
    const contactsAssociations :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
    );
    console.log('contactsAssociations: ', contactsAssociations);
    actions.addNewProviderContacts({ associationEntityData: contactsAssociations, entityData: contactsDataToSubmit });
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Provider" />);
  const renderFooter = () => {
    const isSubmitting :boolean = false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          textPrimary="Save" />
    );
  };
  const formContext = {
    editAction: onSubmit,
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
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addNewProviderContacts,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditProviderForm);
