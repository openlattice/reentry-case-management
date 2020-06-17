// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  EditButton,
  Spinner,
} from 'lattice-ui-kit';

import Event from '../events/Event';
import EditReleaseInfoModal from './EditReleaseInfoModal';
import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from '../styled/EventStyles';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { getEKID } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { getMostRecentReleaseDate, getReentryEnrollmentDate } from '../utils/ProfileUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { NEUTRALS } = Colors;
const {
  ENROLLMENT_STATUS,
  MANUAL_JAIL_STAYS,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  SOURCE,
} = PROPERTY_TYPE_FQNS;

const EventsCard = styled(Card)`
  & > ${CardSegment} {
    border: none;
  }
`;

const GrayBar = styled(CardSegment)`
  align-items: center;
  background-color: ${NEUTRALS[6]};
  color: ${NEUTRALS[0]};
  justify-content: space-between;
  font-size: 14px;
  line-height: 1.35;
`;

type Props = {
  contactNameByProviderEKID :Map;
  participantNeighbors :Map;
  providerByStatusEKID :Map;
};

const ProgramHistory = ({ contactNameByProviderEKID, participantNeighbors, providerByStatusEKID } :Props) => {
  const [editModalVisible, setEditModalVisibility] = useState(false);

  const enrollmentDate :string = getReentryEnrollmentDate(participantNeighbors);
  const referralSource :string = `Referred from: ${participantNeighbors
    .getIn([REFERRAL_REQUEST, 0, SOURCE, 0], EMPTY_FIELD)}`;

  let enrollmentEvents :List = participantNeighbors.get(ENROLLMENT_STATUS, List());
  enrollmentEvents = sortEntitiesByDateProperty(enrollmentEvents, [EFFECTIVE_DATE]).reverse();

  const releaseDate :string = getMostRecentReleaseDate(participantNeighbors.get(MANUAL_JAIL_STAYS, List()));
  const releaseText :string = `Released: ${releaseDate}`;
  return (
    <EventsCard>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Program History</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
      <GrayBar padding="15px 30px" vertical={false}>
        <div>{ referralSource }</div>
        { releaseDate && (<div>{ releaseText }</div>) }
      </GrayBar>
      {
        !enrollmentEvents.isEmpty() && (
          enrollmentEvents.map((enrollmentStatus :Map) => (
            <Event
                key={getEKID(enrollmentStatus)}
                contactNameByProviderEKID={contactNameByProviderEKID}
                enrollmentStatus={enrollmentStatus}
                providerByStatusEKID={providerByStatusEKID} />
          ))
        )
      }
      <CardSegment padding="25px 30px">
        <CardInnerWrapper>
          <EventDateWrapper>{ enrollmentDate }</EventDateWrapper>
          <EventWrapper>
            <EventStatusText>ENROLLED</EventStatusText>
            <EventText>Re-entry Program</EventText>
          </EventWrapper>
        </CardInnerWrapper>
      </CardSegment>
      <EditReleaseInfoModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)} />
    </EventsCard>
  );
};

export default ProgramHistory;
