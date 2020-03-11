// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  has,
  get,
  mergeDeep,
} from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/AddNewFollowUpSchemas';
import {
  getNewFollowUpAssociations,
  hydrateNewFollowUpForm,
  preprocessFormData,
  removeEKIDsFromFormData,
} from './utils/AddNewFollowUpUtils';
import {
  APP,
  EDM,
  PARTICIPANT_FOLLOW_UPS,
  PROVIDERS,
  SHARED,
} from '../../../utils/constants/ReduxStateConstants';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { PROVIDERS_LIST } = PROVIDERS;
const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;

const FixedWidthModal = styled.div`
  padding-bottom: 30px;
  width: 576px;
`;

type Props = {
  actions :{
  };
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  personEKID :UUID;
  propertyTypeIdsByFqn :Map;
  providersList :List;
  reentryStaffMembers :List;
  requestStates :{
    CREATE_NEW_FOLLOW_UP :RequestState;
  };
};

const AddNewFollowUpModal = ({
  actions,
  entitySetIdsByFqn,
  isVisible,
  onClose,
  personEKID,
  propertyTypeIdsByFqn,
  providersList,
  reentryStaffMembers,
  requestStates,
} :Props) => {

  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };
  const closeModal = useCallback(() => {
    updateFormData({});
    // actions.clearEditRequestStates();
    onClose();
  }, [onClose]);
  // useEffect(() => {
  //   if (requestIsSuccess(requestStates[CREATE_NEW_FOLLOW_UP])) {
  //     closeModal();
  //   }
  // }, [closeModal, requestStates]);

  const onSubmit = () => {
    if (Object.keys(formData).length) {
      const preprocessedFormData :Object = preprocessFormData(formData);
      const associations :Array<Array<*>> = getNewFollowUpAssociations(preprocessedFormData, personEKID);
      const updatedFormData :Object = removeEKIDsFromFormData(preprocessedFormData);
      const entityData :Object = processEntityData(updatedFormData, entitySetIdsByFqn, propertyTypeIdsByFqn);
      const associationEntityData :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn
      );
      console.log('preprocessedFormData: ', preprocessedFormData);
      console.log('associations: ', associations);
      console.log('updatedFormData: ', updatedFormData);
      console.log('entityData: ', entityData);
      console.log('associationEntityData: ', associationEntityData);
      // actions.createNewFollowUp({ associationEntityData, entityData });
    }
  };
  const hydratedSchema :Object = hydrateNewFollowUpForm(schema, reentryStaffMembers, providersList);
  const renderHeader = () => (<ModalHeader onClose={onClose} title="New Task" />);
  const renderFooter = () => {
    const isSubmitting :boolean = false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          isPendingSecondary={false}
          onClickPrimary={onSubmit}
          onClickSecondary={closeModal}
          shouldStretchButtons
          textPrimary="Save"
          textSecondary="Discard" />
    );
  };
  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={onSubmit}
        onClickSecondary={closeModal}
        onClose={closeModal}
        shouldStretchButtons
        textPrimary="Save"
        textSecondary="Discard"
        viewportScrolling
        withFooter={renderFooter}
        withHeader={renderHeader}>
      <FixedWidthModal>
        <Form
            formData={formData}
            hideSubmit
            noPadding
            onChange={onChange}
            onSubmit={onSubmit}
            schema={hydratedSchema}
            uiSchema={uiSchema} />
      </FixedWidthModal>
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  const participantFollowUps :Map = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [PROVIDERS_LIST]: providers.get(PROVIDERS_LIST),
    [REENTRY_STAFF_MEMBERS]: participantFollowUps.get(REENTRY_STAFF_MEMBERS),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddNewFollowUpModal);
