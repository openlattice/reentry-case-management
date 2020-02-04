// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  COUNTRIES,
  EDUCATION_LEVELS,
  ETHNICITIES,
  GENDERS,
  HEARING_TYPES,
  MARITAL_STATUSES,
  NC_COUNTIES,
  PREFERRED_COMMUNICATION_METHODS,
  RACES,
  REFERRAL_SOURCES,
  SEXES,
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
  JAILS_PRISONS,
  JAIL_STAYS,
  LOCATION,
  OFFICERS,
  PEOPLE,
  PERSON_DETAILS,
  PROBATION_PAROLE,
  REFERRAL_REQUEST,
  SEX_OFFENDER,
} = APP_TYPE_FQNS;
const {
  CITY,
  COUNTRY,
  COUNTY,
  DATE,
  DOB,
  EMAIL,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  MARITAL_STATUS,
  MIDDLE_NAME,
  NAME,
  OL_DATETIME,
  PERSON_SEX,
  PHONE_NUMBER,
  PREFERRED_METHOD_OF_CONTACT,
  PROJECTED_RELEASE_DATETIME,
  RACE,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  SOURCE,
  SSN,
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
      title: 'Legal name',
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
        [getEntityAddressKey(0, PEOPLE, PERSON_SEX)]: {
          type: 'string',
          title: 'Sex',
          enum: SEXES,
          enumNames: SEXES
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
        [getEntityAddressKey(0, PEOPLE, SSN)]: {
          type: 'string',
          title: 'Social Security #',
        },
      },
      required: [
        getEntityAddressKey(0, PEOPLE, LAST_NAME),
        getEntityAddressKey(0, PEOPLE, FIRST_NAME),
        getEntityAddressKey(0, PEOPLE, DOB)
      ]
    },
    [getPageSectionKey(1, 2)]: {
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
        [getEntityAddressKey(0, LOCATION, COUNTRY)]: {
          type: 'string',
          title: 'Country',
          enum: COUNTRIES,
          enumNames: COUNTRIES
        },
        [getEntityAddressKey(0, LOCATION, ZIP)]: {
          type: 'string',
          title: 'Zip Code',
        },
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
          type: 'string',
          title: 'Email',
        },
        [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
          type: 'string',
          title: 'Preferred communication method',
          enum: PREFERRED_COMMUNICATION_METHODS,
          enumNames: PREFERRED_COMMUNICATION_METHODS
        }
      },
    },
    [getPageSectionKey(1, 3)]: {
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
    [getPageSectionKey(1, 4)]: {
      type: 'object',
      title: 'Release Information',
      properties: {
        [getEntityAddressKey(0, JAILS_PRISONS, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Most recently released from:',
          enum: [],
          enumNames: []
        },
        [getEntityAddressKey(0, JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
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
                      title: 'Attorney Last Name',
                    },
                    [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: {
                      type: 'string',
                      title: 'Attorney First Name',
                    },
                    [getEntityAddressKey(0, EMPLOYMENT, NAME)]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Attorney'
                    },
                    [getEntityAddressKey(2, CONTACT_INFO, PHONE_NUMBER)]: {
                      type: 'string',
                      title: 'Attorney Phone Number',
                    },
                    [getEntityAddressKey(3, CONTACT_INFO, EMAIL)]: {
                      type: 'string',
                      title: 'Attorney Email',
                    },
                    [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: {
                      type: 'string',
                      title: 'Probation/Parole Officer Last Name',
                    },
                    [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: {
                      type: 'string',
                      title: 'Probation/Parole Officer First Name',
                    },
                    [getEntityAddressKey(0, EMPLOYEE, TITLE)]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Probation or Parole Officer'
                    },
                    [getEntityAddressKey(4, CONTACT_INFO, PHONE_NUMBER)]: {
                      type: 'string',
                      title: 'Probation/Parole Officer Phone Number',
                    },
                    [getEntityAddressKey(5, CONTACT_INFO, EMAIL)]: {
                      type: 'string',
                      title: 'Probation/Parole Officer Email',
                    },
                    [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: {
                      type: 'string',
                      title: 'Probation/Parole End Date',
                      format: 'date'
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
    [getPageSectionKey(1, 5)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
          type: 'boolean',
          title: 'Is the client a Registered Sex Offender?',
          enum: [true, false],
          enumNames: ['Yes', 'No'],
        },
        [getEntityAddressKey(1, LOCATION, COUNTY)]: {
          type: 'string',
          title: 'Registered NC County',
          enum: NC_COUNTIES,
          enumNames: NC_COUNTIES,
        },
        [getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)]: {
          type: 'string',
          title: 'Registered date',
          format: 'date',
        },
      }
    },
    [getPageSectionKey(1, 6)]: {
      type: 'object',
      title: '',
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
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, PERSON_SEX)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, SSN)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, RACE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, LOCATION, STREET)]: {
      classNames: 'column-span-8',
    },
    [getEntityAddressKey(0, LOCATION, CITY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, LOCATION, US_STATE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, LOCATION, COUNTRY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, LOCATION, ZIP)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: {
      classNames: 'column-span-6',
    },
  },
  [getPageSectionKey(1, 4)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, JAILS_PRISONS, ENTITY_KEY_ID)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: {
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
      [getEntityAddressKey(2, CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-6',
      },
      [getEntityAddressKey(3, CONTACT_INFO, EMAIL)]: {
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
      [getEntityAddressKey(4, CONTACT_INFO, PHONE_NUMBER)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(5, CONTACT_INFO, EMAIL)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: {
        classNames: 'column-span-4',
      }
    }
  },
  [getPageSectionKey(1, 5)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: {
      classNames: 'column-span-4',
      'ui:widget': 'RadioWidget',
      'ui:options': {
        row: true
      }
    },
    [getEntityAddressKey(1, LOCATION, COUNTY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 6)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, HEARINGS, DATE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, HEARINGS, TYPE)]: {
      classNames: 'column-span-6',
    }
  },
};

export {
  personInformationSchema,
  personInformationUiSchema,
};
