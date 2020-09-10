// @flow
import React from 'react';

import { Map, OrderedMap } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
} from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';

import EditButton from '../../../components/buttons/EditButton';
import { EDIT_SUPERVISION, PARTICIPANT_ID } from '../../../core/router/Routes';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
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
  personEKID :UUID;
  supervisionNeighbors :Map;
};

const SupervisionCard = ({ participantNeighbors, personEKID, supervisionNeighbors } :Props) => {
  const goToEditSupervisionPage = useGoToRoute(EDIT_SUPERVISION.replace(PARTICIPANT_ID, personEKID));
  const gridData = formatGridData(participantNeighbors, supervisionNeighbors);
  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Supervision</SmallCardHeaderTitle>
        <EditButton onClick={goToEditSupervisionPage}>Edit</EditButton>
      </CardHeaderWithButtons>
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
