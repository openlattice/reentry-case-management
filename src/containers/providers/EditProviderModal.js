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
import type { Match } from 'react-router';

import ModalHeader from '../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditProviderSchemas';
import { getDataForFormPrepopulation } from './utils/ProvidersUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { GET_PROVIDER, getProvider } from './ProvidersActions';
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

const { getEntityAddressKey, getPageSectionKey, processEntityDataForPartialReplace } = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const {
  CONTACT_INFO,
  LOCATION,
  PROVIDER,
  PROVIDER_STAFF,
} = APP_TYPE_FQNS;
const {
  CITY,
  DESCRIPTION,
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  PHONE_NUMBER,
  STREET,
  TYPE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

let entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
  map.setIn([PROVIDER, 0], '');
  map.setIn([LOCATION, 0], '');
  map.setIn([PROVIDER_STAFF, -1], []);
  map.setIn([CONTACT_INFO, -1], []);
  map.setIn([CONTACT_INFO, -2], []);
});

type Props = {
  actions :{
    getProvider :RequestSequence;
  };
  address :Map;
  contactInfoByContactPersonEKID :Map;
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  match :Match;
  onClose :() => void;
  propertyTypeIdsByFqn :Map;
  provider :Map;
  providerStaff :List;
  requestStates :{
    GET_PROVIDER :RequestState;
  };
};

const EditProviderForm = ({
  actions,
  address,
  contactInfoByContactPersonEKID,
  entitySetIdsByFqn,
  isVisible,
  match,
  onClose,
  provider,
  providerStaff,
  propertyTypeIdsByFqn,
  requestStates
} :Props) => {

  const [formData, updateFormData] = useState({});
  const [originalFormData, setOriginalFormData] = useState({});
  // useEffect(() => {
  //   const { params } = match;
  //   const { providerId: providerEKID } = params;
  //   actions.getProvider({ providerEKID });
  // }, [actions, match]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  // useEffect(() => {
  //   if (requestIsSuccess(requestStates[CREATE_NEW_PROVIDER])) {
  //     resetFormData();
  //     onClose();
  //   }
  // }, [onClose, requestStates]);

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

    updateFormData({
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, PROVIDER, NAME)]: providerName,
        [getEntityAddressKey(0, PROVIDER, TYPE)]: providerTypes,
        [getEntityAddressKey(0, PROVIDER, DESCRIPTION)]: providerDescription,
      },
      [getPageSectionKey(1, 2)]: {
        [getEntityAddressKey(0, LOCATION, STREET)]: city,
        [getEntityAddressKey(0, LOCATION, CITY)]: streetAddress,
        [getEntityAddressKey(0, LOCATION, US_STATE)]: state,
        [getEntityAddressKey(0, LOCATION, ZIP)]: zipCode,
      },
      [getPageSectionKey(1, 3)]: pointsOfContact
    });
    setOriginalFormData({
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, PROVIDER, NAME)]: providerName,
        [getEntityAddressKey(0, PROVIDER, TYPE)]: providerTypes,
        [getEntityAddressKey(0, PROVIDER, DESCRIPTION)]: providerDescription,
      },
      [getPageSectionKey(1, 2)]: {
        [getEntityAddressKey(0, LOCATION, STREET)]: city,
        [getEntityAddressKey(0, LOCATION, CITY)]: streetAddress,
        [getEntityAddressKey(0, LOCATION, US_STATE)]: state,
        [getEntityAddressKey(0, LOCATION, ZIP)]: zipCode,
      },
      [getPageSectionKey(1, 3)]: pointsOfContact
    });
  }, [address, contactInfoByContactPersonEKID, provider, providerStaff]);

  const onSubmit = (value) => {
    console.log('value: ', value);
    const newFormData = value.formData;
    console.log('originalFormData: ', originalFormData);
    const entityData :Object = processEntityDataForPartialReplace(
      newFormData,
      originalFormData,
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      {}
    );
    console.log('entityIndexToIdMap: ', entityIndexToIdMap.toJS());
    // if (Object.keys(formData).length) {
    //   const entityData :Object = processEntityData(formData, entitySetIdsByFqn, propertyTypeIdsByFqn);
    //   actions.createNewProvider({ associationEntityData: {}, entityData });
    // }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Provider" />);
  const formContext = {
    editAction: onSubmit,
    entityIndexToIdMap,
    entitySetIds: entitySetIdsByFqn,
    propertyTypeIds: propertyTypeIdsByFqn,
  };
  if (requestIsPending(requestStates[GET_PROVIDER])) {
    return <Spinner size="2x" />;
  }
  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        viewportScrolling
        withHeader={renderHeader}>
      <FixedWidthModal>
        <Form
            disabled
            formContext={formContext}
            formData={formData}
            hideSubmit
            onChange={onChange}
            schema={schema}
            uiSchema={uiSchema} />
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
      [GET_PROVIDER]: providers.getIn([ACTIONS, GET_PROVIDER, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getProvider,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditProviderForm);
