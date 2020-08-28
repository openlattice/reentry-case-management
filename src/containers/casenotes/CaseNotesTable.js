// @flow
import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { StyleUtils, Table } from 'lattice-ui-kit';

import { formatNotesTableData } from './utils/CaseNotesTableUtils';

import CaseNotesTableRow from '../../components/casenotes/CaseNotesTableRow';
import TableHeaderRow from '../../components/tasks/TableHeaderRow';

const { getStyleVariation } = StyleUtils;

const tableHeaders :Object[] = ['date', 'staff']
  .map((header :string) => ({ key: header, label: '', sortable: false }));

const getWidthVariation = getStyleVariation('width', {
  default: 'auto',
  date: '50%',
  staff: '50%',
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
  meetings :List;
  staffByMeetingEKID :Map;
}

const CaseNotesTable = ({ meetings, staffByMeetingEKID } :Props) => {
  const notesTableData = formatNotesTableData(meetings, staffByMeetingEKID);
  return (
    <Table
        components={{ HeadCell, Header: TableHeaderRow, Row: CaseNotesTableRow }}
        data={notesTableData}
        headers={tableHeaders} />
  );
};

export default CaseNotesTable;
