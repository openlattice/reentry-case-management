// @flow

const FOLLOW_UPS_CATEGORIES :Object = {
  TASK: 'Task',
  MEETING: 'Meeting'
};

const FOLLOW_UPS_TASK_TYPES :string[] = [
  'Schedule Phone Call',
  'Schedule Interview',
  'Submit Application',
];

const FOLLOW_UPS_STATUSES :Object = {
  COMPLETED: 'Completed',
  LATE: 'Late',
  PENDING: 'Pending',
};

export {
  FOLLOW_UPS_CATEGORIES,
  FOLLOW_UPS_STATUSES,
  FOLLOW_UPS_TASK_TYPES,
};
