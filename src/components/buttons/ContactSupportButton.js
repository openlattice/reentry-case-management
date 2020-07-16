// @flow
import React from 'react';

import styled from 'styled-components';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const SupportButton = styled(Button)`
  background-color: ${NEUTRALS[7]};
  border-color: ${NEUTRALS[7]};
  border-radius: 3px;
  bottom: 30px;
  color: ${NEUTRALS[0]};
  height: 37px;
  padding: 10px 20px;
  position: fixed;
  right: 16px;
  text-decoration: none;
  width: 200px;

  span {
    font-size: 14px;
    font-weight: 600;
  }
`;

const QuestionMarkIcon = styled(FontAwesomeIcon).attrs(() => ({
  color: NEUTRALS[1],
  icon: faQuestionCircle,
  fixedWidth: true,
}))`
  margin-right: 5px;
  font-size: 15px;
`;

const ContactSupportButton = () => (
  <SupportButton href="https://support.openlattice.com/servicedesk/customer/portal/1" target="_blank">
    <QuestionMarkIcon />
    <span>Contact Support</span>
  </SupportButton>
);

export default ContactSupportButton;
