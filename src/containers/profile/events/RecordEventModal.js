// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  RECORD_ENROLLMENT_EVENT,
  recordEnrollmentEvent,
} from './EventActions';
import { schema, uiSchema } from './schemas/RecordEventSchemas';
import { hydrateEventSchema, prepareFormDataForProcessing } from './utils/EventUtils';

import COLORS from '../../../core/style/Colors';
import ModalHeader from '../../../components/modal/ModalHeader';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  EVENT,
  PROVIDERS,
  SHARED,
} from '../../../utils/constants/ReduxStateConstants';
import { getProviders } from '../../providers/ProvidersActions';

const { processAssociationEntityData, processEntityData } = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { PROVIDERS_LIST } = PROVIDERS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const ActionText = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  line-height: 19px;
  margin: 20px 0;
`;

type Props = {
  actions :{
    getProviders :RequestSequence;
    recordEnrollmentEvent :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  isVisible :boolean;
  onClose :() => void;
  personEKID :UUID;
  propertyTypeIdsByFqn :Map;
  providersList :List;
  requestStates :{
    RECORD_ENROLLMENT_EVENT :RequestState;
  };
};

type State = {
  formData :Object;
};

class RecordEventModal extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, isVisible, requestStates } = this.props;
    const { requestStates: prevRequestStates } = prevProps;
    if (!prevProps.isVisible && isVisible) {
      actions.getProviders();
    }
    if (requestIsSuccess(requestStates[RECORD_ENROLLMENT_EVENT])
      && requestIsPending(prevRequestStates[RECORD_ENROLLMENT_EVENT])) {
      this.closeModal();
    }
  }

  resetFormData = () => {
    this.setState({ formData: {} });
  }

  closeModal = () => {
    const { onClose } = this.props;
    this.resetFormData();
    onClose();
  }

  onChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  onSubmit = () => {
    const { formData } = this.state;
    const {
      actions,
      entitySetIdsByFqn,
      personEKID,
      propertyTypeIdsByFqn,
    } = this.props;
    if (Object.keys(formData).length) {
      const { entityDataToProcess, associations } = prepareFormDataForProcessing(formData, personEKID);
      const entityData :Object = processEntityData(entityDataToProcess, entitySetIdsByFqn, propertyTypeIdsByFqn);
      const associationEntityData :Object = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn
      );
      actions.recordEnrollmentEvent({ associationEntityData, entityData });
    }
  }

  render() {
    const { isVisible, providersList, requestStates } = this.props;
    const { formData } = this.state;
    const hydratedSchema :Object = hydrateEventSchema(schema, providersList);
    const isSubmitting :boolean = requestIsPending(requestStates[RECORD_ENROLLMENT_EVENT]);

    const withFooter = (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={this.onSubmit}
          textPrimary="Save" />
    );
    const withHeader = <ModalHeader onClose={this.closeModal} title="Record Event" />;

    return (
      <Modal
          isVisible={isVisible}
          onClickPrimary={this.onSubmit}
          onClose={this.closeModal}
          textPrimary="Save"
          viewportScrolling
          withFooter={withFooter}
          withHeader={withHeader}>
        <ActionText>
          Select an event type and the related organization to record it in program history.
        </ActionText>
        <Form
            formData={formData}
            hideSubmit
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            noPadding
            schema={hydratedSchema}
            uiSchema={uiSchema} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const event = state.get(EVENT.EVENT);
  const providers = state.get(PROVIDERS.PROVIDERS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [PROVIDERS_LIST]: providers.get(PROVIDERS_LIST),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [RECORD_ENROLLMENT_EVENT]: event.getIn([ACTIONS, RECORD_ENROLLMENT_EVENT, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getProviders,
    recordEnrollmentEvent,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(RecordEventModal);
