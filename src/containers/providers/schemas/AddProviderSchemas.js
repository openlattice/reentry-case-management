// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PROVIDER_TYPES } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PROVIDER } = APP_TYPE_FQNS;
const { DESCRIPTION, NAME, TYPE } = PROPERTY_TYPE_FQNS;

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
  }
};

export {
  schema,
  uiSchema,
};
