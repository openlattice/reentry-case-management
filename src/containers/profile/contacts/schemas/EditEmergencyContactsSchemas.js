// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { CONTACT_RELATIONSHIPS } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { EMERGENCY_CONTACT, EMERGENCY_CONTACT_INFO, IS_EMERGENCY_CONTACT_FOR } = APP_TYPE_FQNS;
const {
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  PHONE_NUMBER,
  RELATIONSHIP,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'array',
      title: '',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(-1, EMERGENCY_CONTACT, FIRST_NAME)]: {
            type: 'string',
            title: 'First name',
          },
          [getEntityAddressKey(-1, EMERGENCY_CONTACT, LAST_NAME)]: {
            type: 'string',
            title: 'Last name',
          },
          [getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER)]: {
            type: 'string',
            title: 'Phone number',
          },
          [getEntityAddressKey(-2, EMERGENCY_CONTACT_INFO, EMAIL)]: {
            type: 'string',
            title: 'Email',
          },
          [getEntityAddressKey(-1, IS_EMERGENCY_CONTACT_FOR, RELATIONSHIP)]: {
            type: 'string',
            title: 'Relationship',
            enum: CONTACT_RELATIONSHIPS,
            enumNames: CONTACT_RELATIONSHIPS,
          },
        }
      },
      default: [{}]
    },
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Contact',
      orderable: false,
      addActionKey: 'addContact'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(-1, EMERGENCY_CONTACT, FIRST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-1, EMERGENCY_CONTACT, LAST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(-2, EMERGENCY_CONTACT_INFO, EMAIL)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(-1, IS_EMERGENCY_CONTACT_FOR, RELATIONSHIP)]: {
        classNames: 'column-span-4',
      },
    },
  },
};

export {
  schema,
  uiSchema,
};
