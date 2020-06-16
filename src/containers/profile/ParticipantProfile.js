// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  DataGrid,
  Spinner,
} from 'lattice-ui-kit';
import { faUser } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import * as Routes from '../../core/router/Routes';
import RecordEventModal from './events/RecordEventModal';
import Event from './events/Event';
import NeedsCard from './needs/NeedsCard';
import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from './styled/EventStyles';
import {
  CardHeaderTitle,
  GrayerButton,
  Header,
  NameHeader,
  SmallCardHeaderTitle,
} from './styled/GeneralProfileStyles';
import { getFormattedParticipantData, getMostRecentReleaseDate, getReentryEnrollmentDate } from './utils/ProfileUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { getEKID } from '../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../utils/Utils';
import { goToRoute } from '../../core/router/RoutingActions';
import { LOAD_PROFILE, loadProfile } from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../utils/constants/GeneralConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  CONTACT_NAME_BY_PROVIDER_EKID,
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PROVIDER_BY_STATUS_EKID,
} = PROFILE;
const {
  ENROLLMENT_STATUS,
  MANUAL_JAIL_STAYS,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  SOURCE,
} = PROPERTY_TYPE_FQNS;
const participantGridLabels = Map({
  lastName: 'Last name',
  firstName: 'First name',
  dob: 'Date of birth',
  age: 'Age',
  gender: 'Gender',
  race: 'Race',
  ethnicity: 'Ethnicity',
  preferredContact: 'Pref. Contact',
});

const ProfileCardStack = styled(CardStack)`
  & > div {
    margin: 15px 0;
  }
`;

const HeaderWrapper = styled(CardInnerWrapper)`
  margin-bottom: 21px;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: 153px 153px;
  grid-gap: 0 20px;
`;

const PictureWrapper = styled.div`
  margin-right: 45px;
`;

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
  actions :{
    goToRoute :GoToRoute;
    loadProfile :RequestSequence;
  };
  contactNameByProviderEKID :Map;
  match :Match;
  participant :Map;
  participantNeighbors :Map;
  providerByStatusEKID :Map;
  requestStates :{
    LOAD_PROFILE :RequestState;
  };
};

type State = {
  eventModalIsOpen :boolean;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      eventModalIsOpen: false,
    };
  }

  componentDidMount() {
    const {
      actions,
      match: {
        params: { participantId }
      }
    } = this.props;
    if (participantId) actions.loadProfile({ participantEKID: participantId });
  }

  openEventModal = () => {
    this.setState({ eventModalIsOpen: true });
  }

  closeEventModal = () => {
    this.setState({ eventModalIsOpen: false });
  }

  goToTaskManager = () => {
    const {
      actions,
      match: {
        params: { participantId }
      }
    } = this.props;
    if (participantId) actions.goToRoute(Routes.PARTICIPANT_TASK_MANAGER.replace(':participantId', participantId));
  }

  render() {
    const {
      contactNameByProviderEKID,
      participant,
      participantNeighbors,
      providerByStatusEKID,
      requestStates
    } = this.props;
    const { eventModalIsOpen } = this.state;

    if (requestIsPending(requestStates[LOAD_PROFILE])) {
      return (
        <Spinner size="2x" />
      );
    }

    const personEKID :UUID = getEKID(participant);
    const participantName :string = getPersonFullName(participant);
    const participantData :Map = getFormattedParticipantData(participant, participantNeighbors);
    const enrollmentDate :string = getReentryEnrollmentDate(participantNeighbors);
    const referralSource :string = `Referred from: ${participantNeighbors
      .getIn([REFERRAL_REQUEST, 0, SOURCE, 0], EMPTY_FIELD)}`;
    let enrollmentEvents :List = participantNeighbors.get(ENROLLMENT_STATUS, List());
    enrollmentEvents = sortEntitiesByDateProperty(enrollmentEvents, [EFFECTIVE_DATE]).reverse();
    const releaseDate :string = getMostRecentReleaseDate(participantNeighbors.get(MANUAL_JAIL_STAYS, List()));
    const releaseText :string = `Released: ${releaseDate}`;
    return (
      <>
        <HeaderWrapper>
          <CardInnerWrapper>
            <Breadcrumbs>
              <Header to={Routes.PARTICIPANTS}>PARTICIPANTS</Header>
              <NameHeader
                  to={Routes.PARTICIPANT_PROFILE.replace(':participantId', personEKID)}>
                { participantName }
              </NameHeader>
            </Breadcrumbs>
          </CardInnerWrapper>
          <ButtonsWrapper>
            <GrayerButton onClick={this.goToTaskManager}>Manage Tasks</GrayerButton>
            <Button mode="primary" onClick={this.openEventModal}>Record Event</Button>
          </ButtonsWrapper>
        </HeaderWrapper>
        <ProfileCardStack>
          <Card>
            <CardHeader padding="30px">
              <CardHeaderTitle>Person Profile</CardHeaderTitle>
            </CardHeader>
            <CardSegment padding="30px">
              <CardInnerWrapper>
                <PictureWrapper>
                  <FontAwesomeIcon color={NEUTRALS[3]} icon={faUser} size="8x" />
                </PictureWrapper>
                <DataGrid
                    data={participantData}
                    emptyString={EMPTY_FIELD}
                    labelMap={participantGridLabels}
                    truncate />
              </CardInnerWrapper>
            </CardSegment>
          </Card>
          <NeedsCard participantNeighbors={participantNeighbors} />
          <EventsCard>
            <CardHeader padding="30px">
              <SmallCardHeaderTitle>Program History</SmallCardHeaderTitle>
            </CardHeader>
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
          </EventsCard>
        </ProfileCardStack>
        <RecordEventModal
            isVisible={eventModalIsOpen}
            onClose={this.closeEventModal}
            personEKID={personEKID} />
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const profile = state.get(PROFILE.PROFILE);
  return {
    [CONTACT_NAME_BY_PROVIDER_EKID]: profile.get(CONTACT_NAME_BY_PROVIDER_EKID),
    [PARTICIPANT]: profile.get(PARTICIPANT),
    [PARTICIPANT_NEIGHBORS]: profile.get(PARTICIPANT_NEIGHBORS),
    [PROVIDER_BY_STATUS_EKID]: profile.get(PROVIDER_BY_STATUS_EKID),
    requestStates: {
      [LOAD_PROFILE]: profile.getIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute,
    loadProfile,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
