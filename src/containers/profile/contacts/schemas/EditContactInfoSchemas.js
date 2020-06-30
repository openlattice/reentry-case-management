// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import {
  PREFERRED_COMMUNICATION_METHODS,
  PREFERRED_COMMUNICATION_TIMES,
  US_STATES,
} from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CONTACT_INFO, LOCATION } = APP_TYPE_FQNS;
const {
  CITY,
  EMAIL,
  GENERAL_NOTES,
  PHONE_NUMBER,
  PREFERRED_METHOD_OF_CONTACT,
  STREET,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Contact info',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
          type: 'string',
          title: 'Email address',
        },
        [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
          type: 'string',
          title: 'Preferred communication method',
          enum: PREFERRED_COMMUNICATION_METHODS,
          enumNames: PREFERRED_COMMUNICATION_METHODS
        },
        [getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)]: {
          type: 'string',
          title: 'Preferred time of contact',
          enum: PREFERRED_COMMUNICATION_TIMES,
          enumNames: PREFERRED_COMMUNICATION_TIMES
        },
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: 'Address',
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
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)]: {
      classNames: 'column-span-6',
    },
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
  }
};

export {
  schema,
  uiSchema,
};
