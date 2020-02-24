// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  DataGrid,
  Spinner,
} from 'lattice-ui-kit';
// $FlowFixMe
import { faUser } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import RecordEventModal from './events/RecordEventModal';
import Event from './events/Event';
import COLORS from '../../core/style/Colors';
import {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
} from './styled/EventStyles';
import { getFormattedParticipantData, getMostRecentReleaseDate, getReentryEnrollmentDate } from './utils/ProfileUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { getEKID } from '../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../utils/Utils';
import { LOAD_PROFILE, loadProfile } from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS, PURPLES } = Colors;
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
  NEEDS_ASSESSMENT,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  NOTES,
  SOURCE,
  TYPE
} = PROPERTY_TYPE_FQNS;
const carrot = '>';
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
  grid-template-columns: 153px;
  grid-gap: 0 20px;
`;

const Header = styled.div`
  color: ${PURPLES[1]};
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  text-transform: uppercase;
`;

const NameHeader = styled(Header)`
  color: ${NEUTRALS[1]};
  font-weight: 500;
`;

const Carrot = styled(NameHeader)`
  margin: 0 10px;
`;

const CardHeaderTitle = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
`;

const SmallCardHeaderTitle = styled(CardHeaderTitle)`
  color: ${NEUTRALS[0]};
  font-size: 20px;
`;

const PictureWrapper = styled.div`
  margin-right: 45px;
`;

const NeedsTag = styled.div`
  background-color: ${NEUTRALS[6]};
  border-radius: 3px;
  color: ${NEUTRALS[1]};
  font-size: 14px;
  line-height: 19px;
  margin-right: 20px;
  padding: 12px 20px;
  text-align: center;
`;

const Notes = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  line-height: 19px;
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
  line-height: 19px;
`;

type Props = {
  actions :{
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
    const needs :string[] = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, TYPE], []);
    const notes :string = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, NOTES, 0], '');
    const enrollmentDate :string = getReentryEnrollmentDate(participantNeighbors);
    const referralSource :string = `Referred from: ${participantNeighbors
      .getIn([REFERRAL_REQUEST, 0, SOURCE, 0], '----')}`;
    let enrollmentEvents :List = participantNeighbors.get(ENROLLMENT_STATUS, List());
    enrollmentEvents = sortEntitiesByDateProperty(enrollmentEvents, [EFFECTIVE_DATE]).reverse();
    const releaseDate :string = getMostRecentReleaseDate(participantNeighbors.get(MANUAL_JAIL_STAYS, List()));
    const releaseText :string = `Released: ${releaseDate}`;
    return (
      <>
        <HeaderWrapper>
          <CardInnerWrapper>
            <Header>PARTICIPANTS</Header>
            <Carrot>{carrot}</Carrot>
            <NameHeader>{ participantName }</NameHeader>
          </CardInnerWrapper>
          <ButtonsWrapper>
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
                    emptyString="----"
                    labelMap={participantGridLabels}
                    truncate />
              </CardInnerWrapper>
            </CardSegment>
          </Card>
          <Card>
            <CardHeader padding="30px">
              <SmallCardHeaderTitle>Needs</SmallCardHeaderTitle>
            </CardHeader>
            {
              needs && (
                <CardSegment padding="30px">
                  { needs.map((need :string) => <NeedsTag key={need}>{ need }</NeedsTag>) }
                </CardSegment>
              )
            }
            {
              notes && (
                <CardSegment padding="30px">
                  <Notes>{ notes }</Notes>
                </CardSegment>
              )
            }
          </Card>
          <EventsCard>
            <CardHeader padding="30px">
              <SmallCardHeaderTitle>Program History</SmallCardHeaderTitle>
            </CardHeader>
            <GrayBar padding="15px 30px">
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
            isOpen={eventModalIsOpen}
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
    loadProfile,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
