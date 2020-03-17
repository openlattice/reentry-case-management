// @flow
import React, { useCallback, useEffect } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ModalHeader from '../../../components/modal/ModalHeader';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import { MARK_FOLLOW_UP_AS_COMPLETE, clearSubmissionRequestStates, markFollowUpAsComplete } from './FollowUpsActions';
import {
  APP,
  EDM,
  PARTICIPANT_FOLLOW_UPS,
  SHARED,
} from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_STATUSES } from './FollowUpsConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { FOLLOW_UPS, MEETINGS } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DATETIME_END,
  GENERAL_STATUS,
  STATUS
} = PROPERTY_TYPE_FQNS;

type Props = {
  actions :{
    clearSubmissionRequestStates :() => ({ type :string });
    markFollowUpAsComplete :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  followUpEKID :UUID;
  isVisible :boolean;
  meeting :Map;
  onClose :() => void;
  propertyTypeIdsByFqn :Map;
  requestStates :{
    MARK_FOLLOW_UP_AS_COMPLETE :RequestState;
  };
};

const CompleteFollowUpModal = ({
  actions,
  entitySetIdsByFqn,
  followUpEKID,
  isVisible,
  meeting,
  onClose,
  propertyTypeIdsByFqn,
  requestStates,
} :Props) => {

  const closeModal = useCallback(() => {
    actions.clearSubmissionRequestStates();
    onClose();
  }, [actions, onClose]);
  useEffect(() => {
    if (requestIsSuccess(requestStates[MARK_FOLLOW_UP_AS_COMPLETE])) {
      closeModal();
    }
  }, [closeModal, requestStates]);

  const onSubmit = () => {
    const followUpESID :UUID = entitySetIdsByFqn.get(FOLLOW_UPS);
    const dateTimeCompletedPTID :UUID = propertyTypeIdsByFqn.get(DATETIME_COMPLETED);
    const statusPTID :UUID = propertyTypeIdsByFqn.get(STATUS);
    const now :string = DateTime.local().toISO();
    const dataToEdit :Object = {
      [followUpESID]: {
        [followUpEKID]: {
          [dateTimeCompletedPTID]: [now],
          [statusPTID]: [FOLLOW_UPS_STATUSES.DONE]
        }
      }
    };
    if (!meeting.isEmpty()) {
      const meetingsESID :UUID = entitySetIdsByFqn.get(MEETINGS);
      const dateTimeEndPTID :UUID = propertyTypeIdsByFqn.get(DATETIME_END);
      const generalStatusPTID :UUID = propertyTypeIdsByFqn.get(GENERAL_STATUS);
      const meetingEKID :UUID = getEKID(meeting);
      dataToEdit[meetingsESID] = {
        [meetingEKID]: {
          [dateTimeEndPTID]: [now],
          [generalStatusPTID]: [FOLLOW_UPS_STATUSES.DONE]
        }
      };
    }
    actions.markFollowUpAsComplete({ entityData: dataToEdit });
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Mark as Complete" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(requestStates[MARK_FOLLOW_UP_AS_COMPLETE]);
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          onClickSecondary={closeModal}
          textPrimary="Yes"
          textSecondary="No" />
    );
  };
  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={onSubmit}
        onClickSecondary={closeModal}
        onClose={closeModal}
        textPrimary="Save"
        textSecondary="Discard"
        viewportScrolling
        withFooter={renderFooter}
        withHeader={renderHeader}>
      <div>Are you sure you want to mark this follow-up as complete?</div>
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const participantFollowUps :Map = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [MARK_FOLLOW_UP_AS_COMPLETE]: participantFollowUps.getIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearSubmissionRequestStates,
    markFollowUpAsComplete,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CompleteFollowUpModal);
