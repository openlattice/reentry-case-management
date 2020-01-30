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

const FIELDS :Object = [
  {
    label: 'Last name',
    field: <Input />
  },
  {
    label: 'First name',
    field: <Input />
  },
  {
    label: 'Start date',
    field: <DatePicker />
  },
  {
    label: 'End date',
    field: <DatePicker />
  },
];

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
  grid-gap: 20px;
  grid-template-columns: 1fr 1fr;
  width: 100%;
`;

const Releases = () => (
  <ContainerWrapper>
    <HeaderRowWrapper>
      <Header>New Releases</Header>
      <StyledButton mode="primary">New Intake</StyledButton>
    </HeaderRowWrapper>
    <Card>
      <CardSegment padding="30px">
        <Grid>
          {
            FIELDS.map((fieldObject :Object) => (
              <div key={fieldObject.label}>
                <div>{fieldObject.label}</div>
                {fieldObject.field}
              </div>
            ))
          }
          <Button mode="primary">Search</Button>
        </Grid>
      </CardSegment>
    </Card>
  </ContainerWrapper>
);

export default Releases;
