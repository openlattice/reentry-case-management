// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Colors,
  Label,
  CheckboxSelect,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddNewFollowUpModal from '../profile/tasks/AddNewFollowUpModal';
import TasksTable from '../../components/tasks/TasksTable';
import {
  GET_FOLLOW_UP_NEIGHBORS,
  LOAD_TASK_MANAGER_DATA,
  SEARCH_FOR_TASKS,
  loadTaskManagerData,
  searchForTasks,
} from './TasksActions';
import { addLinkedPersonField, formatTasksForTable, getReentryStaffOptions, getTaskOptionsForSearch } from './utils/TaskManagerUtils';
import { schema, uiSchema } from '../profile/tasks/schemas/AddNewFollowUpSchemas';
import {
  reduceRequestStates,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess,
} from '../../utils/RequestStateUtils';
import { isDefined } from '../../utils/LangUtils';
import { PARTICIPANT_FOLLOW_UPS, SHARED, TASK_MANAGER } from '../../utils/constants/ReduxStateConstants';
import { FOLLOW_UPS_STATUSES } from '../profile/tasks/FollowUpsConstants';

const { NEUTRALS } = Colors;
const { FOLLOW_UPS, FOLLOW_UP_NEIGHBOR_MAP } = TASK_MANAGER;
const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const { DONE, LATE, PENDING } = FOLLOW_UPS_STATUSES;
const FOLLOW_UP_STATUS_OPTIONS :Object[] = [
  { label: DONE, value: DONE },
  { label: LATE, value: LATE },
  { label: PENDING, value: PENDING },
];

const PageHeader = styled.div`
  color: ${NEUTRALS[0]};
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
    loadTaskManagerData :RequestSequence;
    searchForTasks :RequestSequence;
  };
  followUps :List;
  followUpNeighborMap :Map;
  reentryStaffMembers :List;
  requestStates :{
    GET_FOLLOW_UP_NEIGHBORS :RequestState;
    LOAD_TASK_MANAGER_DATA :RequestState;
    SEARCH_FOR_TASKS :RequestState;
  };
};

const TaskManager = ({
  actions,
  followUps,
  followUpNeighborMap,
  reentryStaffMembers,
  requestStates,
} :Props) => {

  const [newFollowUpModalVisible, setModalVisibility] = useState(false);
  const [selectedTaskStatuses, selectTaskStatus] = useState([]);
  const [selectedAssignees, selectAssignee] = useState([]);
  const [selectedReporters, selectReporter] = useState([]);

  useEffect(() => {
    actions.loadTaskManagerData();
  }, [actions]);

  const { taskSchema, taskUiSchema } = addLinkedPersonField(schema, uiSchema);
  const tasksData :Object[] = formatTasksForTable(followUps, followUpNeighborMap, selectedAssignees, selectedReporters);
  const reentryStaffOptions :Object[] = getReentryStaffOptions(reentryStaffMembers);

  const reducedReqState = reduceRequestStates([
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
        <Button mode="primary" onClick={() => setModalVisibility(true)}>New Task</Button>
      </Row>
      <TasksTable hasSearched={hasSearched} isLoading={isSearching} tasksData={tasksData} />
      <AddNewFollowUpModal
          isVisible={newFollowUpModalVisible}
          onClose={() => setModalVisibility(false)}
          schema={taskSchema}
          uiSchema={taskUiSchema} />
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const taskManager = state.get(TASK_MANAGER.TASK_MANAGER);
  const participantFollowUps = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  return {
    [FOLLOW_UPS]: taskManager.get(FOLLOW_UPS),
    [FOLLOW_UP_NEIGHBOR_MAP]: taskManager.get(FOLLOW_UP_NEIGHBOR_MAP),
    [REENTRY_STAFF_MEMBERS]: participantFollowUps.get(REENTRY_STAFF_MEMBERS),
    requestStates: {
      [GET_FOLLOW_UP_NEIGHBORS]: taskManager.getIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE]),
      [LOAD_TASK_MANAGER_DATA]: taskManager.getIn([ACTIONS, LOAD_TASK_MANAGER_DATA, REQUEST_STATE]),
      [SEARCH_FOR_TASKS]: taskManager.getIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadTaskManagerData,
    searchForTasks,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TaskManager);
