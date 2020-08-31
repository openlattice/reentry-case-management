// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { FOLLOW_UPS_STATUSES } from '../../profile/tasks/FollowUpsConstants';
import { getTaskName } from '../../profile/tasks/utils/ParticipantFollowUpsUtils';

const {
  MANUAL_ASSIGNED_TO,
  MANUAL_SUBJECT_OF,
  REPORTED,
} = APP_TYPE_FQNS;
const {
  CATEGORY,
  DATETIME_COMPLETED,
  DESCRIPTION,
  GENERAL_DATETIME,
  OL_TITLE,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const getTaskNameForTaskManager = (category :string, title :string, personName :string) :string => {
  let taskName = getTaskName(category, title, personName);
  if (!taskName.includes(personName)) taskName = `${taskName} for ${personName}`;
  return taskName;
};

const formatTasksForTable = (
  followUps :List,
  followUpNeighbors :Map,
  selectedAssignees :Object[],
  selectedReporters :Object[],
) :Object[] => {

  let filteredFollowUps :List = followUps;
  const assigneeEKIDs = isDefined(selectedAssignees) ? selectedAssignees.map((option :Object) => option.value) : [];
  if (assigneeEKIDs.length) {
    filteredFollowUps = followUps.filter((task :Map) => {
      const taskEKID :UUID = getEKID(task);
      const personAssignedTo :Map = followUpNeighbors.getIn([taskEKID, MANUAL_ASSIGNED_TO], Map());
      const personAssignedToEKID :UUID = getEKID(personAssignedTo);
      return assigneeEKIDs.includes(personAssignedToEKID);
    });
  }
  const reporterEKIDs = isDefined(selectedReporters) ? selectedReporters.map((option :Object) => option.value) : [];
  if (reporterEKIDs.length) {
    filteredFollowUps = followUps.filter((task :Map) => {
      const taskEKID :UUID = getEKID(task);
      const personWhoReported :Map = followUpNeighbors.getIn([taskEKID, REPORTED], Map());
      const personWhoReportedEKID :UUID = getEKID(personWhoReported);
      return reporterEKIDs.includes(personWhoReportedEKID);
    });
  }

  const sortedTasks :List = sortEntitiesByDateProperty(filteredFollowUps || List(), [GENERAL_DATETIME]);
  const tableData = [];
  sortedTasks.forEach((task :Map) => {
    const taskEKID :UUID = getEKID(task);
    const {
      [CATEGORY]: category,
      [DATETIME_COMPLETED]: dateTimeCompleted,
      [DESCRIPTION]: description,
      [GENERAL_DATETIME]: dueDateTime,
      [OL_TITLE]: title,
      [STATUS]: status
    } = getEntityProperties(task, [CATEGORY, DATETIME_COMPLETED, DESCRIPTION, GENERAL_DATETIME, OL_TITLE, STATUS]);
    const person :Map = followUpNeighbors.getIn([taskEKID, MANUAL_SUBJECT_OF], Map());
    const personEKID :UUID = getEKID(person);
    const personName :string = getPersonFullName(person);
    const taskName :string = getTaskNameForTaskManager(category, title, personName);
    const dueDateString :string = `Due by: ${DateTime.fromISO(dueDateTime).toLocaleString(DateTime.DATE_SHORT)}`;
    let taskStatus :string = status;
    const today :DateTime = DateTime.local();
    // $FlowFixMe
    const dueDateIsBeforeToday :boolean = DateTime.fromISO(dueDateTime).startOf('day') < today.startOf('day');
    if (status === FOLLOW_UPS_STATUSES.PENDING && !dateTimeCompleted && dueDateIsBeforeToday) {
      taskStatus = FOLLOW_UPS_STATUSES.LATE;
    }

    let dateCompleted :string = '';
    if (dateTimeCompleted) dateCompleted = DateTime.fromISO(dateTimeCompleted).toLocaleString(DateTime.DATE_SHORT);

    const taskRow :Object = {
      id: taskEKID,
      taskName,
      taskDescription: description,
      dueDate: dueDateString,
      taskStatus,
      dateCompleted,
      taskTitle: title,
      personEKID,
    };
    tableData.push(taskRow);
  });
  return tableData;
};

const getReentryStaffOptions = (reentryStaffMembers :List) :Object[] => {
  const reentryStaffOptions :Object[] = [];
  reentryStaffMembers.forEach((staff :Map) => {
    reentryStaffOptions.push({ label: getPersonFullName(staff), value: getEKID(staff) });
  });
  return reentryStaffOptions;
};

const getTaskOptionsForSearch = (alreadySelectedStatuses :Object[], selectedStatus :Object[] | void) => {
  if (!isDefined(selectedStatus) || (Array.isArray(selectedStatus) && !selectedStatus.length)) {
    return [];
  }
  return selectedStatus.map<Object>((status :Object) => status.value);
};

export {
  formatTasksForTable,
  getReentryStaffOptions,
  getTaskOptionsForSearch,
};
