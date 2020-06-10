// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { getTaskName } from '../../profile/tasks/utils/ParticipantFollowUpsUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_STATUSES } from '../../profile/tasks/FollowUpsConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE, SUBJECT_OF } = APP_TYPE_FQNS;
const {
  CATEGORY,
  ENTITY_KEY_ID,
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

const addLinkedPersonField = (schema :Object, uiSchema :Object) :Object => {
  const taskSchema = schema;
  const taskUiSchema = uiSchema;

  taskSchema
    .properties[getPageSectionKey(1, 1)]
    .properties[getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
      type: 'string',
      title: 'Linked Person',
      enum: [],
      enumNames: []
    };
  taskSchema
    .properties[getPageSectionKey(1, 1)]
    .required.push(getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID));

  taskUiSchema[getPageSectionKey(1, 1)][getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
    classNames: 'column-span-12',
  };

  return { taskSchema, taskUiSchema };
};

const formatTasksForTable = (followUps :List, followUpNeighbors :Map) :Object[] => {

  const sortedTasks :List = sortEntitiesByDateProperty(followUps || List(), [GENERAL_DATETIME]);
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
    const person :Map = followUpNeighbors.getIn([taskEKID, SUBJECT_OF], Map());
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
    };
    tableData.push(taskRow);
  });
  return tableData;
};

export {
  addLinkedPersonField,
  formatTasksForTable,
};
