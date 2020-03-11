// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  FOLLOW_UPS,
  PROVIDER,
  REENTRY_STAFF,
} = APP_TYPE_FQNS;
const {
  CATEGORY,
  DESCRIPTION,
  ENTITY_KEY_ID,
  GENERAL_DATETIME,
  TITLE
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
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
          enum: ['Task', 'Meeting'],
          enumNames: ['Task', 'Meeting'],
        },
        [getEntityAddressKey(0, FOLLOW_UPS, TITLE)]: {
          type: 'string',
          title: 'Title',
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
      },
      required: [getEntityAddressKey(0, FOLLOW_UPS, CATEGORY), getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)]
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
      'ui:widget': 'radio',
      'ui:options': {
        row: true
      }
    },
    [getEntityAddressKey(0, FOLLOW_UPS, TITLE)]: {
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
  }
};

export {
  schema,
  uiSchema,
};
