// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  Label,
} from 'lattice-ui-kit';
import { DateTimeUtils } from 'lattice-utils';

import EditCourtDatesModal from './EditCourtDatesModal';

import EditButton from '../../../components/buttons/EditButton';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';

const { formatAsDate } = DateTimeUtils;
const { HEARINGS } = APP_TYPE_FQNS;
const { DATE, TYPE } = PROPERTY_TYPE_FQNS;

const CourtDatesGrid = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: row;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px 30px;
`;

type Props = {
  participantNeighbors :Map;
};

const CourtDatesCard = ({ participantNeighbors } :Props) => {
  const [editModalVisible, setEditModalVisibility] = useState(false);
  const hearings :List = participantNeighbors.get(HEARINGS, List());
  const sortedHearings :List = sortEntitiesByDateProperty(hearings, [DATE]);
  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Court Dates</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
      <CardSegment>
        <CourtDatesGrid>
          <Label subtle>Court date</Label>
          <Label subtle>Hearing type</Label>
        </CourtDatesGrid>
        {
          sortedHearings.map((hearing :Map) => (
            <CourtDatesGrid key={getEKID(hearing)}>
              <div>{ formatAsDate(hearing.getIn([DATE, 0]), EMPTY_FIELD) }</div>
              <div>{ hearing.getIn([TYPE, 0]) }</div>
            </CourtDatesGrid>
          ))
        }
      </CardSegment>
      <EditCourtDatesModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          participantNeighbors={participantNeighbors} />
    </Card>
  );
};

export default CourtDatesCard;
