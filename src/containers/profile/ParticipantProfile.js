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
import { GET_PARTICIPANT, getParticipant } from './ProfileActions';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS, PURPLES } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PARTICIPANT } = PROFILE;
const carrot = '>';
const participantGridLabels = Map({
  lastName: 'Last name',
  middleName: 'Middle name',
  firstName: 'First name',
  phoneNumber: 'Phone number',
  dob: 'Date of birth',
  age: 'Age',
  gender: 'Gender',
  race: 'Race',
});

const CardInnerWrapper = styled.div`
  display: flex;
`;

const HeaderWrapper = styled(CardInnerWrapper)`
  margin-bottom: 21px;
`;

const Header = styled.div`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${PURPLES[1]};
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

type Props = {
  actions :{
    getParticipant :RequestSequence;
  };
  match :Match;
  participant :Map;
  requestStates :{
    GET_PARTICIPANT :RequestState;
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
    if (participantId) actions.getParticipant({ participantEKID: participantId });
  }

  render() {
    const { participant, requestStates } = this.props;

    if (requestIsPending(requestStates[GET_PARTICIPANT])) {
      return (
        <Spinner size="2x" />
      );
    }

    const participantName :string = getPersonFullName(participant);
    const participantData :Map = getFormattedParticipantData(participant);
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
        </CardStack>
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const profile = state.get(PROFILE.PROFILE);
  return {
    [PARTICIPANT]: profile.get(PARTICIPANT),
    requestStates: {
      [GET_PARTICIPANT]: profile.getIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getParticipant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
