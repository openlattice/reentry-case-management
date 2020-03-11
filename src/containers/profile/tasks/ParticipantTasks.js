// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Breadcrumbs,
  Button,
  Card,
  CardSegment,
  Colors,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import * as Routes from '../../../core/router/Routes';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';
import { formatTableData } from './utils/ParticipantTasksUtils';
import { goToRoute } from '../../../core/router/RoutingActions';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { LOAD_TASKS, loadTasks } from './TasksActions';
import { PARTICIPANT_TASKS, PROFILE, SHARED } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import type { GoToRoute } from '../../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { FOLLOW_UPS } = APP_TYPE_FQNS;

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 36px 0 24px;
`;

const PageHeader = styled.div`
  color: ${NEUTRALS[0]};
  font-size: 28px;
  font-weight: 600;
`;

type Props = {
  actions :{
    goToRoute :GoToRoute;
    loadTasks :RequestSequence;
  };
  match :Match;
  participant :Map;
  participantNeighbors :Map;
  requestStates :{
    LOAD_TASKS :RequestState;
  };
};

class ParticipantTasks extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      match: {
        params: { participantId }
      }
    } = this.props;
    if (participantId) actions.loadTasks({ participantEKID: participantId });
  }

  goToProfile = () => {
    const {
      actions,
      match: {
        params: { participantId }
      }
    } = this.props;
    if (participantId) actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', participantId));
  }

  render() {
    const {
      match: {
        params: { participantId }
      },
      participant,
      participantNeighbors,
      requestStates,
    } = this.props;

    if (requestIsPending(requestStates[LOAD_TASKS])) {
      return (
        <Spinner size="2x" />
      );
    }

    const participantName :string = getPersonFullName(participant);
    const header :string = `${participantName}'s Tasks`;
    const tasks :List = participantNeighbors.get(FOLLOW_UPS, List());
    const tasksTableData :Object[] = formatTableData(tasks, participantName);
    return (
      <>
        <Breadcrumbs>
          <Header to={Routes.PARTICIPANTS}>PARTICIPANTS</Header>
          <NameHeader to={Routes.PARTICIPANT_PROFILE.replace(':participantId', participantId || '')}>
            { participantName }
          </NameHeader>
          <NameHeader to={Routes.PARTICIPANT_TASK_MANAGER.replace(':participantId', participantId || '')}>
            Manage Tasks
          </NameHeader>
        </Breadcrumbs>
        <HeaderRow>
          <PageHeader>{ header }</PageHeader>
          <Button mode="primary">New Task</Button>
        </HeaderRow>
        <Card>
          <CardSegment padding="0">
            <Table
                data={tasksTableData}
                headers={[]} />
          </CardSegment>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const participantTasks = state.get(PARTICIPANT_TASKS.PARTICIPANT_TASKS);
  const profile = state.get(PROFILE.PROFILE);
  return {
    [PARTICIPANT]: profile.get(PARTICIPANT),
    [PARTICIPANT_NEIGHBORS]: profile.get(PARTICIPANT_NEIGHBORS),
    requestStates: {
      [LOAD_TASKS]: participantTasks.getIn([ACTIONS, LOAD_TASKS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute,
    loadTasks,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantTasks);
