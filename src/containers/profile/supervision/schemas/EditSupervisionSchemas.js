// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { SUPERVISION_LEVELS } from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ATTORNEYS,
  CONTACT_INFO,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  LEVEL,
  PHONE_NUMBER,
  RECOGNIZED_END_DATETIME,
  TYPE,
} = PROPERTY_TYPE_FQNS;

const probationParoleSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Supervision',
      properties: {
        [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: {
          type: 'string',
          title: 'Type',
          enum: ['Probation', 'Parole']
        },
        [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: {
          type: 'string',
          title: 'Probation/parole end date',
          format: 'date'
        },
        [getEntityAddressKey(0, PROBATION_PAROLE, LEVEL)]: {
          type: 'string',
          title: 'Probation/parole level',
          enum: SUPERVISION_LEVELS,
        },
      }
    },
  }
};

const officerSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Probation/Parole Officer',
      properties: {
        [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: {
          type: 'string',
          title: 'Officer first name',
        },
        [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: {
          type: 'string',
          title: 'Officer last name',
        },
      }
    },
  }
};
const officerContactSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Probation/Parole Officer Contact Information',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Officer phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
          type: 'string',
          title: 'Officer email',
        },
      }
    },
  }
};

const attorneySchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Attorney',
      properties: {
        [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: {
          type: 'string',
          title: 'Attorney first name',
        },
        [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: {
          type: 'string',
          title: 'Attorney last name',
        },
      }
    },
  }
};

const attorneyContactSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Attorney Contact Information',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Attorney phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
          type: 'string',
          title: 'Attorney email',
        },
      }
    },
  }
};

const probationParoleUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: true },
    [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PROBATION_PAROLE, LEVEL)]: {
      classNames: 'column-span-4',
    },
  },
};

const officerUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: true },
    [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: {
      classNames: 'column-span-4',
    },
  },
};

const officerContactUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: true },
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
      classNames: 'column-span-4',
    },
  },
};

const attorneyUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: true },
    [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: {
      classNames: 'column-span-4',
    },
  },
};

const attorneyContactUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: true },
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
      classNames: 'column-span-4',
    },
  },
};

export {
  attorneyContactSchema,
  attorneyContactUiSchema,
  attorneySchema,
  attorneyUiSchema,
  officerContactSchema,
  officerContactUiSchema,
  officerSchema,
  officerUiSchema,
  probationParoleSchema,
  probationParoleUiSchema,
};
