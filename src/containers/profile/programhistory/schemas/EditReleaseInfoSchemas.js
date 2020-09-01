// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { REFERRAL_SOURCES } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, PROJECTED_RELEASE_DATETIME, SOURCE } = PROPERTY_TYPE_FQNS;

const facilitySchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Most recently released from:',
          enum: [],
          enumNames: []
        },
      }
    }
  }
};

const facilityUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: {
      classNames: 'column-span-12',
    },
  }
};

const releaseDateSchema :Object = {
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
      }
    }
  }
};

const releaseDateUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
      classNames: 'column-span-12',
    },
  }
};

const referredFromSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
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

const referredFromUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  facilitySchema,
  facilityUiSchema,
  referredFromSchema,
  referredFromUiSchema,
  releaseDateSchema,
  releaseDateUiSchema,
};
