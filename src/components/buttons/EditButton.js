// @flow
import React from 'react';

import styled from 'styled-components';
import { faPen } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const IconMarginRight = styled.span`
  margin: 0 8px 0 0;
`;

type Props = {
  children ? :any;
  onClick :() => void;
};

const EditIcon = (
  <FontAwesomeIcon color={NEUTRAL.N700} icon={faPen} />
);

const EditButton = ({ children, onClick } :Props) => {

  if (!children) {
    return (
      <Button onClick={onClick}>{EditIcon}</Button>
    );
  }

  return (
    <Button onClick={onClick}>
      <IconMarginRight>{EditIcon}</IconMarginRight>
      {children}
    </Button>
  );
};

EditButton.defaultProps = {
  children: undefined,
};

export default EditButton;
