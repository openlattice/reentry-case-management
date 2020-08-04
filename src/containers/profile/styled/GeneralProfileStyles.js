// @flow
import styled from 'styled-components';
import { Button, CardHeader, Colors } from 'lattice-ui-kit';
import { NavLink } from 'react-router-dom';

const { NEUTRAL, PURPLE } = Colors;

// Breadcrumbs contents:
const Header = styled(NavLink)`
  color: ${PURPLE.P300};
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
  text-transform: uppercase;
`;

const NameHeader = styled(Header)`
  color: ${NEUTRAL.N500};
  font-weight: 500;
`;

// Buttons:
const GrayerButton = styled(Button)`
  background-color: ${NEUTRAL.N100};
`;

// card titles:
const CardHeaderTitle = styled.div`
  font-size: 22px;
  font-weight: 600;
`;

const SmallCardHeaderTitle = styled(CardHeaderTitle)`
  color: ${NEUTRAL.N600};
  font-size: 20px;
`;

const CardHeaderWithButtons = styled(CardHeader)`
  align-items: center;
  justify-content: space-between;
`;

export {
  CardHeaderTitle,
  CardHeaderWithButtons,
  GrayerButton,
  Header,
  NameHeader,
  SmallCardHeaderTitle,
};
