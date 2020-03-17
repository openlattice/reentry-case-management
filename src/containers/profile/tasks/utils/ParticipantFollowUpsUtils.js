// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../../utils/Utils';
import { PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_STATUSES } from '../FollowUpsConstants';

const {
  CATEGORY,
  DATETIME_COMPLETED,
  DESCRIPTION,
  GENERAL_DATETIME,
  OL_TITLE,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const formatTableData = (tasks :List, personName :string) :Object[] => {
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
    const taskName :string = category === 'Meeting' ? `${category} with ${personName}` : title;
    const dueDateString :string = `Due by: ${DateTime.fromISO(dueDateTime).toLocaleString(DateTime.DATE_SHORT)}`;
    let taskStatus :string = status;
    const today :DateTime = DateTime.local();
    // $FlowFixMe
    const dueDateIsBeforeToday :boolean = DateTime.fromISO(dueDateTime).startOf('day') < today.startOf('day');
    if (!status && !dateTimeCompleted && dueDateIsBeforeToday) taskStatus = FOLLOW_UPS_STATUSES.LATE;
    if (!status && !dateTimeCompleted && !dueDateIsBeforeToday) taskStatus = FOLLOW_UPS_STATUSES.PENDING;

    const taskRow :Object = {
      id: taskEKID,
      taskName,
      taskDescription: description,
      dueDate: dueDateString,
      taskStatus,
    };
    tableData.push(taskRow);
  });
  return tableData;
};

/* eslint-disable import/prefer-default-export */
export {
  formatTableData,
};
