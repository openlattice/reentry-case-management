// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  CardSegment,
  Checkbox,
  DatePicker,
  Modal,
  ModalFooter
} from 'lattice-ui-kit';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ModalHeader from '../../components/modal/ModalHeader';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { DOWNLOAD_PARTICIPANTS, clearDownloadRequestState, downloadParticipants } from './ReportsActions';
import { REPORTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;

const FixedWidthModal = styled.div`
  width: 575px;
`;

const Text = styled.div`
  margin: 10px 0;
`;

const TextWithMoreMargin = styled(Text)`
  margin-top: 27px;
`;

type Props = {
  actions :{
    clearDownloadRequestState :RequestSequence;
    downloadParticipants :RequestSequence;
  };
  isVisible :boolean;
  onClose :() => void;
  requestStates :{
    DOWNLOAD_PARTICIPANTS :RequestState;
  };
};

const DownloadPeopleModal = ({
  actions,
  isVisible,
  onClose,
  requestStates,
} :Props) => {

  const [dateSelected, onChangeDate] = useState('');
  const [newIntakesChecked, changeNewIntakesCheckbox] = useState(false);
  const [activeEnrollmentsChecked, changeActiveEnrollmentsCheckbox] = useState(false);
  const onChangeNewIntakes = () => {
    changeNewIntakesCheckbox(!newIntakesChecked);
  };
  const onChangeActiveEnrollments = () => {
    changeActiveEnrollmentsCheckbox(!activeEnrollmentsChecked);
  };

  useEffect(() => {
    if (requestIsSuccess(requestStates[DOWNLOAD_PARTICIPANTS])) {
      actions.clearDownloadRequestState();
      onChangeDate('');
      changeNewIntakesCheckbox(false);
      changeActiveEnrollmentsCheckbox(false);
      onClose();
    }
  }, [actions, onClose, requestStates]);

  const onDownloadClick = () => {
    if (newIntakesChecked || activeEnrollmentsChecked) {
      actions.downloadParticipants({ activeEnrollmentsChecked, dateSelected, newIntakesChecked });
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Download" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(requestStates[DOWNLOAD_PARTICIPANTS]);
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onDownloadClick}
          textPrimary="Download" />
    );
  };
  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={onDownloadClick}
        onClose={onClose}
        textPrimary="Download"
        withHeader={renderHeader}
        withFooter={renderFooter}>
      <FixedWidthModal>
        <CardSegment padding="0" vertical>
          <Text>Select the month and type of report you wish to download.</Text>
          <Text>Month</Text>
          <DatePicker onChange={onChangeDate} />
          <TextWithMoreMargin>List Type</TextWithMoreMargin>
          <Checkbox
              label="New Intakes"
              onChange={onChangeNewIntakes} />
          <Checkbox
              label="All Enrollments (through selected month, if applicable)"
              onChange={onChangeActiveEnrollments} />
        </CardSegment>
      </FixedWidthModal>
    </Modal>
  );
};

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [DOWNLOAD_PARTICIPANTS]: state.getIn([REPORTS.REPORTS, ACTIONS, DOWNLOAD_PARTICIPANTS, REQUEST_STATE]),
  },
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    clearDownloadRequestState,
    downloadParticipants,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DownloadPeopleModal);
