// @flow
import styled from 'styled-components';
import { Button, Colors } from 'lattice-ui-kit';
import { NavLink } from 'react-router-dom';

import COLORS from '../../../core/style/Colors';

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

// card titles:
const CardHeaderTitle = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
`;

const SmallCardHeaderTitle = styled(CardHeaderTitle)`
  color: ${NEUTRALS[0]};
  font-size: 20px;
`;

export {
  CardHeaderTitle,
  GrayerButton,
  Header,
  NameHeader,
  SmallCardHeaderTitle,
};
