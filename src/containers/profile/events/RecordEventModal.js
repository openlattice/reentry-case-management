// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import {
  CardSegment,
  Colors,
  Modal,
  ModalFooter,
} from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import COLORS from '../../../core/style/Colors';
import {
  RECORD_ENROLLMENT_EVENT,
  getProviders,
  recordEnrollmentEvent,
} from './EventActions';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { schema, uiSchema } from './schemas/RecordEventSchemas';
import { hydrateEventSchema, prepareFormDataForProcessing } from './utils/EventUtils';
import {
  APP,
  EDM,
  EVENT,
  SHARED,
} from '../../../utils/constants/ReduxStateConstants';

const { processAssociationEntityData, processEntityData } = DataProcessingUtils;
const { NEUTRALS } = Colors;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { PROVIDERS } = EVENT;
const { ACTIONS, REQUEST_STATE } = SHARED;

const ModalCardSegment = styled(CardSegment)`
  justify-content: space-between;
`;

const ModalTitle = styled.div`
  color: ${NEUTRALS[0]};
  font-weight: 600;
  font-size: 22px;
  max-height: 30px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  height: 32px;
  width: 32px;
`;

const ActionText = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 20px;
`;

type HeaderProps = {
  onClose :() => void;
};

const Header = ({ onClose } :HeaderProps) => (
  <ModalCardSegment padding="30px 30px 20px">
    <ModalTitle>Record Event</ModalTitle>
    <CloseButton onClick={onClose}>
      <FontAwesomeIcon color={NEUTRALS[2]} icon={faTimes} size="lg" />
    </CloseButton>
  </ModalCardSegment>
);

type Props = {
  actions :{
    getProviders :RequestSequence;
    recordEnrollmentEvent :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
  propertyTypeIdsByFqn :Map;
  providers :List;
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

  componentDidMount() {
    const { actions } = this.props;
    this.setState({ formData: {} });
    actions.getProviders();
  }

  componentDidUpdate(prevProps :Props) {
    const { requestStates, onClose } = this.props;
    const { requestStates: prevRequestStates } = prevProps;
    if (requestIsSuccess(requestStates[RECORD_ENROLLMENT_EVENT])
      && requestIsPending(prevRequestStates[RECORD_ENROLLMENT_EVENT])) {
      this.resetFormData();
      onClose();
    }
  }

  resetFormData = () => {
    this.setState({ formData: {} });
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

  renderHeader = () => {
    const { onClose } = this.props;
    return <Header onClose={onClose} />;
  }

  renderFooter = () => {
    const { requestStates } = this.props;
    const isSubmitting :boolean = requestIsPending(requestStates[RECORD_ENROLLMENT_EVENT]);
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={this.onSubmit}
          textPrimary="Save" />
    );
  }

  render() {
    const { isOpen, onClose, providers } = this.props;
    const { formData } = this.state;
    const hydratedSchema :Object = hydrateEventSchema(schema, providers);
    return (
      <Modal
          isVisible={isOpen}
          onClickPrimary={this.onSubmit}
          onClose={onClose}
          textPrimary="Save"
          viewportScrolling
          withFooter={this.renderFooter}
          withHeader={this.renderHeader}>
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
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [PROVIDERS]: event.get(PROVIDERS),
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
