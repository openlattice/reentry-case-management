// @flow
import React from 'react';
import styled from 'styled-components';
import {
  CardSegment,
  Checkbox,
  DatePicker,
  Modal,
  ModalFooter
} from 'lattice-ui-kit';

import ModalHeader from '../../components/modal/ModalHeader';

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
  isVisible :boolean;
  onClose :() => void;
};

const DownloadPeopleModal = ({ isVisible, onClose } :Props) => {

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Download" />);
  const renderFooter = () => {
    const isSubmitting :boolean = false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={() => {}}
          textPrimary="Download" />
    );
  };
  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textPrimary="Download"
        withHeader={renderHeader}
        withFooter={renderFooter}>
      <FixedWidthModal>
        <CardSegment padding="0" vertical>
          <Text>Select the month and type of report you wish to download.</Text>
          <Text>Month</Text>
          <DatePicker />
          <TextWithMoreMargin>List Type</TextWithMoreMargin>
          <Checkbox
              label="New Intakes"
              onChange={() => {}} />
          <Checkbox
              label="Active Enrollments"
              onChange={() => {}} />
        </CardSegment>
      </FixedWidthModal>
    </Modal>
  );
};

export default DownloadPeopleModal;
