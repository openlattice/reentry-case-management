// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { HEARING_TYPES } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { HEARINGS } = APP_TYPE_FQNS;
const { DATE, TYPE } = PROPERTY_TYPE_FQNS;

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
          [getEntityAddressKey(0, HEARINGS, DATE)]: {
            type: 'string',
            title: 'Court date',
            format: 'date'
          },
          [getEntityAddressKey(0, HEARINGS, TYPE)]: {
            type: 'string',
            title: 'Hearing type',
            enum: HEARING_TYPES,
          },
        }
      }
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Court Hearing',
      orderable: false,
      addActionKey: 'addCourtHearing'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(0, HEARINGS, DATE)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, HEARINGS, TYPE)]: {
        classNames: 'column-span-6',
      },
    },
  }
};

export {
  schema,
  uiSchema,
};
