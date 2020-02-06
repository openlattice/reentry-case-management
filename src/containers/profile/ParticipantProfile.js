// @flow
import React from 'react';
import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { PURPLES } = Colors;

const Header = styled.div`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${PURPLES[1]};
  text-transform: uppercase;
`;

const ParticipantProfile = () => (
  <>
    <Header>PARTICIPANTS</Header>
  </>
);

export default ParticipantProfile;
