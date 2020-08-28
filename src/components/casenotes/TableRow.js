// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { CardSegment, Label } from 'lattice-ui-kit';

import { StyledTableRow } from '../tasks/FollowUpsTableStyles';

const Date = styled.td`
  font-size: 14px;
  margin-right: 10px;
  padding-left: 30px;
  padding: 20px 15px 20px 0;
`;

const Staff = styled.td`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding: 20px 30px 20px 0;
`;

const ExpandedCell = styled.td.attrs(() => ({
  colSpan: 4
}))`
  outline: none;
`;

const ExpandedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
`;

const ExpandedDescription = styled.div`
  margin: 10px 0 20px;
  width: 100%;
`;

type Props = {
  className ?:string;
  data :Object;
};

const TableRow = ({
  className,
  data,
} :Props) => {

  const {
    assessmentNotes,
    date,
    needsAddressed,
    plansForNextVisit,
    staff,
  } = data;
  const [expanded, expandOrCollapseRow] = useState(false);

  if (expanded) {
    return (
      <StyledTableRow className={className}>
        <ExpandedCell>
          <CardSegment padding="20px 30px" vertical>
            <ExpandedHeader onClick={() => expandOrCollapseRow(!expanded)}>
              <div>{ date }</div>
              <div>{ staff }</div>
            </ExpandedHeader>
            <ExpandedDescription>
              <Label subtle>Needs Addressed</Label>
              <div>{ needsAddressed }</div>
            </ExpandedDescription>
            <ExpandedDescription>
              <Label subtle>Assessment Notes</Label>
              <div>{ assessmentNotes }</div>
            </ExpandedDescription>
            <ExpandedDescription>
              <Label subtle>Plans for Next Visit</Label>
              <div>{ plansForNextVisit }</div>
            </ExpandedDescription>
          </CardSegment>
        </ExpandedCell>
      </StyledTableRow>
    );
  }
  return (
    <StyledTableRow className={className} onClick={() => expandOrCollapseRow(!expanded)}>
      <Date>{ date }</Date>
      <Staff>{ staff }</Staff>
    </StyledTableRow>
  );
};

TableRow.defaultProps = {
  className: undefined
};

// $FlowFixMe
export default TableRow;
