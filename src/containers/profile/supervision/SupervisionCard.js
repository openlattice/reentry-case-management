// @flow
import React from 'react';

import { Map, OrderedMap } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  DataGrid,
} from 'lattice-ui-kit';

import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { formatGridData } from '../utils/SupervisionUtils';

const labelMap = OrderedMap({
  supervisionType: 'Supervision type',
  level: 'Level',
  endDate: 'End date',
  officerName: 'Officer name',
  officerPhone: 'Officer phone',
  officerEmail: 'Officer email',
  attorneyName: 'Attorney name',
  attorneyPhone: 'Attorney phone',
  attorneyEmail: 'Attorney email',
});

type Props = {
  participantNeighbors :Map;
  supervisionNeighbors :Map;
};

const SupervisionCard = ({ participantNeighbors, supervisionNeighbors } :Props) => {
  const gridData = formatGridData(participantNeighbors, supervisionNeighbors);
  return (
    <Card>
      <CardHeader padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Supervision</SmallCardHeaderTitle>
      </CardHeader>
      <CardSegment>
        <DataGrid
            columns={3}
            data={gridData}
            emptyString={EMPTY_FIELD}
            labelMap={labelMap}
            truncate />
      </CardSegment>
    </Card>
  );
};

export default SupervisionCard;
