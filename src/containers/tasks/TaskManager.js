// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Colors, Select } from 'lattice-ui-kit';

import AddNewFollowUpModal from './AddNewFollowUpModal';
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

const TaskManager = () => {
  const [newFollowUpModalVisible, setModalVisibility] = useState(false);
  return (
    <>
      <PageHeader>Task Manager</PageHeader>
      <Row>
        <SelectWrapper>
          <Select />
        </SelectWrapper>
        <GrayerButton onClick={() => setModalVisibility(true)}>New Task</GrayerButton>
      </Row>
      <TasksTable tasksData={[]} />
      <AddNewFollowUpModal
          isVisible={newFollowUpModalVisible}
          onClose={() => setModalVisibility(false)} />
    </>
  );
};

export default TaskManager;
