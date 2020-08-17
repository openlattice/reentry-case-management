// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { generateReviewSchemas } from '../../../utils/FormUtils';
import {
  EDUCATION_LEVELS,
  ETHNICITIES,
  GENDERS,
  HEARING_TYPES,
  MARITAL_STATUSES,
  PREFERRED_COMMUNICATION_METHODS,
  PREFERRED_COMMUNICATION_TIMES,
  PROVIDER_TYPES,
  RACES,
  REFERRAL_SOURCES,
  SUPERVISION_LEVELS,
  US_STATES,
} from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ATTORNEYS,
  CONTACT_INFO,
  EDUCATION,
  EMPLOYEE,
  EMPLOYMENT,
  HEARINGS,
  LOCATION,
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  OFFICERS,
  PEOPLE,
  PERSON_DETAILS,
  PROBATION_PAROLE,
  REFERRAL_REQUEST,
  SEX_OFFENDER,
  SEX_OFFENDER_REGISTRATION_LOCATION,
  STATE_ID,
} = APP_TYPE_FQNS;
const {
  CITY,
  COUNTY,
  COUNTY_ID,
  DATE,
  DATETIME_COMPLETED,
  DOB,
  EMAIL,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  GENERAL_NOTES,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  LEVEL,
  MARITAL_STATUS,
  MIDDLE_NAME,
  NAME,
  NOTES,
  OL_DATETIME,
  OL_ID_FQN,
  PERSON_SUFFIX,
  PHONE_NUMBER,
  PREFERRED_METHOD_OF_CONTACT,
  PROJECTED_RELEASE_DATETIME,
  RACE,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  SOURCE,
  STREET,
  TITLE,
  TYPE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const personInformationSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)]: {
          type: 'string',
          title: 'Enrollment date',
          format: 'date',
          default: DateTime.local().toISODate()
        },
      },
      required: [
        getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED),
      ]
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
          type: 'string',
          title: 'First name',
        },
        [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: {
          type: 'string',
          title: 'Middle name',
        },
        [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
          type: 'string',
          title: 'Last name',
        },
        [getEntityAddressKey(0, PEOPLE, PERSON_SUFFIX)]: {
          type: 'string',
          title: 'Suffix',
        },
        [getEntityAddressKey(0, PEOPLE, DOB)]: {
          type: 'string',
          title: 'Date of birth',
          format: 'date'
        },
        [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: {
          type: 'string',
          title: 'Gender',
          enum: GENDERS,
          enumNames: GENDERS
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
      },
      required: [
        getEntityAddressKey(0, PEOPLE, LAST_NAME),
        getEntityAddressKey(0, PEOPLE, FIRST_NAME),
        getEntityAddressKey(0, PEOPLE, DOB)
      ]
    },
    [getPageSectionKey(1, 5)]: {
      type: 'object',
      title: 'Contact',
      properties: {
        [getEntityAddressKey(0, LOCATION, STREET)]: {
          type: 'string',
          title: 'Street address',
        },
        [getEntityAddressKey(0, LOCATION, CITY)]: {
          type: 'string',
          title: 'City',
        },
        [getEntityAddressKey(0, LOCATION, US_STATE)]: {
          type: 'string',
          title: 'State',
          enum: US_STATES,
          enumNames: US_STATES
        },
        [getEntityAddressKey(0, LOCATION, ZIP)]: {
          type: 'string',
          title: 'Zip code',
        },
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Home phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Cell phone number',
        },
        [getEntityAddressKey(2, CONTACT_INFO, EMAIL)]: {
          type: 'string',
          title: 'Email',
        },
        [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
          type: 'string',
          title: 'Preferred communication method',
          enum: PREFERRED_COMMUNICATION_METHODS,
          enumNames: PREFERRED_COMMUNICATION_METHODS
        },
        [getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)]: {
          type: 'string',
          title: 'Preferred time of contact',
          enum: PREFERRED_COMMUNICATION_TIMES,
          enumNames: PREFERRED_COMMUNICATION_TIMES
        },
      },
    },
    [getPageSectionKey(1, 4)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: {
          type: 'string',
          title: 'Marital status',
          enum: MARITAL_STATUSES,
          enumNames: MARITAL_STATUSES
        },
        [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: {
          type: 'string',
          title: 'Highest level of education completed',
          enum: EDUCATION_LEVELS,
          enumNames: EDUCATION_LEVELS
        },
      }
    },
    [getPageSectionKey(1, 3)]: {
      type: 'object',
      title: 'Release Information',
      properties: {
        [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: {
          type: 'string',
          title: 'County ID number',
        },
        [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: {
          type: 'string',
          title: 'OPUS number',
        },
      }
    },
    [getPageSectionKey(1, 6)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Most recently released from:',
          enum: [],
          enumNames: []
        },
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
        onProbationOrParole: {
          type: 'boolean',
          title: 'Currently under NC Probation/Parole',
          default: false
        },
      },
      dependencies: {
        onProbationOrParole: {
          oneOf: [
            {
              properties: {
                onProbationOrParole: {
                  enum: [true]
                },
                [getPageSectionKey(1, 7)]: {
                  type: 'object',
                  title: '',
                  properties: {
                    [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: {
                      type: 'string',
                      title: 'Type',
                      enum: ['Probation', 'Parole']
                    },
                    [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: {
                      type: 'string',
                      title: 'Attorney last name',
                    },
                    [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: {
                      type: 'string',
                      title: 'Attorney first name',
                    },
                    [getEntityAddressKey(0, EMPLOYMENT, NAME)]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Attorney'
                    },
                    [getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)]: {
                      type: 'string',
                      title: 'Attorney phone number',
                    },
                    [getEntityAddressKey(-3, CONTACT_INFO, EMAIL)]: {
                      type: 'string',
                      title: 'Attorney email',
                    },
                    [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: {
                      type: 'string',
                      title: 'Probation/parole officer last name',
                    },
                    [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: {
                      type: 'string',
                      title: 'Probation/parole officer first name',
                    },
                    [getEntityAddressKey(0, EMPLOYEE, TITLE)]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Probation or Parole Officer'
                    },
                    [getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)]: {
                      type: 'string',
                      title: 'Probation/parole officer phone number',
                    },
                    [getEntityAddressKey(-5, CONTACT_INFO, EMAIL)]: {
                      type: 'string',
                      title: 'Probation/parole officer email',
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
                  },
                  required: [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]
                }
              }
            },
            {
              properties: {
                onProbationOrParole: {
                  enum: [false]
                }
              }
            }
          ]
        }
      }
    },
    [getPageSectionKey(1, 8)]: {
      type: 'object',
      title: 'Sex Offender Information',
      properties: {
        [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
          type: 'boolean',
          title: 'Is the client a Registered Sex Offender?',
          enum: [true, false],
          enumNames: ['Yes', 'No'],
        },
        [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)]: {
          type: 'string',
          title: 'Registered county',
        },
        [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)]: {
          type: 'string',
          title: 'Registered state',
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
      },
      required: [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]
    },
    [getPageSectionKey(1, 9)]: {
      type: 'object',
      title: 'Court Hearings',
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
    },
  },
};

const personInformationUiSchema :Object = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, PEOPLE, PERSON_SUFFIX)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, PEOPLE, DOB)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PEOPLE, RACE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED),
      getEntityAddressKey(0, PEOPLE, FIRST_NAME),
      getEntityAddressKey(0, PEOPLE, MIDDLE_NAME),
      getEntityAddressKey(0, PEOPLE, LAST_NAME),
      getEntityAddressKey(0, PEOPLE, PERSON_SUFFIX),
      getEntityAddressKey(0, PEOPLE, DOB),
      getEntityAddressKey(0, PERSON_DETAILS, GENDER),
      getEntityAddressKey(0, PEOPLE, RACE),
      getEntityAddressKey(0, PEOPLE, ETHNICITY),
      getEntityAddressKey(0, PEOPLE, OL_ID_FQN),
    ]
  },
  [getPageSectionKey(1, 5)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, LOCATION, STREET)]: {
      classNames: 'column-span-8',
    },
    [getEntityAddressKey(0, LOCATION, CITY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, LOCATION, US_STATE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, LOCATION, ZIP)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(2, CONTACT_INFO, EMAIL)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, LOCATION, STREET),
      getEntityAddressKey(0, LOCATION, CITY),
      getEntityAddressKey(0, LOCATION, US_STATE),
      getEntityAddressKey(0, LOCATION, ZIP),
      getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER),
      getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER),
      getEntityAddressKey(2, CONTACT_INFO, EMAIL),
      getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT),
      getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES),
    ]
  },
  [getPageSectionKey(1, 4)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS),
      getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)
    ]
  },
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, PEOPLE, COUNTY_ID),
      getEntityAddressKey(0, STATE_ID, OL_ID_FQN)
    ]
  },
  [getPageSectionKey(1, 6)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: {
      classNames: 'column-span-4',
    },
    onProbationOrParole: {
      classNames: 'column-span-12'
    },
    [getPageSectionKey(1, 7)]: {
      classNames: 'column-span-12 grid-container',
      [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, EMPLOYMENT, NAME)]: {
        'ui:widget': 'hidden'
      },
      [getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-3, CONTACT_INFO, EMAIL)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, EMPLOYEE, TITLE)]: {
        'ui:widget': 'hidden'
      },
      [getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(-5, CONTACT_INFO, EMAIL)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(0, PROBATION_PAROLE, LEVEL)]: {
        classNames: 'column-span-6',
      },
      'ui:order': [
        getEntityAddressKey(0, PROBATION_PAROLE, TYPE),
        getEntityAddressKey(0, ATTORNEYS, LAST_NAME),
        getEntityAddressKey(0, ATTORNEYS, FIRST_NAME),
        getEntityAddressKey(0, EMPLOYMENT, NAME),
        getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER),
        getEntityAddressKey(-3, CONTACT_INFO, EMAIL),
        getEntityAddressKey(0, OFFICERS, LAST_NAME),
        getEntityAddressKey(0, OFFICERS, FIRST_NAME),
        getEntityAddressKey(0, EMPLOYEE, TITLE),
        getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER),
        getEntityAddressKey(-5, CONTACT_INFO, EMAIL),
        getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME),
        getEntityAddressKey(0, PROBATION_PAROLE, LEVEL),
      ]
    },
    'ui:order': [
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
      getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME),
      getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE),
      'onProbationOrParole',
      getPageSectionKey(1, 7)
    ]
  },
  [getPageSectionKey(1, 8)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
      classNames: 'column-span-8',
      'ui:widget': 'RadioWidget',
      'ui:options': {
        row: true
      }
    },
    [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME)]: {
      classNames: 'column-span-4',
    },
    'ui:order': [
      getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG),
      getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY),
      getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE),
      getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME),
      getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME),
    ]
  },
  [getPageSectionKey(1, 9)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, HEARINGS, DATE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, HEARINGS, TYPE)]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      getEntityAddressKey(0, HEARINGS, DATE),
      getEntityAddressKey(0, HEARINGS, TYPE)
    ]
  },
};

const needsAssessmentSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 10)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE)]: {
          type: 'array',
          title: 'Check all the categories that apply.',
          items: {
            type: 'string',
            enum: PROVIDER_TYPES,
          },
          uniqueItems: true,
        },
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES)]: {
          type: 'string',
          title: 'Notes',
        },
      },
    }
  }
};

const needsAssessmentUiSchema = {
  [getPageSectionKey(1, 10)]: {
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
      getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES)
    ]
  }
};

const schemasWithoutReview = [
  personInformationSchema,
  needsAssessmentSchema
];
const uiSchemasWithoutReview = [
  personInformationUiSchema,
  needsAssessmentUiSchema
];
const {
  schemas,
  uiSchemas,
} = generateReviewSchemas(schemasWithoutReview, uiSchemasWithoutReview);

export {
  schemas,
  uiSchemas,
};
