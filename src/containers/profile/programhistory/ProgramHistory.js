// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';

import EditEventModal from './EditEventModal';
import EditReleaseInfoModal from './EditReleaseInfoModal';
import Event from './Event';
import { schema, uiSchema } from './schemas/EditEnrollmentDateSchemas';

import EditButton from '../../../components/buttons/EditButton';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from '../styled/EventStyles';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { getMostRecentReleaseDate, getReentryEnrollmentDate } from '../utils/ProfileUtils';

const { NEUTRAL } = Colors;
const {
  ENROLLMENT_STATUS,
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  NAME,
  SOURCE,
} = PROPERTY_TYPE_FQNS;

const EventsCard = styled(Card)`
  & > ${CardSegment} {
    border: none;
  }
`;

const GrayBar = styled(CardSegment)`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  color: ${NEUTRAL.N600};
  justify-content: space-between;
  font-size: 14px;
  line-height: 1.35;
`;

type Props = {
  contactNameByProviderEKID :Map;
  incarcerationFacilities :List;
  participantNeighbors :Map;
  providerByStatusEKID :Map;
};

const ProgramHistory = ({
  contactNameByProviderEKID,
  incarcerationFacilities,
  participantNeighbors,
  providerByStatusEKID,
} :Props) => {

  const [editModalVisible, setEditModalVisibility] = useState(false);
  const [editEventModalVisible, setEditEventModalVisibility] = useState(false);

  const enrollmentDate :string = getReentryEnrollmentDate(participantNeighbors);
  const referralSource :string = `Referred from: ${participantNeighbors
    .getIn([REFERRAL_REQUEST, 0, SOURCE, 0], EMPTY_FIELD)}`;
  const releaseDate = getMostRecentReleaseDate(participantNeighbors.get(MANUAL_JAIL_STAYS, List()));
  const facilityList = participantNeighbors.get(MANUAL_JAILS_PRISONS, List());
  const facility :Map = facilityList.get(0, Map());
  const { [NAME]: facilityReleasedFrom } = getEntityProperties(facility, [NAME]);
  const releaseText
    :string = `Released from: ${facilityReleasedFrom || 'Unknown'}${releaseDate ? ` on ${releaseDate}` : ''}`;

  let enrollmentEvents :List = participantNeighbors.get(ENROLLMENT_STATUS, List());
  enrollmentEvents = sortEntitiesByDateProperty(enrollmentEvents, [EFFECTIVE_DATE]).reverse();
  const needsAssessment :Map = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0], Map());
  return (
    <EventsCard>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Program History</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
      <GrayBar padding="15px 30px" vertical={false}>
        <div>{ referralSource }</div>
        { (releaseDate || facilityReleasedFrom) && (<div>{ releaseText }</div>) }
      </GrayBar>
      {
        enrollmentEvents.map((enrollmentStatus :Map) => (
          <Event
              contactNameByProviderEKID={contactNameByProviderEKID}
              enrollmentStatus={enrollmentStatus}
              key={getEKID(enrollmentStatus)}
              providerByStatusEKID={providerByStatusEKID} />
        ))
      }
      <CardSegment padding="25px 30px" vertical={false}>
        <CardInnerWrapper>
          <EventDateWrapper>{ enrollmentDate }</EventDateWrapper>
          <EventWrapper>
            <EventStatusText>ENROLLED</EventStatusText>
            <EventText>Re-entry Program</EventText>
          </EventWrapper>
        </CardInnerWrapper>
        <div><EditButton onClick={() => setEditEventModalVisibility(true)} /></div>
      </CardSegment>
      <EditReleaseInfoModal
          incarcerationFacilities={incarcerationFacilities}
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          participantNeighbors={participantNeighbors} />
      <EditEventModal
          isVisible={editEventModalVisible}
          needsAssessment={needsAssessment}
          onClose={() => setEditEventModalVisibility(false)}
          schema={schema}
          uiSchema={uiSchema} />
    </EventsCard>
  );
};

export default ProgramHistory;
