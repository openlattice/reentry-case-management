// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors,
  EditButton,
} from 'lattice-ui-kit';

import { SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import COLORS from '../../../core/style/Colors';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS } = Colors;
const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = PROPERTY_TYPE_FQNS;

const NeedsCardHeader = styled(CardHeader)`
  align-items: center;
  justify-content: space-between;
`;

const NeedsTag = styled.div`
  background-color: ${NEUTRALS[6]};
  border-radius: 3px;
  color: ${NEUTRALS[1]};
  font-size: 14px;
  line-height: 1.35;
  margin-right: 20px;
  padding: 12px 20px;
  text-align: center;
`;

const Notes = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  line-height: 1.35;
`;

type Props = {
  participantNeighbors :Map;
};

const NeedsCard = ({ participantNeighbors } :Props) => {
  const needs :string[] = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, TYPE], []);
  const notes :string = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, NOTES, 0], '');
  return (
    <Card>
      <NeedsCardHeader padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Needs</SmallCardHeaderTitle>
        <EditButton onClick={() => {}}>Edit</EditButton>
      </NeedsCardHeader>
      {
        needs && (
          <CardSegment padding="30px" vertical={false}>
            { needs.map((need :string) => <NeedsTag key={need}>{ need }</NeedsTag>) }
          </CardSegment>
        )
      }
      {
        notes && (
          <CardSegment padding="30px">
            <Notes>{ notes }</Notes>
          </CardSegment>
        )
      }
    </Card>
  );
};

export default NeedsCard;
