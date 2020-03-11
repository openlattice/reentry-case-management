// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const {
  CATEGORY,
  DESCRIPTION,
  GENERAL_DATETIME,
  TITLE
} = PROPERTY_TYPE_FQNS;

const formatTableData = (tasks :List, personName :string) => {
  const tableData = [];
  tasks.forEach((task :Map) => {
    const taskEKID :UUID = getEKID(task);
    const {
      [CATEGORY]: category,
      [DESCRIPTION]: description,
      [GENERAL_DATETIME]: dueDateTime,
      [TITLE]: title
    } = getEntityProperties(task, [CATEGORY, DESCRIPTION, GENERAL_DATETIME, TITLE]);
    const taskName :string = category === 'Meeting' ? `${category} with ${personName}` : title;
    const dueDateString :string = `Due by: ${DateTime.fromISO(dueDateTime).toLocaleString(DateTime.DATE_SHORT)}`;

    const taskRow :Object = {
      id: taskEKID,
      taskName,
      taskDescription: description,
      dueDate: dueDateString,
    };
    tableData.push(taskRow);
  });
  return tableData;
};

/* eslint-disable import/prefer-default-export */
export {
  formatTableData,
};
