// @flow
import React, { useState } from 'react';

import { Map } from 'immutable';
import { CardSegment } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { useDispatch } from 'react-redux';

import EditEventModal from './EditEventModal';

import EditButton from '../../../components/buttons/EditButton';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { getProviders } from '../../providers/ProvidersActions';
import { schema, uiSchema } from '../events/schemas/RecordEventSchemas';
import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from '../styled/EventStyles';

const {
  EFFECTIVE_DATE,
  NAME,
  NOTES,
  STATUS,
} = PROPERTY_TYPE_FQNS;

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
  const dispatch = useDispatch();
  const onOpenEditModal = () => {
    dispatch(getProviders());
    setEditModalVisibility(true);
  };

  const { [EFFECTIVE_DATE]: datetime, [NOTES]: notes, [STATUS]: status } = getEntityProperties(
    enrollmentStatus,
    [EFFECTIVE_DATE, NOTES, STATUS]
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
    <CardSegment key={enrollmentStatusEKID} padding="25px 30px" vertical={false}>
      <CardInnerWrapper>
        <EventDateWrapper>{ date }</EventDateWrapper>
        <EventWrapper>
          <EventStatusText>{ status }</EventStatusText>
          <EventText>{ relatedOrganization }</EventText>
          <EventText>{ pointofContact }</EventText>
          <EventText>{ notes }</EventText>
        </EventWrapper>
      </CardInnerWrapper>
      <div><EditButton onClick={onOpenEditModal} /></div>
      <EditEventModal
          enrollmentStatus={enrollmentStatus}
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          provider={provider}
          schema={schema}
          uiSchema={uiSchema} />
    </CardSegment>
  );
};

export default Event;
