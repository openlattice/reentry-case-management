// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  Label,
} from 'lattice-ui-kit';

import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { getEKID } from '../../../utils/DataUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { HEARINGS } = APP_TYPE_FQNS;
const { DATE, TYPE } = PROPERTY_TYPE_FQNS;
const labelMap = Map({
  courtDate: ' ',
  hearingType: ' ',
});

const CourtDatesGrid = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: row;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 20px 30px;
`;

type Props = {
  participantNeighbors :Map;
};

const CourtDatesCard = ({ participantNeighbors } :Props) => {
  const [editModalVisible, setEditModalVisibility] = useState(false);
  const hearings :List = participantNeighbors.get(HEARINGS, List());
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
          hearings.map((hearing :Map) => (
            <CourtDatesGrid key={getEKID(hearing)}>
              <div>{ DateTime.fromISO(hearing.getIn([DATE, 0])).toLocaleString(DateTime.DATE_SHORT) }</div>
              <div>{ hearing.getIn([TYPE, 0]) }</div>
            </CourtDatesGrid>
          ))
        }
      </CardSegment>
    </Card>
  );
};

export default CourtDatesCard;
