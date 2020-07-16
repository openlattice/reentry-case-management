// @flow
import React from 'react';

import { faPen } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, IconButton } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

type Props = {
  onClick :() => void;
};

const EditButton = ({ onClick } :Props) => (
  <IconButton
      icon={<FontAwesomeIcon color={NEUTRAL.N700} icon={faPen} />}
      onClick={onClick} />
);

export default EditButton;
