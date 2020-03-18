// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors,
  SearchInput,
  StyleUtils,
  Table,
} from 'lattice-ui-kit';

import NoResults from '../noresults/NoResults';
import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';

const { getStyleVariation } = StyleUtils;
const { NEUTRALS } = Colors;
const tableHeaders :Object[] = ['taskName', 'taskDescription', 'dueDate', 'taskStatus']
  .map((header :string) => ({ key: header, label: '', sortable: false }));

const TableCardHeader = styled(CardHeader)`
  background-color: ${NEUTRALS[6]};
  padding: 20px 30px;
`;

const InputWrapper = styled.div`
  width: 100%;
`;

const getWidthVariation = getStyleVariation('width', {
  default: 'auto',
  taskName: '240px',
  taskDescription: 'auto',
  dueDate: '200px',
  taskStatus: '100px'
});

const Cell = styled.td`
  width: ${getWidthVariation};
`;

type HeadCellProps = {
  width :string;
};

const HeadCell = ({ width } :HeadCellProps) => (
  <Cell width={width} />
);

type Props = {
  tasksData :Object[];
};

const TasksTable = ({ tasksData } :Props) => {
  const [input, onInputChange] = useState('');
  const filterTableData = (tableData :Object[]) :Object[] => {
    if (!input.length) return tableData;
    const filteredTableData :Object[] = tableData.filter((row :Object) => {
      const { taskName, taskDescription } = row;
      const trimmedInput :string = input.trim().toLowerCase();
      return taskName.trim().toLowerCase().includes(trimmedInput)
        || taskDescription.trim().toLowerCase().includes(trimmedInput);
    });
    return filteredTableData;
  };
  const filteredData :Object[] = filterTableData(tasksData);
  return (
    <Card>
      <TableCardHeader>
        <InputWrapper>
          <SearchInput
              name="input"
              onChange={onInputChange}
              placeholder="Enter keywords here" />
        </InputWrapper>
      </TableCardHeader>
      <CardSegment padding="0">
        {
          filteredData.length
            ? (
              <Table
                  components={{ HeadCell, Header: TableHeaderRow, Row: TableRow }}
                  data={filteredData}
                  headers={tableHeaders} />
            )
            : (
              <NoResults text="No Tasks Found" />
            )
        }
      </CardSegment>
    </Card>
  );
};

export default TasksTable;
