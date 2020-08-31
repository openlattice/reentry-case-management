// @flow
import React from 'react';

import { List, Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
} from 'lattice-ui-kit';

import CaseNotesTable from './CaseNotesTable';

import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { SmallCardHeaderTitle } from '../profile/styled/GeneralProfileStyles';

const { MEETINGS } = APP_TYPE_FQNS;

type Props = {
  participantNeighbors :Map;
  staffByMeetingEKID :Map;
};

const CaseNotesProfileCard = ({
  participantNeighbors,
  staffByMeetingEKID,
} :Props) => {

  const meetings :List = participantNeighbors.get(MEETINGS, List());
  return (
    <Card>
      <CardHeader padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Case Management Notes</SmallCardHeaderTitle>
      </CardHeader>
      <CardSegment padding="0">
        <CaseNotesTable meetings={meetings} staffByMeetingEKID={staffByMeetingEKID} />
      </CardSegment>
    </Card>
  );
};

export default CaseNotesProfileCard;
