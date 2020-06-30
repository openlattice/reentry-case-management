// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { US_STATES } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;
const {
  COUNTY,
  OL_DATETIME,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  US_STATE,
} = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
          type: 'boolean',
          title: 'Is the client a Registered Sex Offender?',
          enum: [true, false],
          enumNames: ['Yes', 'No'],
        },
        [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)]: {
          type: 'string',
          title: 'Registered County',
        },
        [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)]: {
          type: 'string',
          title: 'Registered State',
          enum: US_STATES,
          enumNames: US_STATES
        },
        [getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)]: {
          type: 'string',
          title: 'Registered date',
          format: 'date',
        },
        [getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME)]: {
          type: 'string',
          title: 'Registry end date',
          format: 'date',
        },
      }
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
      classNames: 'column-span-12',
      'ui:widget': 'RadioWidget',
      'ui:options': {
        row: true
      }
    },
    [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME)]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  schema,
  uiSchema,
};
