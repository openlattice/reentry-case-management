// @flow
import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
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

import Grid from '../../components/grid/Grid';
import COLORS from '../../core/style/Colors';
import { getFormattedParticipantData, getMostRecentReleaseDate } from './utils/ProfileUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { LOAD_PROFILE, loadProfile } from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS, PURPLES } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;
const { ENROLLMENT_STATUS, MANUAL_JAIL_STAYS, NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  DATETIME_COMPLETED,
  NOTES,
  STATUS,
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

const CardInnerWrapper = styled.div`
  display: flex;
  width: 100%;
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

const EventCardSegment = styled(CardSegment)`
  border-bottom: 1px solid ${NEUTRALS[4]};
`;

const eventTextStyles = css`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  font-weight: 600;
  line-height: 19px;
`;

const EventDateWrapper = styled.div`
  margin-right: 61px;
`;

const EventWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${eventTextStyles}
`;

const EventText = styled.div`
  ${eventTextStyles}
  font-weight: normal;
  margin-top: 10px;
`;

const EventStatusText = styled.div`
  ${eventTextStyles}
  text-transform: uppercase;
`;

type Props = {
  actions :{
    loadProfile :RequestSequence;
  };
  match :Match;
  participant :Map;
  participantNeighbors :Map;
  requestStates :{
    LOAD_PROFILE :RequestState;
  };
};

class ParticipantProfile extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      match: {
        params: { participantId }
      }
    } = this.props;
    if (participantId) actions.loadProfile({ participantEKID: participantId });
  }

  render() {
    const { participant, participantNeighbors, requestStates } = this.props;

    if (requestIsPending(requestStates[LOAD_PROFILE])) {
      return (
        <Spinner size="2x" />
      );
    }

    const participantName :string = getPersonFullName(participant);
    const participantData :Map = getFormattedParticipantData(participant, participantNeighbors);
    const needs :string[] = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, TYPE], []);
    const notes :string = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, NOTES, 0], '');
    const enrollmentDateTime :string = participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, DATETIME_COMPLETED, 0], '');
    const enrollmentDate :string = DateTime.fromISO(enrollmentDateTime).toLocaleString(DateTime.DATE_SHORT);
    const enrollmentEvents :List = participantNeighbors.get(ENROLLMENT_STATUS, List());
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
            <Button mode="primary">Record Event</Button>
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
            <CardSegment padding="30px">
              { needs.map((need :string) => <NeedsTag key={need}>{ need }</NeedsTag>) }
            </CardSegment>
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
              <div>Released from: Jail</div>
              { releaseDate && (<div>{ releaseText }</div>) }
            </GrayBar>
            {
              !enrollmentEvents.isEmpty() && (
                enrollmentEvents.map((enrollmentStatus :Map) => {
                  // $FlowFixMe
                  const { [EFFECTIVE_DATE]: datetime, [STATUS]: status } = getEntityProperties(
                    enrollmentStatus,
                    [EFFECTIVE_DATE, STATUS]
                  );
                  const date :string = DateTime.fromISO(datetime).toLocaleString(DateTime.DATE_SHORT);
                  return (
                    <EventCardSegment padding="25px 30px">
                      <CardInnerWrapper>
                        <EventDateWrapper>{ date }</EventDateWrapper>
                        <EventWrapper>
                          <EventStatusText>{ status }</EventStatusText>
                          <EventText>Related Organization</EventText>
                          <EventText>Point of Contact</EventText>
                        </EventWrapper>
                      </CardInnerWrapper>
                    </EventCardSegment>
                  );
                })
              )
            }
            <CardSegment padding="25px 30px">
              <CardInnerWrapper>
                <EventDateWrapper>{ enrollmentDate }</EventDateWrapper>
                <EventWrapper>
                  <EventStatusText>ENROLLED</EventStatusText>
                  <EventText>Re-entry Program</EventText>
                  <EventText>Forms Completed: 2/2</EventText>
                </EventWrapper>
              </CardInnerWrapper>
            </CardSegment>
          </EventsCard>
        </ProfileCardStack>
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const profile = state.get(PROFILE.PROFILE);
  return {
    [PARTICIPANT]: profile.get(PARTICIPANT),
    [PARTICIPANT_NEIGHBORS]: profile.get(PARTICIPANT_NEIGHBORS),
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
