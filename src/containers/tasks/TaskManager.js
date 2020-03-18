// @flow
import React from 'react';
import styled from 'styled-components';
import { Colors, Select } from 'lattice-ui-kit';

import TasksTable from '../../components/tasks/TasksTable';
import { GrayerButton } from '../profile/styled/GeneralProfileStyles';

const { NEUTRALS } = Colors;

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

const SelectWrapper = styled.div`
  width: 186px;
`;

const TaskManager = () => (
  <>
    <PageHeader>Task Manager</PageHeader>
    <Row>
      <SelectWrapper>
        <Select />
      </SelectWrapper>
      <GrayerButton>New Task</GrayerButton>
    </Row>
    <TasksTable tasksData={[]} />
  </>
);

export default TaskManager;
