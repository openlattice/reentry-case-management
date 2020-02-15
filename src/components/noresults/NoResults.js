// @flow
import React from 'react';
import styled from 'styled-components';
import { CardSegment, Colors } from 'lattice-ui-kit';
// $FlowFixMe
import { faFolderOpen } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { NEUTRALS } = Colors;

const Wrapper = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  color: ${NEUTRALS[1]};
  margin-top: 20px;
`;

type Props = {
  text :string;
};

const NoResults = ({ text } :Props) => (
  <Wrapper vertical>
    <FontAwesomeIcon color={NEUTRALS[3]} icon={faFolderOpen} size="3x" />
    <Text>{ text }</Text>
  </Wrapper>
);

export default NoResults;
