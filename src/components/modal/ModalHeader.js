// @flow
import React from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardSegment, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const ModalCardSegment = styled(CardSegment)`
  justify-content: space-between;
`;

const ModalTitle = styled.div`
  color: ${NEUTRAL.N600};
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

type HeaderProps = {
  onClose :() => void;
  title :string;
};

const ModalHeader = ({ onClose, title } :HeaderProps) => (
  <ModalCardSegment padding="30px 30px 20px" vertical={false}>
    <ModalTitle>{ title }</ModalTitle>
    <CloseButton onClick={onClose}>
      <FontAwesomeIcon icon={faTimes} size="lg" />
    </CloseButton>
  </ModalCardSegment>
);

export default ModalHeader;
