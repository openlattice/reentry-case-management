// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_STATUSES } from '../../profile/tasks/FollowUpsConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { FOLLOW_UPS, MEETINGS, REENTRY_STAFF } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DATETIME_END,
  ENTITY_KEY_ID,
  FUTURE_PLANS,
  GENERAL_NOTES,
  GENERAL_STATUS,
  STATUS,
  VISIT_REASON,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: 'Case Management Notes',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, MEETINGS, VISIT_REASON)]: {
          type: 'string',
          title: 'Needs Addressed',
        },
        [getEntityAddressKey(0, MEETINGS, GENERAL_NOTES)]: {
          type: 'string',
          title: 'Assessment Notes',
        },
        [getEntityAddressKey(0, MEETINGS, FUTURE_PLANS)]: {
          type: 'string',
          title: 'Plans for Next Visit',
        },
        [getEntityAddressKey(0, MEETINGS, DATETIME_END)]: {
          type: 'string',
          title: 'Completed datetime',
          default: DateTime.local().toISO(),
        },
        [getEntityAddressKey(0, MEETINGS, GENERAL_STATUS)]: {
          type: 'string',
          title: 'Meeting status',
          default: FOLLOW_UPS_STATUSES.DONE,
        },
      },
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Filled out by',
          enum: [],
          enumNames: []
        },
      },
      required: [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]
    },
    [getPageSectionKey(1, 3)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, FOLLOW_UPS, DATETIME_COMPLETED)]: {
          type: 'string',
          title: 'Completed datetime',
          default: DateTime.local().toISO(),
        },
        [getEntityAddressKey(0, FOLLOW_UPS, STATUS)]: {
          type: 'string',
          title: 'Task status',
          default: FOLLOW_UPS_STATUSES.DONE,
        },
      }
    }
  }
};

const uiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, MEETINGS, VISIT_REASON)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget',
    },
    [getEntityAddressKey(0, MEETINGS, GENERAL_NOTES)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget',
    },
    [getEntityAddressKey(0, MEETINGS, FUTURE_PLANS)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget',
    },
    [getEntityAddressKey(0, MEETINGS, DATETIME_END)]: {
      'ui:widget': 'hidden',
    },
    [getEntityAddressKey(0, MEETINGS, GENERAL_STATUS)]: {
      'ui:widget': 'hidden',
    },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]: {
      classNames: 'column-span-6',
    }
  },
  [getPageSectionKey(1, 3)]: {
    [getEntityAddressKey(0, FOLLOW_UPS, DATETIME_COMPLETED)]: {
      'ui:widget': 'hidden',
    },
    [getEntityAddressKey(0, FOLLOW_UPS, STATUS)]: {
      'ui:widget': 'hidden',
    },
  }
};

export { schema, uiSchema };
