// @flow
import React, { useState } from 'react';

import styled, { css } from 'styled-components';
import { faCheck, faClipboard } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Button,
  CardSegment,
  Colors,
  StyleUtils,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';

import { StyledTableRow } from './FollowUpsTableStyles';

import CaseNotesModal from '../../containers/casenotes/CaseNotesModal';
import CompleteFollowUpModal from '../../containers/profile/tasks/CompleteFollowUpModal';
import { FOLLOW_UPS_STATUSES } from '../../containers/profile/tasks/FollowUpsConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { EMPTY_FIELD } from '../../utils/constants/GeneralConstants';
import { PARTICIPANT_FOLLOW_UPS } from '../../utils/constants/ReduxStateConstants';

const { getStyleVariation } = StyleUtils;
const {
  GREEN_2,
  NEUTRAL,
  REDS
} = Colors;
const { FOLLOW_UP_NEIGHBOR_MAP, MEETING_NOTES_STAFF_MAP } = PARTICIPANT_FOLLOW_UPS;
const {
  MANUAL_ASSIGNED_TO,
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
  padding: 20px 15px 20px 0;
  padding-left: 30px;
`;

const TaskDescriptionPreview = styled.td`
  color: ${NEUTRAL.N300};
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
  default: NEUTRAL.N300,
  [FOLLOW_UPS_STATUSES.DONE]: GREEN_2,
  [FOLLOW_UPS_STATUSES.LATE]: REDS[3],
  [FOLLOW_UPS_STATUSES.PENDING]: NEUTRAL.N300,
});

const Status = styled.div`
  ${statusStyles}
  border-radius: 4px;
  color: white;
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

const PeopleAndNotesButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ProviderAndButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 40px;
  width: 100%;
`;

type Props = {
  className ?:string;
  data :Object;
  followUpNeighborMap :Map;
  meetingNotesStaffMap :Map;
};

const TasksTableRow = ({
  className,
  data,
  followUpNeighborMap,
  meetingNotesStaffMap,
} :Props) => {

  const {
    dateCompleted,
    dueDate,
    id,
    personEKID,
    taskDescription,
    taskName,
    taskStatus,
    taskTitle,
  } = data;
  const [expanded, expandOrCollapseRow] = useState(false);
  const [completionModalVisible, setCompletionModalVisibility] = useState(false);
  const [notesModalVisible, setNotesModalVisibility] = useState(false);

  const neighbors :Map = followUpNeighborMap.get(id, Map());
  const meeting :any = neighbors.get(MEETINGS, Map());
  const personAssignedTo :Map = neighbors.get(MANUAL_ASSIGNED_TO, Map());
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
  const reporter :string = !personWhoReported.isEmpty()
    ? `${reportedFirstName} ${reportedLastName}`
    : EMPTY_FIELD;
  const personWhoReportedName :string = `Reported by: ${reporter}`;
  const { [NAME]: linkedProviderName } = getEntityProperties(linkedProvider, [NAME]);
  const providerName :string = `Provider: ${linkedProviderName || EMPTY_FIELD}`;
  const dateCompletedString :string = `Date completed: ${dateCompleted}`;

  const personWhoRecordedNotes :Map = meetingNotesStaffMap.get(getEKID(meeting), Map());

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
            <PeopleAndNotesButtonRow>
              <PeopleRow>
                <div>{ personAssignedToName }</div>
                <div>{ personWhoReportedName }</div>
              </PeopleRow>
              {
                !personWhoRecordedNotes.isEmpty() && (
                  <Button onClick={() => setNotesModalVisibility(true)}>
                    <FontAwesomeIcon icon={faClipboard} />
                  </Button>
                )
              }
            </PeopleAndNotesButtonRow>
            <ProviderAndButtonRow>
              <div>{ providerName }</div>
              {
                taskStatus !== FOLLOW_UPS_STATUSES.DONE && (
                  <Button onClick={() => setCompletionModalVisibility(true)}>
                    <FontAwesomeIcon icon={faCheck} />
                  </Button>
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
            onClose={() => setCompletionModalVisibility(false)}
            personEKID={personEKID} />
        <CaseNotesModal
            isVisible={notesModalVisible}
            meeting={meeting}
            onClose={() => setNotesModalVisibility(false)}
            staffMember={personWhoRecordedNotes} />
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

TasksTableRow.defaultProps = {
  className: undefined
};

const mapStateToProps = (state :Map) => {
  const participantFollowUps = state.get(PARTICIPANT_FOLLOW_UPS.PARTICIPANT_FOLLOW_UPS);
  return {
    [FOLLOW_UP_NEIGHBOR_MAP]: participantFollowUps.get(FOLLOW_UP_NEIGHBOR_MAP),
    [MEETING_NOTES_STAFF_MAP]: participantFollowUps.get(MEETING_NOTES_STAFF_MAP),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(TasksTableRow);
