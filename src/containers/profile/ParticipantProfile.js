// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { faUser } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, OrderedMap } from 'immutable';
import {
  Breadcrumbs,
  Button,
  Card,
  CardSegment,
  CardStack,
  Colors,
  DataGrid,
  Spinner,
} from 'lattice-ui-kit';
import { RoutingUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ContactInfoCard from './contacts/ContactInfoCard';
import CourtDatesCard from './court/CourtDatesCard';
import DeleteProfileModal from './DeleteProfileModal';
import NeedsCard from './needs/NeedsCard';
import ProgramHistory from './programhistory/ProgramHistory';
import RecordEventModal from './events/RecordEventModal';
import SexOffenderCard from './sexoffender/SexOffenderCard';
import SupervisionCard from './supervision/SupervisionCard';
import { LOAD_PROFILE, clearDeleteRequestState, loadProfile } from './ProfileActions';
import { CardInnerWrapper } from './styled/EventStyles';
import {
  CardHeaderTitle,
  CardHeaderWithButtons,
  GrayerButton,
  Header,
  NameHeader,
} from './styled/GeneralProfileStyles';
import { getFormattedParticipantData } from './utils/ProfileUtils';

import CaseNotesProfileCard from '../casenotes/CaseNotesProfileCard';
import EditButton from '../../components/buttons/EditButton';
import * as Routes from '../../core/router/Routes';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEKID } from '../../utils/DataUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { EMPTY_FIELD } from '../../utils/constants/GeneralConstants';
import {
  CASE_NOTES,
  INTAKE,
  PROFILE,
  SHARED
} from '../../utils/constants/ReduxStateConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { getParamFromMatch } = RoutingUtils;
const { NEUTRAL } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { INCARCERATION_FACILITIES } = INTAKE;
const {
  CONTACT_NAME_BY_PROVIDER_EKID,
  EMERGENCY_CONTACT_INFO_BY_CONTACT,
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PROVIDER_BY_STATUS_EKID,
  SUPERVISION_NEIGHBORS,
} = PROFILE;
const { STAFF_BY_MEETING_EKID } = CASE_NOTES;
const { PROBATION_PAROLE } = APP_TYPE_FQNS;

const participantGridLabels = OrderedMap({
  lastName: 'Last name',
  firstName: 'First name',
  middleName: 'Middle name',
  dob: 'Date of birth',
  age: 'Age',
  gender: 'Gender',
  race: 'Race',
  ethnicity: 'Ethnicity',
  countyID: 'County ID number',
  opusNumber: 'OPUS number',
  maritalStatus: 'Marital status',
  education: 'Education',
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

const CenteredCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

type Props = {
  actions :{
    clearDeleteRequestState :() => { type :string };
    goToRoute :GoToRoute;
    loadProfile :RequestSequence;
  };
  contactNameByProviderEKID :Map;
  emergencyContactInfoByContact :Map;
  match :Match;
  participant :Map;
  participantNeighbors :Map;
  providerByStatusEKID :Map;
  requestStates :{
    LOAD_PROFILE :RequestState;
  };
  supervisionNeighbors :Map;
  staffByMeetingEKID :Map;
};

type State = {
  deleteModalIsOpen :boolean;
  eventModalIsOpen :boolean;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      deleteModalIsOpen: false,
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

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearDeleteRequestState();
  }

  openEventModal = () => {
    this.setState({ eventModalIsOpen: true });
  }

  closeEventModal = () => {
    this.setState({ eventModalIsOpen: false });
  }

  openDeleteModal = () => {
    this.setState({ deleteModalIsOpen: true });
  }

  closeDeleteModal = () => {
    this.setState({ deleteModalIsOpen: false });
  }

  goToEditPersonPage = () => {
    const { actions, match } = this.props;
    const participantId = getParamFromMatch(match, Routes.PARTICIPANT_ID);
    if (participantId) actions.goToRoute(Routes.EDIT_PARTICIPANT.replace(Routes.PARTICIPANT_ID, participantId));
  };

  goToTaskManager = () => {
    const { actions, match } = this.props;
    const participantId = getParamFromMatch(match, Routes.PARTICIPANT_ID);
    if (participantId) actions.goToRoute(Routes.PARTICIPANT_TASK_MANAGER.replace(Routes.PARTICIPANT_ID, participantId));
  }

  render() {
    const {
      contactNameByProviderEKID,
      emergencyContactInfoByContact,
      match,
      participant,
      participantNeighbors,
      providerByStatusEKID,
      requestStates,
      supervisionNeighbors,
      staffByMeetingEKID,
    } = this.props;
    const { deleteModalIsOpen, eventModalIsOpen } = this.state;

    if (requestIsPending(requestStates[LOAD_PROFILE])) {
      return (
        <Spinner size="2x" />
      );
    }

    const personEKID :UUID = getEKID(participant);
    const participantName :string = getPersonFullName(participant);
    const participantData :Map = getFormattedParticipantData(participant, participantNeighbors);
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
            <Button color="primary" onClick={this.openEventModal}>Record Event</Button>
          </ButtonsWrapper>
        </HeaderWrapper>
        <ProfileCardStack>
          <Card>
            <CardHeaderWithButtons padding="30px" vertical={false}>
              <CardHeaderTitle>Person Profile</CardHeaderTitle>
              <EditButton onClick={this.goToEditPersonPage}>Edit</EditButton>
            </CardHeaderWithButtons>
            <CardSegment padding="30px">
              <CardInnerWrapper>
                <PictureWrapper>
                  <FontAwesomeIcon color={NEUTRAL.N300} icon={faUser} size="8x" />
                </PictureWrapper>
                <DataGrid
                    data={participantData}
                    emptyString={EMPTY_FIELD}
                    labelMap={participantGridLabels}
                    truncate />
              </CardInnerWrapper>
            </CardSegment>
          </Card>
          <ContactInfoCard
              emergencyContactInfoByContact={emergencyContactInfoByContact}
              participantNeighbors={participantNeighbors}
              personEKID={personEKID} />
          <NeedsCard participantNeighbors={participantNeighbors} />
          <ProgramHistory
              contactNameByProviderEKID={contactNameByProviderEKID}
              match={match}
              participantNeighbors={participantNeighbors}
              providerByStatusEKID={providerByStatusEKID} />
          <CaseNotesProfileCard
              participantNeighbors={participantNeighbors}
              staffByMeetingEKID={staffByMeetingEKID} />
          <CourtDatesCard participantNeighbors={participantNeighbors} />
          <SexOffenderCard participantNeighbors={participantNeighbors} />
          { participantNeighbors.has(PROBATION_PAROLE) && (
            <SupervisionCard participantNeighbors={participantNeighbors} supervisionNeighbors={supervisionNeighbors} />
          )}
        </ProfileCardStack>
        <CenteredCardSegment vertical={false}>
          <Button
              color="error"
              onClick={this.openDeleteModal}
              variant="text">
            Delete Profile
          </Button>
        </CenteredCardSegment>
        <RecordEventModal
            isVisible={eventModalIsOpen}
            onClose={this.closeEventModal}
            personEKID={personEKID} />
        <DeleteProfileModal
            isVisible={deleteModalIsOpen}
            onClose={this.closeDeleteModal}
            personEKID={personEKID} />
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const profile = state.get(PROFILE.PROFILE);
  const intake = state.get(INTAKE.INTAKE);
  const caseNotes = state.get(CASE_NOTES.CASE_NOTES);
  return {
    [CONTACT_NAME_BY_PROVIDER_EKID]: profile.get(CONTACT_NAME_BY_PROVIDER_EKID),
    [EMERGENCY_CONTACT_INFO_BY_CONTACT]: profile.get(EMERGENCY_CONTACT_INFO_BY_CONTACT),
    [INCARCERATION_FACILITIES]: intake.get(INCARCERATION_FACILITIES),
    [PARTICIPANT]: profile.get(PARTICIPANT),
    [PARTICIPANT_NEIGHBORS]: profile.get(PARTICIPANT_NEIGHBORS),
    [PROVIDER_BY_STATUS_EKID]: profile.get(PROVIDER_BY_STATUS_EKID),
    requestStates: {
      [LOAD_PROFILE]: profile.getIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE]),
    },
    [SUPERVISION_NEIGHBORS]: profile.get(SUPERVISION_NEIGHBORS),
    [STAFF_BY_MEETING_EKID]: caseNotes.get(STAFF_BY_MEETING_EKID),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearDeleteRequestState,
    goToRoute,
    loadProfile,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
