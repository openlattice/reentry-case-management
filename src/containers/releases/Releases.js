// @flow
import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Card,
  CardSegment,
  DatePicker,
  Input,
} from 'lattice-ui-kit';

import COLORS from '../../core/style/Colors';

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const HeaderRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
  width: 100%;
`;

const Header = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const StyledButton = styled(Button)`
  font-size: 14px;
  padding: 8px 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 20px;
  width: 100%;
`;

const Releases = () => (
  <ContainerWrapper>
    <HeaderRowWrapper>
      <Header>New Releases</Header>
      <StyledButton mode="primary">New Intake</StyledButton>
    </HeaderRowWrapper>
    <Card>
      <CardSegment padding="30px" vertical>
        <Grid>
          <div>
            <div>Last name</div>
            <Input />
          </div>
          <div>
            <div>First name</div>
            <Input />
          </div>
          <div>
            <div>Start date</div>
            <DatePicker />
          </div>
          <div>
            <div>End date</div>
            <DatePicker />
          </div>
        </Grid>
        <Button>Search People</Button>
      </CardSegment>
    </Card>
  </ContainerWrapper>
);

export default Releases;
