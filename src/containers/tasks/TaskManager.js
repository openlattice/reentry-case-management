// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faBell } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  CheckboxSelect,
  Grid,
  Label,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import SubscriptionsModal from './SubscriptionsModal';
import {
  GET_PEOPLE_FOR_NEW_TASK_FORM,
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  clearParticipants,
  getSubscriptions,
  loadTaskManagerData,
  searchForTasks,
} from './TasksActions';
import { schema, uiSchema } from './schemas/AddNewFollowUpSchemas';
import {
  formatTasksForTable,
  getReentryStaffOptions,
  getTaskOptionsForSearch,
} from './utils/TaskManagerUtils';

import AddNewFollowUpModal from '../profile/tasks/AddNewFollowUpModal';
import TasksTable from '../../components/tasks/TasksTable';
import {
  reduceRequestStates,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess,
} from '../../utils/RequestStateUtils';
import {
  APP,
  PARTICIPANT_FOLLOW_UPS,
  SHARED,
  TASK_MANAGER,
} from '../../utils/constants/ReduxStateConstants';
import { GET_FOLLOW_UP_NEIGHBORS } from '../profile/tasks/FollowUpsActions';
import { FOLLOW_UPS_STATUSES } from '../profile/tasks/FollowUpsConstants';

const { STAFF_MEMBERS } = APP;
const { FOLLOW_UPS, PARTICIPANTS } = TASK_MANAGER;
const { FOLLOW_UP_NEIGHBOR_MAP } = PARTICIPANT_FOLLOW_UPS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const { DONE, LATE, PENDING } = FOLLOW_UPS_STATUSES;
const FOLLOW_UP_STATUS_OPTIONS :Object[] = [
  { label: DONE, value: DONE },
  { label: LATE, value: LATE },
  { label: PENDING, value: PENDING },
];

const NotificationsIcon = <FontAwesomeIcon icon={faBell} />;

const PageHeader = styled.div`
  font-size: 28px;
  font-weight: 600;
`;

const Row = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: 25px 0;

  span {
    display: flex;
  }
`;

const SelectWrapper = styled.div`
  margin-right: 10px;
  max-width: 300px;
  min-width: 186px;
`;

type Props = {
  actions :{
    clearParticipants :() => void;
    getSubscriptions :RequestSequence;
    loadTaskManagerData :RequestSequence;
    searchForTasks :RequestSequence;
  };
  followUps :List;
  followUpNeighborMap :Map;
  participants :Object[];
  staffMembers :List;
  requestStates :{
    GET_PEOPLE_FOR_NEW_TASK_FORM :RequestState;
    GET_FOLLOW_UP_NEIGHBORS :RequestState;
    LOAD_TASK_MANAGER_DATA :RequestState;
    SEARCH_FOR_TASKS :RequestState;
  };
};

const TaskManager = ({
  actions,
  followUps,
  followUpNeighborMap,
  participants,
  staffMembers,
  requestStates,
} :Props) => {

  const [newFollowUpModalVisible, openNewFollowUpModal] = useState(false);
  const [subscriptionsModalVisible, openSubscriptionsModal] = useState(false);
  const [selectedTaskStatuses, selectTaskStatus] = useState([]);
  const [selectedAssignees, selectAssignee] = useState([]);
  const [selectedReporters, selectReporter] = useState([]);

  useEffect(() => {
    actions.loadTaskManagerData();
    actions.getSubscriptions();
    return () => {
      actions.clearParticipants();
    };
  }, [actions]);

  const tasksData :Object[] = formatTasksForTable(followUps, followUpNeighborMap, selectedAssignees, selectedReporters);
  const reentryStaffOptions :Object[] = getReentryStaffOptions(staffMembers);

  const reducedReqState = reduceRequestStates([
    requestStates[GET_PEOPLE_FOR_NEW_TASK_FORM],
    requestStates[GET_FOLLOW_UP_NEIGHBORS],
    requestStates[LOAD_TASK_MANAGER_DATA],
    requestStates[SEARCH_FOR_TASKS],
  ]);
  const isSearching :boolean = reducedReqState ? requestIsPending(reducedReqState) : false;
  const hasSearched :boolean = reducedReqState
    ? (requestIsSuccess(reducedReqState) || requestIsFailure(reducedReqState))
    : false;

  const getFreshTasks = (option :Object) => {
    selectTaskStatus(option);
    actions.searchForTasks({ statuses: getTaskOptionsForSearch(selectedTaskStatuses, option) });
  };
  return (
    <>
      <PageHeader>Task Manager</PageHeader>
      <Row>
        <span>
          <SelectWrapper>
            <Label>Task status:</Label>
            <CheckboxSelect
                onChange={getFreshTasks}
                options={FOLLOW_UP_STATUS_OPTIONS} />
          </SelectWrapper>
          <SelectWrapper>
            <Label>Assigned to:</Label>
            <CheckboxSelect
                onChange={selectAssignee}
                options={reentryStaffOptions} />
          </SelectWrapper>
          <SelectWrapper>
            <Label>Reported by:</Label>
            <CheckboxSelect
                onChange={selectReporter}
                options={reentryStaffOptions} />
          </SelectWrapper>
        </span>
        <Grid spacing={1}>
          <Button onClick={() => openSubscriptionsModal(true)} startIcon={NotificationsIcon}>Subscribe</Button>
          <Button color="primary" onClick={() => openNewFollowUpModal(true)}>New Task</Button>
        </Grid>
      </Row>
      <TasksTable hasSearched={hasSearched} isLoading={isSearching} tasksData={tasksData} />
      <AddNewFollowUpModal
          isVisible={newFollowUpModalVisible}
          onClose={() => openNewFollowUpModal(false)}
          participants={participants}
          schema={schema}
          uiSchema={uiSchema} />
      <SubscriptionsModal
          isVisible={subscriptionsModalVisible}
          onClose={() => openSubscriptionsModal(false)} />
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const app = state.get(APP.APP);
  const taskManager = state.get(TASK_MANAGER.TASK_MANAGER);
  const participantFollowUps = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  return {
    [FOLLOW_UPS]: taskManager.get(FOLLOW_UPS),
    [FOLLOW_UP_NEIGHBOR_MAP]: participantFollowUps.get(FOLLOW_UP_NEIGHBOR_MAP),
    [PARTICIPANTS]: taskManager.get(PARTICIPANTS),
    [STAFF_MEMBERS]: app.get(STAFF_MEMBERS),
    requestStates: {
      [GET_PEOPLE_FOR_NEW_TASK_FORM]: taskManager.getIn([ACTIONS, GET_PEOPLE_FOR_NEW_TASK_FORM, REQUEST_STATE]),
      [GET_FOLLOW_UP_NEIGHBORS]: participantFollowUps.getIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE]),
      [LOAD_TASK_MANAGER_DATA]: taskManager.getIn([ACTIONS, LOAD_TASK_MANAGER_DATA, REQUEST_STATE]),
      [SEARCH_FOR_TASKS]: taskManager.getIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearParticipants,
    getSubscriptions,
    loadTaskManagerData,
    searchForTasks,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TaskManager);
