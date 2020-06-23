// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { REFERRAL_SOURCES } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { PROJECTED_RELEASE_DATETIME, SOURCE } = PROPERTY_TYPE_FQNS;

const schema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
          type: 'string',
          title: 'Release date:',
          format: 'date'
        },
        [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: {
          type: 'string',
          title: 'Referred from:',
          enum: REFERRAL_SOURCES,
          enumNames: REFERRAL_SOURCES
        },
      }
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  schema,
  uiSchema,
};
