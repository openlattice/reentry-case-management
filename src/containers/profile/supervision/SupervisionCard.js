// @flow
import React from 'react';

import { List, Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  DataGrid,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';

const { ATTORNEYS, OFFICERS, PROBATION_PAROLE } = APP_TYPE_FQNS;
const { LEVEL, RECOGNIZED_END_DATETIME, TYPE } = PROPERTY_TYPE_FQNS;

const labelMap = Map({
  supervisionType: 'Supervision type',
  level: 'Level',
  endDate: 'End date',
  officerName: 'Officer name',
  attorneyName: 'Attorney name',
});

type Props = {
  participantNeighbors :Map;
  supervisionNeighbors :Map;
};

const SupervisionCard = ({ participantNeighbors, supervisionNeighbors } :Props) => {
  const supervisionList :List = participantNeighbors.get(PROBATION_PAROLE, List());
  const {
    [LEVEL]: level,
    [RECOGNIZED_END_DATETIME]: endDateTime,
    [TYPE]: supervisionType
  } = getEntityProperties(supervisionList.get(0), [LEVEL, RECOGNIZED_END_DATETIME, TYPE]);

  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());
  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());
  const gridData = Map({
    supervisionType,
    level,
    endDate: DateTime.fromISO(endDateTime).toLocaleString(DateTime.DATE_SHORT),
    officerName: getPersonFullName(officer),
    attorneyName: getPersonFullName(attorney),
  });
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
