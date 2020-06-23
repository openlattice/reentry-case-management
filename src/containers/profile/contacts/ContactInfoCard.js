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
import { isDefined } from '../../../utils/LangUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { CONTACT_INFO } = APP_TYPE_FQNS;
const {
  EMAIL,
  GENERAL_NOTES,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
} = PROPERTY_TYPE_FQNS;

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

  const contactData :Map = Map().withMutations((map :Map) => {
    const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());
    const preferredContact = contactInfoEntities.find((contact :Map) => contact.has(PREFERRED));
    if (isDefined(preferredContact)) {
      const {
        [PREFERRED_METHOD_OF_CONTACT]: preferredMethod,
        [GENERAL_NOTES]: preferredTime
      } = getEntityProperties(preferredContact, [GENERAL_NOTES, PREFERRED_METHOD_OF_CONTACT]);
      map.set('preferredMethod', preferredMethod);
      map.set('preferredTime', preferredTime);
    }
    const email = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
    if (isDefined(email)) map.set('email', email.getIn([EMAIL, 0]));
    const phone = contactInfoEntities.find((contact :Map) => contact.has(PHONE_NUMBER));
    if (isDefined(phone)) map.set('phone', phone.getIn([PHONE_NUMBER, 0]));
  });

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
      </CardSegment>
    </Card>
  );
};

export default ContactInfoCard;
