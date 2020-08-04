// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import {
  EDUCATION_LEVELS,
  ETHNICITIES,
  GENDERS,
  MARITAL_STATUSES,
  RACES,
} from '../../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  EDUCATION,
  PEOPLE,
  PERSON_DETAILS,
  STATE_ID,
} = APP_TYPE_FQNS;
const {
  COUNTY_ID,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  MARITAL_STATUS,
  MIDDLE_NAME,
  OL_ID_FQN,
  RACE,
} = PROPERTY_TYPE_FQNS;

const personSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Person Information',
      properties: {
        [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
          type: 'string',
          title: 'Last name',
        },
        [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
          type: 'string',
          title: 'First name',
        },
        [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: {
          type: 'string',
          title: 'Middle name',
        },
        [getEntityAddressKey(0, PEOPLE, DOB)]: {
          type: 'string',
          title: 'Date of birth',
          format: 'date'
        },
        [getEntityAddressKey(0, PEOPLE, RACE)]: {
          type: 'string',
          title: 'Race',
          enum: RACES,
          enumNames: RACES
        },
        [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
          type: 'string',
          title: 'Ethnicity',
          enum: ETHNICITIES,
          enumNames: ETHNICITIES
        },
        [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: {
          type: 'string',
          title: 'County ID number',
        },
      },
    }
  }
};

const personUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, DOB)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PEOPLE, RACE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, PEOPLE, LAST_NAME),
      getEntityAddressKey(0, PEOPLE, FIRST_NAME),
      getEntityAddressKey(0, PEOPLE, MIDDLE_NAME),
      getEntityAddressKey(0, PEOPLE, DOB),
      getEntityAddressKey(0, PEOPLE, RACE),
      getEntityAddressKey(0, PEOPLE, ETHNICITY),
      getEntityAddressKey(0, PEOPLE, COUNTY_ID),
    ]
  },
};

const idSchema = {
  type: 'object',
  title: 'State ID number',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: {
          type: 'string',
          title: 'OPUS number',
        },
      }
    },
  }
};

const idUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: {
      classNames: 'column-span-6',
    },
  },
};

const personDetailsSchema = {
  type: 'object',
  title: 'Other person details',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: {
          type: 'string',
          title: 'Gender',
          enum: GENDERS,
          enumNames: GENDERS
        },
        [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: {
          type: 'string',
          title: 'Marital status',
          enum: MARITAL_STATUSES,
          enumNames: MARITAL_STATUSES
        },
      }
    },
  }
};

const personDetailsUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, PERSON_DETAILS, GENDER),
      getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS),
    ]
  },
};

const educationSchema = {
  type: 'object',
  title: 'Education',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: {
          type: 'string',
          title: 'Highest level of education completed',
          enum: EDUCATION_LEVELS,
          enumNames: EDUCATION_LEVELS
        },
      }
    },
  }
};

const educationUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': {
      editable: true
    },
    [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: {
      classNames: 'column-span-6',
    },
  },
};

export {
  educationSchema,
  educationUiSchema,
  idSchema,
  idUiSchema,
  personDetailsSchema,
  personDetailsUiSchema,
  personSchema,
  personUiSchema,
};
