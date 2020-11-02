// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { NEEDS } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE)]: {
          type: 'array',
          title: 'Check all the categories that apply.',
          items: {
            type: 'string',
            enum: NEEDS,
          },
          uniqueItems: true,
        },
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES)]: {
          type: 'string',
          title: 'Notes',
        },
      }
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE)]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
    },
    [getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES)]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget'
    },
    'ui:order': [
      getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE),
      getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES),
    ]
  }
};

export {
  schema,
  uiSchema,
};
