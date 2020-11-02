// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { NEEDS } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PROVIDER, PROVIDER_ADDRESS } = APP_TYPE_FQNS;
const {
  DESCRIPTION,
  NAME,
  STREET,
  TYPE,
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
            enum: NEEDS,
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
        [getEntityAddressKey(0, PROVIDER_ADDRESS, STREET)]: {
          type: 'string',
          title: 'Street',
          default: ''
        },
      }
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
    classNames: 'column-span-12',
    [getEntityAddressKey(0, PROVIDER_ADDRESS, STREET)]: {
      'ui:widget': 'hidden'
    },
  }
};

export {
  schema,
  uiSchema,
};
