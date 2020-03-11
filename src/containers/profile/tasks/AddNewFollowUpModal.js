// @flow
import React, { useEffect, useRef, useState } from 'react';
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
  APP,
  EDM,
  PARTICIPANT_TASKS,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const FixedWidthModal = styled.div`
  padding-bottom: 30px;
  width: 576px;
`;

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
  };
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  propertyTypeIdsByFqn :Map;
  requestStates :{
  };
};

const AddNewFollowUpModal = ({
  actions,
  entitySetIdsByFqn,
  isVisible,
  onClose,
  propertyTypeIdsByFqn,
  requestStates
} :Props) => {

  const renderHeader = () => (<ModalHeader onClose={onClose} title="New Task" />);
  const renderFooter = () => {
    const isSubmitting :boolean = false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          isPendingSecondary={false}
          onClickPrimary={() => {}}
          onClickSecondary={() => {}}
          shouldStretchButtons
          textPrimary="Save"
          textSecondary="Discard" />
    );
  };
  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={() => {}}
        onClickSecondary={() => {}}
        onClose={onClose}
        shouldStretchButtons
        textPrimary="Save"
        textSecondary="Discard"
        viewportScrolling
        withFooter={renderFooter}
        withHeader={renderHeader}>
      <FixedWidthModal>
        <Form
            hideSubmit
            noPadding
            schema={schema}
            uiSchema={uiSchema} />
      </FixedWidthModal>
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const participantTasks :Map = state.get(PARTICIPANT_TASKS.PARTICIPANT_TASKS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
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
