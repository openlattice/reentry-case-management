// @flow
import React from 'react';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  Label,
} from 'lattice-ui-kit';

import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { checkWhetherIsSexOffender, formatSexOffenderData } from '../utils/SexOffenderUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;

const labelMap = Map({
  registeredSexOffender: 'Registered sex offender',
  registeredDate: 'Registered date',
  registryEndDate: 'Registry end date',
  county: 'Registered county',
  state: 'Registered state',
});

type Props = {
  participantNeighbors :Map;
};

const SexOffenderCard = ({ participantNeighbors } :Props) => {
  const sexOffender :List = participantNeighbors.get(SEX_OFFENDER, List());
  const isSexOffender :boolean = checkWhetherIsSexOffender(sexOffender);
  const sexOffenderRegistrationLocation :List = participantNeighbors.get(SEX_OFFENDER_REGISTRATION_LOCATION, List());
  const formattedData = formatSexOffenderData(sexOffender, sexOffenderRegistrationLocation);
  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Sex Offender Registration</SmallCardHeaderTitle>
        <EditButton onClick={() => {}}>Edit</EditButton>
      </CardHeaderWithButtons>
      <CardSegment>
        {
          !isSexOffender
            ? (
              <div>
                <Label subtle>Registered sex offender</Label>
                <div>No</div>
              </div>
            )
            : (
              <DataGrid
                  columns={3}
                  data={formattedData}
                  emptyString={EMPTY_FIELD}
                  labelMap={labelMap}
                  truncate />
            )
        }
      </CardSegment>
    </Card>
  );
};

export default SexOffenderCard;
