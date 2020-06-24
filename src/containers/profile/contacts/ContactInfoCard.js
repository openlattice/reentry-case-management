// @flow
import React, { useState } from 'react';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  Label,
} from 'lattice-ui-kit';

import EditContactInfoModal from './EditContactInfoModal';
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

  const [editModalVisible, setEditModalVisibility] = useState(false);
  const contactData :Map = getPersonContactData(participantNeighbors);
  const addressList :List = participantNeighbors.get(LOCATION, List());
  const address :Map = addressList.get(0);
  const addressString :string = getAddress(address);

  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Contacts</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
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
      <EditContactInfoModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          participantNeighbors={participantNeighbors} />
    </Card>
  );
};

export default ContactInfoCard;
