/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { CREATE_NEW_FOLLOW_UP, clearSubmissionRequestStates, createNewFollowUp } from './FollowUpsActions';
import {
  getNewFollowUpAssociations,
  getParticipantEKIDForNewTask,
  hydrateNewFollowUpForm,
  preprocessFormData,
  removeEKIDsFromFormData,
} from './utils/AddNewFollowUpUtils';

import ModalHeader from '../../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
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
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID, STAFF_MEMBERS } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { PROVIDERS_LIST } = PROVIDERS;
const { FOLLOW_UPS, REENTRY_STAFF } = APP_TYPE_FQNS;
const { ASSIGNEE_ID, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const FixedWidthModal = styled.div`
  padding-bottom: 30px;
  width: 576px;
`;

type Props = {
  actions :{
    clearSubmissionRequestStates :() => { type :string };
    createNewFollowUp :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  participants ? :List;
  personEKID :UUID;
  propertyTypeIdsByFqn :Map;
  providersList :List;
  staffMembers :List;
  requestStates :{
    CREATE_NEW_FOLLOW_UP :RequestState;
  };
  schema :Object;
  uiSchema :Object;
};

const AddNewFollowUpModal = ({
  actions,
  entitySetIdsByFqn,
  isVisible,
  onClose,
  participants,
  personEKID,
  propertyTypeIdsByFqn,
  providersList,
  staffMembers,
  requestStates,
  schema,
  uiSchema,
} :Props) => {

  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    const staffId = getIn(
      newFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID)]
    );
    const assigneeId = getIn(
      newFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, FOLLOW_UPS, ASSIGNEE_ID)]
    );

    let updatedFormData = newFormData;
    if (staffId !== assigneeId) {
      updatedFormData = setIn(
        updatedFormData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, FOLLOW_UPS, ASSIGNEE_ID)],
        staffId
      );
    }
    updateFormData(updatedFormData);
  };
  const closeModal = useCallback(() => {
    updateFormData({});
    actions.clearSubmissionRequestStates();
    onClose();
  }, [actions, onClose]);
  useEffect(() => {
    if (requestIsSuccess(requestStates[CREATE_NEW_FOLLOW_UP])) {
      closeModal();
    }
  }, [closeModal, requestStates]);

  const participantEKID :UUID = getParticipantEKIDForNewTask(personEKID, formData);

  const onSubmit = () => {
    if (Object.keys(formData).length) {
      const preprocessedFormData :Object = preprocessFormData(formData);
      const associations :Array<Array<*>> = getNewFollowUpAssociations(preprocessedFormData, participantEKID);
      const updatedFormData :Object = removeEKIDsFromFormData(preprocessedFormData);
      const entityData :Object = processEntityData(updatedFormData, entitySetIdsByFqn, propertyTypeIdsByFqn);
      const associationEntityData :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn
      );
      actions.createNewFollowUp({ associationEntityData, entityData });
    }
  };
  const hydratedSchema :Object = hydrateNewFollowUpForm(schema, staffMembers, providersList, participants);
  const renderHeader = () => (<ModalHeader onClose={onClose} title="New Task" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(requestStates[CREATE_NEW_FOLLOW_UP]);
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
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

AddNewFollowUpModal.defaultProps = {
  participants: List()
};

const mapStateToProps = (state :Map) => {
  const app :Map = state.get(APP.APP);
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  const participantFollowUps :Map = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [PROVIDERS_LIST]: providers.get(PROVIDERS_LIST),
    [STAFF_MEMBERS]: app.get(STAFF_MEMBERS),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [CREATE_NEW_FOLLOW_UP]: participantFollowUps.getIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearSubmissionRequestStates,
    createNewFollowUp,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddNewFollowUpModal);
