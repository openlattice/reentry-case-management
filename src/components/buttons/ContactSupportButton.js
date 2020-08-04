// @flow
import React from 'react';

import styled from 'styled-components';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const SupportButton = styled(Button)`
  bottom: 16px;
  position: fixed;
  right: 16px;
  width: 200px;
`;

const QuestionMarkIcon = styled(FontAwesomeIcon).attrs(() => ({
  color: NEUTRAL.N900,
  icon: faQuestionCircle,
  fixedWidth: true,
}))`
  margin-right: 5px;
  font-size: 15px;
`;

const ContactSupportButton = () => (
  <SupportButton
      href="https://support.openlattice.com/servicedesk/customer/portal/1"
      target="_blank"
      variant="outlined">
    <QuestionMarkIcon />
    <span>Contact Support</span>
  </SupportButton>
);

export default ContactSupportButton;
