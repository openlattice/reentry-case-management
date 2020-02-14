// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
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

import COLORS from '../../core/style/Colors';
import { getFormattedParticipantData } from './utils/ProfileUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { LOAD_PROFILE, loadProfile } from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS, PURPLES } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;
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

const CardInnerWrapper = styled.div`
  display: flex;
`;

const HeaderWrapper = styled(CardInnerWrapper)`
  margin-bottom: 21px;
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

const PictureWrapper = styled.div`
  margin-right: 45px;
`;

const StyledGrid = styled(DataGrid)`
  flex-grow: 1;
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
    return (
      <>
        <HeaderWrapper>
          <Header>PARTICIPANTS</Header>
          <Carrot>{carrot}</Carrot>
          <NameHeader>{ participantName }</NameHeader>
        </HeaderWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="30px">
              <CardHeaderTitle>Person Profile</CardHeaderTitle>
            </CardHeader>
            <CardSegment padding="30px">
              <CardInnerWrapper>
                <PictureWrapper>
                  <FontAwesomeIcon color={NEUTRALS[3]} icon={faUser} size="8x" />
                </PictureWrapper>
                <StyledGrid
                    data={participantData}
                    labelMap={participantGridLabels} />
              </CardInnerWrapper>
            </CardSegment>
          </Card>
        </CardStack>
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
