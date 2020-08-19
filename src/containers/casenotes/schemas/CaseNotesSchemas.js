// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { MEETINGS, REENTRY_STAFF } = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  FUTURE_PLANS,
  GENERAL_NOTES,
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
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]: {
      classNames: 'column-span-6',
    }
  }
};

export { schema, uiSchema };
