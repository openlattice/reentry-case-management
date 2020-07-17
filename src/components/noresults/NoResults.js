// @flow
import React from 'react';

import styled from 'styled-components';
import { faFolderOpen } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardSegment, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const Wrapper = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  color: ${NEUTRAL.N600};
  margin-top: 20px;
`;

type Props = {
  text :string;
};

const NoResults = ({ text } :Props) => (
  <Wrapper vertical>
    <FontAwesomeIcon color={NEUTRAL.N300} icon={faFolderOpen} size="3x" />
    <Text>{ text }</Text>
  </Wrapper>
);

export default NoResults;
