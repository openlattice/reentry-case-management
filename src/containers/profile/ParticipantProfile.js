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
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS, PURPLES } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;
const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = PROPERTY_TYPE_FQNS;
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
                <DataGrid
                    data={participantData}
                    labelMap={participantGridLabels} />
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
