// @flow

import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form } from 'lattice-fabricate';

import COLORS from '../../core/style/Colors';

import { personInformationSchema, personInformationUiSchema } from './schemas/PersonInformationSchemas';

const CustomCardHeader = styled(CardHeader)`
  color: ${COLORS.GRAY_01};
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
`;

const PersonInformationForm = () => (
  <Card>
    <CustomCardHeader padding="30px">Person Information</CustomCardHeader>
    <Form
        schema={personInformationSchema}
        uiSchema={personInformationUiSchema} />
  </Card>
);

export default PersonInformationForm;
