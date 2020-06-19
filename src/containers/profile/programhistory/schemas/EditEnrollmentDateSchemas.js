// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ENROLLMENT_STATUS } = APP_TYPE_FQNS;
const { EFFECTIVE_DATE } = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
          type: 'string',
          title: 'Re-entry enrollment date',
          format: 'date',
          default: DateTime.local().toISODate()
        },
      }
    },
  }
};

const uiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  schema,
  uiSchema,
};
