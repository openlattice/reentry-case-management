// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Colors, Select } from 'lattice-ui-kit';

// import AddNewFollowUpModal from './AddNewFollowUpModal';
import AddNewFollowUpModal from '../profile/tasks/AddNewFollowUpModal';
import TasksTable from '../../components/tasks/TasksTable';
import { addLinkedPersonField } from './utils/TaskManagerUtils';
import { schema, uiSchema } from '../profile/tasks/schemas/AddNewFollowUpSchemas';

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
  const { taskSchema, taskUiSchema } = addLinkedPersonField(schema, uiSchema);
  return (
    <>
      <PageHeader>Task Manager</PageHeader>
      <Row>
        <SelectWrapper>
          <Select />
        </SelectWrapper>
        <Button mode="primary" onClick={() => setModalVisibility(true)}>New Task</Button>
      </Row>
      <TasksTable tasksData={[]} />
      <AddNewFollowUpModal
          isVisible={newFollowUpModalVisible}
          onClose={() => setModalVisibility(false)}
          schema={taskSchema}
          uiSchema={taskUiSchema} />
    </>
  );
};

export default TaskManager;
