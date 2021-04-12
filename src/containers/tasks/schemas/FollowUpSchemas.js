// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_CATEGORIES, FOLLOW_UPS_TASK_TYPES } from '../../profile/tasks/FollowUpsConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  FOLLOW_UPS,
  PROVIDER,
  REENTRY_STAFF,
} = APP_TYPE_FQNS;
const {
  ASSIGNEE_ID,
  CATEGORY,
  DESCRIPTION,
  ENTITY_KEY_ID,
  GENERAL_DATETIME,
  OL_TITLE
} = PROPERTY_TYPE_FQNS;
const CATEGORIES :any = Object.values(FOLLOW_UPS_CATEGORIES);

const dataSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Reporter',
          enum: [],
          enumNames: []
        },
        [getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Assignee',
          enum: [],
          enumNames: []
        },
        [getEntityAddressKey(0, FOLLOW_UPS, CATEGORY)]: {
          type: 'string',
          title: 'Type',
          enum: CATEGORIES,
        },
        [getEntityAddressKey(0, FOLLOW_UPS, OL_TITLE)]: {
          type: 'string',
          title: 'Action item',
          enum: FOLLOW_UPS_TASK_TYPES,
        },
        [getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)]: {
          type: 'string',
          title: 'Due by:',
          format: 'date'
        },
        [getEntityAddressKey(0, FOLLOW_UPS, DESCRIPTION)]: {
          type: 'string',
          title: 'Description',
        },
        [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Linked Provider',
          enum: [],
          enumNames: []
        },
        [getEntityAddressKey(0, FOLLOW_UPS, ASSIGNEE_ID)]: {
          type: 'string',
          title: 'Task Assignee ID',
        },
      },
      required: [
        getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID),
        getEntityAddressKey(0, FOLLOW_UPS, CATEGORY),
        getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)
      ]
    }
  }
};

const uiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, FOLLOW_UPS, CATEGORY)]: {
      classNames: 'column-span-12',
      'ui:widget': 'RadioWidget',
      'ui:options': {
        row: true
      }
    },
    [getEntityAddressKey(0, FOLLOW_UPS, OL_TITLE)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, FOLLOW_UPS, DESCRIPTION)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget'
    },
    [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, FOLLOW_UPS, ASSIGNEE_ID)]: {
      'ui:widget': 'hidden',
    }
  }
};

export {
  dataSchema,
  uiSchema,
};
