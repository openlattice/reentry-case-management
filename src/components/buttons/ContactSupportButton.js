// @flow
import React from 'react';

import styled from 'styled-components';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL, WHITE } = Colors;

const SupportButton = styled.a`
  background-color: ${WHITE};
  border-radius: 3px;
  border: 1px solid ${NEUTRAL.N700};
  bottom: 30px;
  color: ${NEUTRAL.N700};
  display: flex;
  font-size: 12px;
  font-weight: 600;
  height: 37px;
  padding: 10px 20px;
  place-items: center;
  position: fixed;
  right: 16px;
  text-decoration: none;
  width: 165px;
`;

const QuestionMarkIcon = styled(FontAwesomeIcon).attrs(() => ({
  color: NEUTRAL.N700,
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
