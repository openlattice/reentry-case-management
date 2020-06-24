// @flow
import React from 'react';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
  Label,
} from 'lattice-ui-kit';

import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { getAddress, getPersonContactData } from '../utils/ContactsUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { LOCATION } = APP_TYPE_FQNS;

const labelMap = Map({
  phone: 'Phone number',
  email: 'Email',
  preferredMethod: 'Preferred method',
  preferredTime: 'Preferred time',
});

type Props = {
  participantNeighbors :Map;
};

const ContactInfoCard = ({ participantNeighbors } :Props) => {

  const contactData :Map = getPersonContactData(participantNeighbors);
  const addressList :List = participantNeighbors.get(LOCATION, List());
  const address :Map = addressList.get(0);
  const addressString :string = getAddress(address);

  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Contacts</SmallCardHeaderTitle>
      </CardHeaderWithButtons>
      <CardSegment>
        <DataGrid
            data={contactData}
            emptyString={EMPTY_FIELD}
            labelMap={labelMap}
            truncate />
        <Label subtle>Address</Label>
        <div>{ addressString }</div>
      </CardSegment>
    </Card>
  );
};

export default ContactInfoCard;
