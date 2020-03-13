// @flow
import styled from 'styled-components';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import COLORS from '../../../../core/style/Colors';

const { WHITE } = Colors;
const { getStickyPosition } = StyleUtils;

const StyledTableRow = styled.tr`
  background-color: ${WHITE};
  border-bottom: 1px solid ${COLORS.GRAY_04};
  font-size: 14px;
  padding: 20px 34px;

  :last-of-type {
    border-bottom: none;
  }

  td,
  th {
    ${getStickyPosition}
  }

  &:hover {
    cursor: pointer;
  }
`;

/* eslint-disable import/prefer-default-export */
export {
  StyledTableRow,
};
