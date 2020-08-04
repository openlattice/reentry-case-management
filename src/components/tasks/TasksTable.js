// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors,
  SearchInput,
  Spinner,
  StyleUtils,
  Table,
} from 'lattice-ui-kit';

import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';

import NoResults from '../noresults/NoResults';

const { getStyleVariation } = StyleUtils;
const { NEUTRAL } = Colors;
const tableHeaders :Object[] = ['taskName', 'taskDescription', 'dueDate', 'taskStatus']
  .map((header :string) => ({ key: header, label: '', sortable: false }));

const SpinnerWrapper = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

const TableCardHeader = styled(CardHeader)`
  background-color: ${NEUTRAL.N100};
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
  hasSearched ? :boolean;
  isLoading ? :boolean;
  tasksData :Object[];
};

const TasksTable = ({ hasSearched, isLoading, tasksData } :Props) => {
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
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter keywords here" />
        </InputWrapper>
      </TableCardHeader>
      <CardSegment padding="0">
        { isLoading && <SpinnerWrapper><Spinner size="2x" /></SpinnerWrapper> }
        { (hasSearched && !filteredData.length) && (
          <NoResults text="No Tasks Found" />
        )}
        {
          (filteredData.length > 0 && hasSearched) && (
            <Table
                components={{ HeadCell, Header: TableHeaderRow, Row: TableRow }}
                data={filteredData}
                headers={tableHeaders} />
          )
        }
      </CardSegment>
    </Card>
  );
};

TasksTable.defaultProps = {
  hasSearched: false,
  isLoading: false,
};

export default TasksTable;
