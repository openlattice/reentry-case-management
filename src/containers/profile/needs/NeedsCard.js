// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';

import EditNeedsModal from './EditNeedsModal';

import EditButton from '../../../components/buttons/EditButton';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';

const { NEUTRAL } = Colors;
const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = PROPERTY_TYPE_FQNS;

const NeedsTag = styled.div`
  background-color: ${NEUTRAL.N50};
  border-radius: 3px;
  color: ${NEUTRAL.N700};
  font-size: 14px;
  margin-right: 20px;
  padding: 12px 20px;
  text-align: center;
`;

const Notes = styled.div`
  font-size: 14px;
`;

type Props = {
  participantNeighbors :Map;
};

const NeedsCard = ({ participantNeighbors } :Props) => {
  const [editModalVisible, setEditModalVisibility] = useState(false);
  const needs :string[] = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, TYPE], []);
  const notes :string = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, NOTES, 0], '');
  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Needs</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
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
      <EditNeedsModal
          isVisible={editModalVisible}
          needsAssessment={participantNeighbors.getIn([NEEDS_ASSESSMENT, 0], Map())}
          onClose={() => setEditModalVisibility(false)} />
    </Card>
  );
};

export default NeedsCard;
