// @flow
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  CardSegment,
  Colors,
  IconButton,
  StyleUtils,
} from 'lattice-ui-kit';
import { faCheck } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import CompleteFollowUpModal from '../CompleteFollowUpModal';
import { StyledTableRow } from './FollowUpsTableStyles';
import { getEntityProperties } from '../../../../utils/DataUtils';
import { PARTICIPANT_FOLLOW_UPS } from '../../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_STATUSES } from '../FollowUpsConstants';

const { getStyleVariation } = StyleUtils;
const {
  GREEN_1,
  NEUTRALS,
  REDS,
  WHITE
} = Colors;
const { FOLLOW_UP_NEIGHBOR_MAP } = PARTICIPANT_FOLLOW_UPS;
const {
  ASSIGNED_TO,
  MEETINGS,
  PROVIDER,
  REPORTED,
} = APP_TYPE_FQNS;
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
  text-align: left;
  ${cellPadding}
  padding-left: 30px;
`;

const statusStyles = css`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StatusWrapper = styled.td`
  ${statusStyles}
  justify-content: flex-end;
  ${cellPadding}
  padding-right: 30px;
`;

const statusColorVariation = getStyleVariation('bgColor', {
  default: NEUTRALS[1],
  [FOLLOW_UPS_STATUSES.DONE]: GREEN_1,
  [FOLLOW_UPS_STATUSES.LATE]: REDS[4],
  [FOLLOW_UPS_STATUSES.PENDING]: NEUTRALS[1],
});

const Status = styled.div`
  ${statusStyles}
  border-radius: 4px;
  color: ${WHITE};
  font-size: 12px;
  font-weight: bold;
  padding: 4px 0;
  text-transform: uppercase;
  width: 70px;
  background-color: ${statusColorVariation};
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

const ExpandedHeaderEndGroup = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 30px;
  width: 270px;
`;

const ExpandedDescription = styled.div`
  margin: 10px 0 20px;
  width: 100%;
`;

const TitleRow = styled.div`
  margin-top: -10px;
  margin-bottom: 10px;
`;

const PeopleRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 50%;
`;

const ProviderAndButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 40px;
  width: 100%;
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
    taskDescription,
    taskStatus,
    dateCompleted,
    taskTitle,
  } = data;
  const [expanded, expandOrCollapseRow] = useState(false);
  const [completionModalVisible, setCompletionModalVisibility] = useState(false);

  const neighbors :Map = followUpNeighborMap.get(id, Map());
  const meeting :any = neighbors.get(MEETINGS, Map());
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
  const dateCompletedString :string = `Date completed: ${dateCompleted}`;

  if (expanded) {
    return (
      <StyledTableRow className={className}>
        <ExpandedCell>
          <CardSegment padding="20px 30px" vertical>
            <ExpandedHeader onClick={() => expandOrCollapseRow(!expanded)}>
              <div>{ taskName }</div>
              <ExpandedHeaderEndGroup>
                <div>{ dueDate }</div>
                <Status bgColor={taskStatus}>{ taskStatus }</Status>
              </ExpandedHeaderEndGroup>
            </ExpandedHeader>
            { taskName.includes('Meeting') && (<TitleRow>{ taskTitle }</TitleRow>)}
            <ExpandedDescription>{ taskDescription }</ExpandedDescription>
            <PeopleRow>
              <div>{ personAssignedToName }</div>
              <div>{ personWhoReportedName }</div>
            </PeopleRow>
            <ProviderAndButtonRow>
              <div>{ providerName }</div>
              {
                taskStatus !== FOLLOW_UPS_STATUSES.DONE && (
                  <IconButton
                      onClick={() => setCompletionModalVisibility(true)}
                      icon={<FontAwesomeIcon icon={faCheck} />} />
                )
              }
              {
                taskStatus === FOLLOW_UPS_STATUSES.DONE && (
                  <div>{ dateCompletedString }</div>
                )
              }
            </ProviderAndButtonRow>
          </CardSegment>
        </ExpandedCell>
        <CompleteFollowUpModal
            followUpEKID={id}
            isVisible={completionModalVisible}
            meeting={meeting}
            onClose={() => setCompletionModalVisibility(false)} />
      </StyledTableRow>
    );
  }
  return (
    <StyledTableRow className={className} onClick={() => expandOrCollapseRow(!expanded)}>
      <TaskName>{ taskName }</TaskName>
      <TaskDescriptionPreview>{ taskDescription }</TaskDescriptionPreview>
      <DueBy>{ dueDate }</DueBy>
      <StatusWrapper>
        <Status bgColor={taskStatus}>{ taskStatus }</Status>
      </StatusWrapper>
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
