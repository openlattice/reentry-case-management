// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { CardSegment, Colors, EditButton } from 'lattice-ui-kit';

import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from '../styled/EventStyles';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { NEUTRALS } = Colors;
const { EFFECTIVE_DATE, NAME, STATUS } = PROPERTY_TYPE_FQNS;

const EventCardSegment = styled(CardSegment)`
  border-bottom: 1px solid ${NEUTRALS[4]};
`;

type Props = {
  contactNameByProviderEKID :Map;
  enrollmentStatus :Map;
  providerByStatusEKID :Map;
};

const Event = ({
  contactNameByProviderEKID,
  enrollmentStatus,
  providerByStatusEKID,
} :Props) => {

  const [editModalVisible, setEditModalVisibility] = useState(false);

  const { [EFFECTIVE_DATE]: datetime, [STATUS]: status } = getEntityProperties(
    enrollmentStatus,
    [EFFECTIVE_DATE, STATUS]
  );
  const date :string = DateTime.fromISO(datetime).toLocaleString(DateTime.DATE_SHORT);
  const enrollmentStatusEKID :UUID = getEKID(enrollmentStatus);
  const provider :Map = providerByStatusEKID.get(enrollmentStatusEKID, Map());
  const { [NAME]: name } = getEntityProperties(provider, [NAME]);
  const providerName :string = typeof name === 'string' ? name : name[0];
  const relatedOrganization :string = `Related Organization: ${providerName || EMPTY_FIELD}`;
  const providerEKID :UUID = getEKID(provider);
  const contactName :string = contactNameByProviderEKID.get(providerEKID, EMPTY_FIELD);
  const pointofContact :string = `Point of Contact: ${contactName}`;
  return (
    <EventCardSegment key={enrollmentStatusEKID} padding="25px 30px" vertical={false}>
      <CardInnerWrapper>
        <EventDateWrapper>{ date }</EventDateWrapper>
        <EventWrapper>
          <EventStatusText>{ status }</EventStatusText>
          <EventText>{ relatedOrganization }</EventText>
          <EventText>{ pointofContact }</EventText>
        </EventWrapper>
      </CardInnerWrapper>
      <div><EditButton onClick={() => setEditModalVisibility(true)} /></div>
    </EventCardSegment>
  );
};

export default Event;
