// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PROVIDER_TYPES, US_STATES } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  CONTACT_INFO,
  LOCATION,
  PROVIDER,
  PROVIDER_STAFF,
} = APP_TYPE_FQNS;
const {
  CITY,
  DESCRIPTION,
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  PHONE_NUMBER,
  STREET,
  TYPE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PROVIDER, NAME)]: {
          type: 'string',
          title: 'Service provider name',
        },
        [getEntityAddressKey(0, PROVIDER, TYPE)]: {
          type: 'array',
          title: 'Type of provider',
          items: {
            type: 'string',
            enum: PROVIDER_TYPES,
          },
          uniqueItems: true,
        },
        [getEntityAddressKey(0, PROVIDER, DESCRIPTION)]: {
          type: 'string',
          title: 'Description',
        },
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, LOCATION, STREET)]: {
          type: 'string',
          title: 'Street address',
        },
        [getEntityAddressKey(0, LOCATION, CITY)]: {
          type: 'string',
          title: 'City',
        },
        [getEntityAddressKey(0, LOCATION, US_STATE)]: {
          type: 'string',
          title: 'State',
          enum: US_STATES,
          enumNames: US_STATES
        },
        [getEntityAddressKey(0, LOCATION, ZIP)]: {
          type: 'string',
          title: 'Zip Code',
        },
      }
    },
    [getPageSectionKey(1, 3)]: {
      type: 'array',
      title: 'Points of Contact',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(-1, PROVIDER_STAFF, FIRST_NAME)]: {
            type: 'string',
            title: 'Contact first name'
          },
          [getEntityAddressKey(-1, PROVIDER_STAFF, LAST_NAME)]: {
            type: 'string',
            title: 'Contact last name'
          },
          [getEntityAddressKey(-1, CONTACT_INFO, PHONE_NUMBER)]: {
            type: 'string',
            title: 'Contact phone'
          },
          [getEntityAddressKey(-1, CONTACT_INFO, EMAIL)]: {
            type: 'string',
            title: 'Contact email'
          },
        }
      },
      default: [{}]
    }
  }
};

const uiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12',
    [getEntityAddressKey(0, PROVIDER, NAME)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, PROVIDER, TYPE)]: {
      classNames: 'column-span-12',
      'ui:options': {
        multiple: true
      }
    },
    [getEntityAddressKey(0, PROVIDER, DESCRIPTION)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget',
    }
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, LOCATION, STREET)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, LOCATION, CITY)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, LOCATION, US_STATE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, LOCATION, ZIP)]: {
      classNames: 'column-span-6',
    },
  },
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Contact',
      orderable: false,
      addActionKey: 'addContact'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(-1, PROVIDER_STAFF, FIRST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-1, PROVIDER_STAFF, LAST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-1, CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-1, CONTACT_INFO, EMAIL)]: {
        classNames: 'column-span-6',
      },
    }
  },
  'ui:options': { editable: true },
};

export {
  schema,
  uiSchema,
};
