// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../../utils/Utils';
import { PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const {
  CATEGORY,
  DESCRIPTION,
  GENERAL_DATETIME,
  OL_TITLE
} = PROPERTY_TYPE_FQNS;

const formatTableData = (tasks :List, personName :string) :Object[] => {
  const sortedTasks :List = sortEntitiesByDateProperty(tasks || List(), [GENERAL_DATETIME]);
  const tableData = [];
  sortedTasks.forEach((task :Map) => {
    const taskEKID :UUID = getEKID(task);
    const {
      [CATEGORY]: category,
      [DESCRIPTION]: description,
      [GENERAL_DATETIME]: dueDateTime,
      [OL_TITLE]: title
    } = getEntityProperties(task, [CATEGORY, DESCRIPTION, GENERAL_DATETIME, OL_TITLE]);
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
