// @flow
import styled from 'styled-components';
import { Colors, StyleUtils } from 'lattice-ui-kit';

const { getStickyPosition } = StyleUtils;
const { NEUTRAL } = Colors;

const StyledTableRow = styled.tr`
  background-color: white;
  border-bottom: 1px solid ${NEUTRAL.N100};
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
