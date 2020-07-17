// @flow
import React from 'react';
import type { Node } from 'react';

import { faPen } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

type Props = {
  children ?:Node;
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
    <Button onClick={onClick} startIcon={EditIcon}>
      {children}
    </Button>
  );
};

EditButton.defaultProps = {
  children: undefined,
};

export default EditButton;
