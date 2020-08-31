// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../../utils/Utils';
import { FOLLOW_UPS_STATUSES } from '../FollowUpsConstants';

const {
  CATEGORY,
  DATETIME_COMPLETED,
  DESCRIPTION,
  GENERAL_DATETIME,
  OL_TITLE,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const getTaskName = (category :string, title :string, personName :string) :string => {
  if (category === 'Meeting') return `${category} with ${personName}`;
  if (title && title.length) return title;
  return category;
};

const formatTableData = (tasks :List, personName :string, personEKID :?UUID) :Object[] => {
  const sortedTasks :List = sortEntitiesByDateProperty(tasks || List(), [GENERAL_DATETIME]);
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
    const taskName :string = getTaskName(category, title, personName);
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

export {
  formatTableData,
  getTaskName,
};
