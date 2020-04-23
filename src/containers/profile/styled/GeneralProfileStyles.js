// @flow
import styled from 'styled-components';
import { Button, Colors } from 'lattice-ui-kit';
import { NavLink } from 'react-router-dom';

const { NEUTRALS, PURPLES } = Colors;

// Breadcrumbs contents:
const Header = styled(NavLink)`
  color: ${PURPLES[1]};
  font-size: 12px;
  font-weight: bold;
  line-height: 1.35;
  text-decoration: none;
  text-transform: uppercase;
`;

const NameHeader = styled(Header)`
  color: ${NEUTRALS[1]};
  font-weight: 500;
`;

// Buttons:
const GrayerButton = styled(Button)`
  background-color: ${NEUTRALS[6]};
`;

export {
  GrayerButton,
  Header,
  NameHeader,
};
