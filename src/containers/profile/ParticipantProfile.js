// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  DataGrid
} from 'lattice-ui-kit';
// $FlowFixMe
import { faUser } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import COLORS from '../../core/style/Colors';

const { NEUTRALS, PURPLES } = Colors;
const carrot = '>';

const HeaderWrapper = styled.div`
  display: flex;
  margin-bottom: 21px;
`;

const Header = styled.div`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${PURPLES[1]};
  text-transform: uppercase;
`;

const NameHeader = styled(Header)`
  color: ${NEUTRALS[1]};
  font-weight: 500;
`;

const Carrot = styled(NameHeader)`
  margin: 0 10px;
`;

const CardHeaderTitle = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
`;

const CardInnerWrapper = styled.div`
  display: flex;
`;

const ParticipantProfile = () => (
  <>
    <HeaderWrapper>
      <Header>PARTICIPANTS</Header>
      <Carrot>{carrot}</Carrot>
      <NameHeader>PERSON NAME</NameHeader>
    </HeaderWrapper>
    <CardStack>
      <Card>
        <CardHeader padding="30px">
          <CardHeaderTitle>Person Profile</CardHeaderTitle>
        </CardHeader>
        <CardSegment padding="30px">
          <CardInnerWrapper>
            <FontAwesomeIcon color={NEUTRALS[3]} icon={faUser} size="6x" />
            <DataGrid
                data={Map()}
                labelMap={Map()} />
          </CardInnerWrapper>
        </CardSegment>
      </Card>
    </CardStack>
  </>
);

export default ParticipantProfile;
