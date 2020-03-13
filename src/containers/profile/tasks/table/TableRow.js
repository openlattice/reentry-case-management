// @flow
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { CardSegment, Colors } from 'lattice-ui-kit';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { StyledTableRow } from './FollowUpsTableStyles';
import { getEntityProperties } from '../../../../utils/DataUtils';
import { PARTICIPANT_FOLLOW_UPS } from '../../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS } = Colors;
const { FOLLOW_UP_NEIGHBOR_MAP } = PARTICIPANT_FOLLOW_UPS;
const { ASSIGNED_TO, PROVIDER, REPORTED } = APP_TYPE_FQNS;
const { FIRST_NAME, LAST_NAME, NAME } = PROPERTY_TYPE_FQNS;

const cellPadding = css`
  padding: 20px 0;
`;

const TaskName = styled.td`
  margin-right: 10px;
  font-size: 14px;
  ${cellPadding}
  padding-left: 30px;
`;

const TaskDescriptionPreview = styled.td`
  color: ${NEUTRALS[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 70%;
  ${cellPadding}
`;

const DueBy = styled.td`
  text-align: right;
  ${cellPadding}
  padding-right: 30px;
`;

const ExpandedCell = styled.td.attrs(() => ({
  colSpan: 3
}))`
`;

const ExpandedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
`;

const ExpandedDescription = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const PeopleRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 50%;
`;

type Props = {
  actions:{
  };
  className ?:string;
  data :Object;
  followUpNeighborMap :Map;
};

const TableRow = ({ className, data, followUpNeighborMap } :Props) => {
  const {
    dueDate,
    id,
    taskName,
    taskDescription
  } = data;
  const [expanded, expandOrCollapseRow] = useState(false);
  const neighbors :Map = followUpNeighborMap.get(id, Map());
  const personAssignedTo :Map = neighbors.get(ASSIGNED_TO, Map());
  const personWhoReported :Map = neighbors.get(REPORTED, Map());
  const linkedProvider :Map = neighbors.get(PROVIDER, Map());
  const { [FIRST_NAME]: assignedFirstName, [LAST_NAME]: assignedLastName } = getEntityProperties(
    personAssignedTo,
    [FIRST_NAME, LAST_NAME]
  );
  const personAssignedToName :string = `Assigned to: ${assignedFirstName} ${assignedLastName}`;
  const { [FIRST_NAME]: reportedFirstName, [LAST_NAME]: reportedLastName } = getEntityProperties(
    personWhoReported,
    [FIRST_NAME, LAST_NAME]
  );
  const personWhoReportedName :string = `Reported by: ${reportedFirstName} ${reportedLastName}`;
  const { [NAME]: linkedProviderName } = getEntityProperties(linkedProvider, [NAME]);
  const providerName :string = `Provider: ${linkedProviderName}`;

  if (expanded) {
    return (
      <StyledTableRow className={className} onClick={() => expandOrCollapseRow(!expanded)}>
        <ExpandedCell>
          <CardSegment padding="20px 30px" vertical>
            <ExpandedHeader>
              <div>{ taskName }</div>
              <div>{ dueDate }</div>
            </ExpandedHeader>
            <ExpandedDescription>{ taskDescription }</ExpandedDescription>
            <PeopleRow>
              <div>{ personAssignedToName }</div>
              <div>{ personWhoReportedName }</div>
            </PeopleRow>
            <div>{ providerName }</div>
          </CardSegment>
        </ExpandedCell>
      </StyledTableRow>
    );
  }
  return (
    <StyledTableRow className={className} onClick={() => expandOrCollapseRow(!expanded)}>
      <TaskName>{ taskName }</TaskName>
      <TaskDescriptionPreview>{ taskDescription }</TaskDescriptionPreview>
      <DueBy>{ dueDate }</DueBy>
    </StyledTableRow>
  );
};

TableRow.defaultProps = {
  className: undefined
};

const mapStateToProps = (state :Map) => {
  const participantFollowUps = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  return {
    [FOLLOW_UP_NEIGHBOR_MAP]: participantFollowUps.get(FOLLOW_UP_NEIGHBOR_MAP),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(TableRow);
