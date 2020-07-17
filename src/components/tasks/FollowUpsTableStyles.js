// @flow
import styled from 'styled-components';
import { StyleUtils } from 'lattice-ui-kit';

import COLORS from '../../core/style/Colors';

const { getStickyPosition } = StyleUtils;

const StyledTableRow = styled.tr`
  background-color: white;
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
