// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ModalHeader from '../../components/modal/ModalHeader';

import { schema, uiSchema } from './schemas/AddProviderSchemas';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { CREATE_NEW_PROVIDER, clearEditRequestStates, createNewProvider } from './ProvidersActions';
import {
  APP,
  EDM,
  PROVIDERS,
  SHARED
} from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { processAssociationEntityData, processEntityData } = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { LOCATED_AT, PROVIDER, PROVIDER_ADDRESS } = APP_TYPE_FQNS;

const FixedWidthModal = styled.div`
  width: 400px;
`;

type Props = {
  actions :{
    clearEditRequestStates :() => { type :string };
    createNewProvider :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  propertyTypeIdsByFqn :Map;
  requestStates :{
    CREATE_NEW_PROVIDER :RequestState;
  };
};

const AddProviderModal = ({
  actions,
  entitySetIdsByFqn,
  isVisible,
  onClose,
  propertyTypeIdsByFqn,
  requestStates
} :Props) => {

  const [formData, updateFormData] = useState({});

  const closeModal = useCallback(() => {
    updateFormData({});
    actions.clearEditRequestStates();
    onClose();
  }, [actions, onClose]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    if (requestIsSuccess(requestStates[CREATE_NEW_PROVIDER])) {
      closeModal();
    }
  }, [closeModal, requestStates]);

  const onSubmit = () => {
    if (Object.keys(formData).length) {
      const entityData :Object = processEntityData(formData, entitySetIdsByFqn, propertyTypeIdsByFqn);
      const associations :Array<Array<*>> = [
        [LOCATED_AT, 0, PROVIDER, 0, PROVIDER_ADDRESS, {}]
      ];
      const associationEntityData :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn
      );
      actions.createNewProvider({ associationEntityData, entityData });
    }
  };

  const renderHeader = () => (<ModalHeader onClose={closeModal} title="Add Provider" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(requestStates[CREATE_NEW_PROVIDER]);
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          textPrimary="Save" />
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={onSubmit}
        onClose={closeModal}
        viewportScrolling
        textPrimary="Save"
        withFooter={renderFooter}
        withHeader={renderHeader}>
      <FixedWidthModal>
        <Form
            formData={formData}
            hideSubmit
            noPadding
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
      [CREATE_NEW_PROVIDER]: providers.getIn([ACTIONS, CREATE_NEW_PROVIDER, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearEditRequestStates,
    createNewProvider,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddProviderModal);
