// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Colors, Select } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddNewFollowUpModal from '../profile/tasks/AddNewFollowUpModal';
import TasksTable from '../../components/tasks/TasksTable';
import { GrayerButton } from '../profile/styled/GeneralProfileStyles';
import { GET_FOLLOW_UP_NEIGHBORS, SEARCH_FOR_TASKS, searchForTasks } from './TasksActions';
import { addLinkedPersonField, formatTasksForTable } from './utils/TaskManagerUtils';
import { schema, uiSchema } from '../profile/tasks/schemas/AddNewFollowUpSchemas';
import {
  reduceRequestStates,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess,
} from '../../utils/RequestStateUtils';
import { SHARED, TASK_MANAGER } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS } = Colors;
const { FOLLOW_UPS, FOLLOW_UP_NEIGHBOR_MAP } = TASK_MANAGER;
const { ACTIONS, REQUEST_STATE } = SHARED;

const PageHeader = styled.div`
  color: ${NEUTRALS[0]};
  font-size: 28px;
  font-weight: 600;
`;

const Row = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 25px 0;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 120px;
  grid-gap: 0 10px;
`;

const SelectWrapper = styled.div`
  width: 186px;
`;

type Props = {
  actions :{
    searchForTasks :RequestSequence;
  };
  followUps :List;
  followUpNeighborMap :Map;
  requestStates :{
    GET_FOLLOW_UP_NEIGHBORS :RequestState;
    SEARCH_FOR_TASKS :RequestState;
  };
};

const TaskManager = ({
  actions,
  followUps,
  followUpNeighborMap,
  requestStates,
} :Props) => {

  const [newFollowUpModalVisible, setModalVisibility] = useState(false);
  const [completed, setCompleted] = useState(false);

  const reducedReqState = reduceRequestStates([
    requestStates[GET_FOLLOW_UP_NEIGHBORS],
    requestStates[SEARCH_FOR_TASKS]
  ]);
  const isSearching :boolean = reducedReqState ? requestIsPending(reducedReqState) : false;
  const hasSearched :boolean = reducedReqState
    ? (requestIsSuccess(reducedReqState) || requestIsFailure(reducedReqState))
    : false;

  useEffect(() => {
    actions.searchForTasks({ completed: false });
  }, [actions]);
  const tasksData :Object[] = formatTasksForTable(followUps, followUpNeighborMap);
  const { taskSchema, taskUiSchema } = addLinkedPersonField(schema, uiSchema);

  const buttonText :string = completed ? 'See Incomplete Tasks' : 'See Completed Tasks';
  const getFreshTasks = () => {
    setCompleted(!completed);
    actions.searchForTasks({ completed: !completed });
  };
  return (
    <>
      <PageHeader>Task Manager</PageHeader>
      <Row>
        <SelectWrapper>
          <Select />
        </SelectWrapper>
        <ButtonsWrapper>
          <GrayerButton onClick={getFreshTasks}>
            { buttonText }
          </GrayerButton>
          <Button mode="primary" onClick={() => setModalVisibility(true)}>New Task</Button>
        </ButtonsWrapper>
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
  return {
    [FOLLOW_UPS]: taskManager.get(FOLLOW_UPS),
    [FOLLOW_UP_NEIGHBOR_MAP]: taskManager.get(FOLLOW_UP_NEIGHBOR_MAP),
    requestStates: {
      [GET_FOLLOW_UP_NEIGHBORS]: taskManager.getIn([ACTIONS, GET_FOLLOW_UP_NEIGHBORS, REQUEST_STATE]),
      [SEARCH_FOR_TASKS]: taskManager.getIn([ACTIONS, SEARCH_FOR_TASKS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    searchForTasks,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TaskManager);
