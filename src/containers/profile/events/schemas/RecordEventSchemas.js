// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../EventConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ENROLLMENT_STATUS, PROVIDER } = APP_TYPE_FQNS;
const {
  EFFECTIVE_DATE,
  ENTITY_KEY_ID,
  NOTES,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
          type: 'string',
          title: 'Event type',
          enum: ENROLLMENT_STATUSES,
          enumNames: ENROLLMENT_STATUSES
        },
        [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
          type: 'string',
          title: 'Event date',
          format: 'date',
          default: DateTime.local().toISODate()
        },
        [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Related Organization',
          enum: [],
          enumNames: []
        },
        [getEntityAddressKey(0, ENROLLMENT_STATUS, NOTES)]: {
          type: 'string',
          title: 'Notes',
        }
      }
    },
  }
};

const uiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, ENROLLMENT_STATUS, NOTES)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget'
    },
  }
};

export {
  schema,
  uiSchema,
};
