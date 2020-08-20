// @flow
import { DateTime } from 'luxon';

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
import {
  ATTORNEY_EMAIL_EAK,
  ATTORNEY_EMPLOYMENT_EAK,
  ATTORNEY_FIRST_NAME_EAK,
  ATTORNEY_LAST_NAME_EAK,
  ATTORNEY_PHONE_EAK,
  CELL_PHONE_EAK,
  CITY_EAK,
  CONTACT_INFO_PSK,
  COUNTY_ID_EAK,
  COURT_HEARINGS_PSK,
  DOB_EAK,
  EDUCATION_EAK,
  EMAIL_EAK,
  ENROLLMENT_DATE_EAK,
  ENROLLMENT_DATE_PSK,
  ETHNICITY_EAK,
  FIRST_NAME_EAK,
  GENDER_EAK,
  HEARING_DATE_EAK,
  HEARING_TYPE_EAK,
  HOME_PHONE_EAK,
  ID_PSK,
  JAILS_PRISONS_EAK,
  JAIL_STAYS_EAK,
  JAIL_STAYS_NOTES,
  LAST_NAME_EAK,
  MARITAL_AND_EDUCATION_PSK,
  MARITAL_STATUS_EAK,
  MIDDLE_NAME_EAK,
  NEEDS_ASSESSMENT_NOTES_EAK,
  NEEDS_ASSESSMENT_PSK,
  NEEDS_EAK,
  OFFICER_EMAIL_EAK,
  OFFICER_FIRST_NAME_EAK,
  OFFICER_LAST_NAME_EAK,
  OFFICER_PHONE_EAK,
  OFFICER_TITLE_EAK,
  PERSON_PSK,
  PREFERRED_METHOD_EAK,
  PREFERRED_TIME_EAK,
  RACE_EAK,
  REFERRAL_EAK,
  REGISTRATION_EAK,
  RELEASE_PSK,
  SEX_OFFENDER_COUNTY_EAK,
  SEX_OFFENDER_DATETIME_EAK,
  SEX_OFFENDER_END_DATETIME_EAK,
  SEX_OFFENDER_PSK,
  SEX_OFFENDER_STATE_EAK,
  STATE_ID_EAK,
  STREET_EAK,
  SUFFIX_EAK,
  SUPERVISION_END_DATETIME_EAK,
  SUPERVISION_INNER_PSK,
  SUPERVISION_LEVEL_EAK,
  SUPERVISION_TYPE_EAK,
  US_STATE_EAK,
  ZIP_EAK,
} from '../IntakeConstants';

const personInformationSchema :Object = {
  type: 'object',
  title: '',
  properties: {
    [ENROLLMENT_DATE_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [ENROLLMENT_DATE_EAK]: {
          type: 'string',
          title: 'Enrollment date',
          format: 'date',
          default: DateTime.local().toISODate()
        },
      },
      required: [
        ENROLLMENT_DATE_EAK,
      ]
    },
    [PERSON_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [FIRST_NAME_EAK]: {
          type: 'string',
          title: 'First name',
        },
        [MIDDLE_NAME_EAK]: {
          type: 'string',
          title: 'Middle name',
        },
        [LAST_NAME_EAK]: {
          type: 'string',
          title: 'Last name',
        },
        [SUFFIX_EAK]: {
          type: 'string',
          title: 'Suffix',
        },
        [DOB_EAK]: {
          type: 'string',
          title: 'Date of birth',
          format: 'date'
        },
        [GENDER_EAK]: {
          type: 'string',
          title: 'Gender',
          enum: GENDERS,
          enumNames: GENDERS
        },
        [RACE_EAK]: {
          type: 'string',
          title: 'Race',
          enum: RACES,
          enumNames: RACES
        },
        [ETHNICITY_EAK]: {
          type: 'string',
          title: 'Ethnicity',
          enum: ETHNICITIES,
          enumNames: ETHNICITIES
        },
      },
      required: [
        LAST_NAME_EAK,
        FIRST_NAME_EAK,
        DOB_EAK
      ]
    },
    [CONTACT_INFO_PSK]: {
      type: 'object',
      title: 'Contact',
      properties: {
        [STREET_EAK]: {
          type: 'string',
          title: 'Street address',
        },
        [CITY_EAK]: {
          type: 'string',
          title: 'City',
        },
        [US_STATE_EAK]: {
          type: 'string',
          title: 'State',
          enum: US_STATES,
          enumNames: US_STATES
        },
        [ZIP_EAK]: {
          type: 'string',
          title: 'Zip code',
        },
        [HOME_PHONE_EAK]: {
          type: 'string',
          title: 'Home phone number',
        },
        [CELL_PHONE_EAK]: {
          type: 'string',
          title: 'Cell phone number',
        },
        [EMAIL_EAK]: {
          type: 'string',
          title: 'Email',
        },
        [PREFERRED_METHOD_EAK]: {
          type: 'string',
          title: 'Preferred communication method',
          enum: PREFERRED_COMMUNICATION_METHODS,
          enumNames: PREFERRED_COMMUNICATION_METHODS
        },
        [PREFERRED_TIME_EAK]: {
          type: 'string',
          title: 'Preferred time of contact',
          enum: PREFERRED_COMMUNICATION_TIMES,
          enumNames: PREFERRED_COMMUNICATION_TIMES
        },
      },
    },
    [MARITAL_AND_EDUCATION_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [MARITAL_STATUS_EAK]: {
          type: 'string',
          title: 'Marital status',
          enum: MARITAL_STATUSES,
          enumNames: MARITAL_STATUSES
        },
        [EDUCATION_EAK]: {
          type: 'string',
          title: 'Highest level of education completed',
          enum: EDUCATION_LEVELS,
          enumNames: EDUCATION_LEVELS
        },
      }
    },
    [ID_PSK]: {
      type: 'object',
      title: 'Release Information',
      properties: {
        [COUNTY_ID_EAK]: {
          type: 'string',
          title: 'County ID number',
        },
        [STATE_ID_EAK]: {
          type: 'string',
          title: 'OPUS number',
        },
      }
    },
    [RELEASE_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [JAILS_PRISONS_EAK]: {
          type: 'string',
          title: 'Most recently released from:',
          enum: [],
          enumNames: []
        },
        [JAIL_STAYS_EAK]: {
          type: 'string',
          title: 'Release date:',
          format: 'date'
        },
        [JAIL_STAYS_NOTES]: {
          type: 'string',
          title: 'Purpose of this property is to always create jailstay entity on submission',
          default: ''
        },
        [REFERRAL_EAK]: {
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
                [SUPERVISION_INNER_PSK]: {
                  type: 'object',
                  title: '',
                  properties: {
                    [SUPERVISION_TYPE_EAK]: {
                      type: 'string',
                      title: 'Type',
                      enum: ['Probation', 'Parole']
                    },
                    [ATTORNEY_LAST_NAME_EAK]: {
                      type: 'string',
                      title: 'Attorney last name',
                    },
                    [ATTORNEY_FIRST_NAME_EAK]: {
                      type: 'string',
                      title: 'Attorney first name',
                    },
                    [ATTORNEY_EMPLOYMENT_EAK]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Attorney'
                    },
                    [ATTORNEY_PHONE_EAK]: {
                      type: 'string',
                      title: 'Attorney phone number',
                    },
                    [ATTORNEY_EMAIL_EAK]: {
                      type: 'string',
                      title: 'Attorney email',
                    },
                    [OFFICER_LAST_NAME_EAK]: {
                      type: 'string',
                      title: 'Probation/parole officer last name',
                    },
                    [OFFICER_FIRST_NAME_EAK]: {
                      type: 'string',
                      title: 'Probation/parole officer first name',
                    },
                    [OFFICER_TITLE_EAK]: {
                      type: 'string',
                      title: 'Employee title',
                      default: 'Probation or Parole Officer'
                    },
                    [OFFICER_PHONE_EAK]: {
                      type: 'string',
                      title: 'Probation/parole officer phone number',
                    },
                    [OFFICER_EMAIL_EAK]: {
                      type: 'string',
                      title: 'Probation/parole officer email',
                    },
                    [SUPERVISION_END_DATETIME_EAK]: {
                      type: 'string',
                      title: 'Probation/parole end date',
                      format: 'date'
                    },
                    [SUPERVISION_LEVEL_EAK]: {
                      type: 'string',
                      title: 'Probation/parole level',
                      enum: SUPERVISION_LEVELS,
                    },
                  },
                  required: [SUPERVISION_TYPE_EAK]
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
    [SEX_OFFENDER_PSK]: {
      type: 'object',
      title: 'Sex Offender Information',
      properties: {
        [REGISTRATION_EAK]: {
          type: 'boolean',
          title: 'Is the client a Registered Sex Offender?',
          enum: [true, false],
          enumNames: ['Yes', 'No'],
        },
        [SEX_OFFENDER_COUNTY_EAK]: {
          type: 'string',
          title: 'Registered county',
        },
        [SEX_OFFENDER_STATE_EAK]: {
          type: 'string',
          title: 'Registered state',
          enum: US_STATES,
          enumNames: US_STATES
        },
        [SEX_OFFENDER_DATETIME_EAK]: {
          type: 'string',
          title: 'Registered date',
          format: 'date',
        },
        [SEX_OFFENDER_END_DATETIME_EAK]: {
          type: 'string',
          title: 'Registry end date',
          format: 'date',
        },
      },
      required: [REGISTRATION_EAK]
    },
    [COURT_HEARINGS_PSK]: {
      type: 'object',
      title: 'Court Hearings',
      properties: {
        [HEARING_DATE_EAK]: {
          type: 'string',
          title: 'Court date',
          format: 'date'
        },
        [HEARING_TYPE_EAK]: {
          type: 'string',
          title: 'Hearing type',
          enum: HEARING_TYPES,
        },
      }
    },
  },
};

const personInformationUiSchema :Object = {
  [ENROLLMENT_DATE_PSK]: {
    classNames: 'column-span-12 grid-container',
    [ENROLLMENT_DATE_EAK]: {
      classNames: 'column-span-4',
    },
  },
  [PERSON_PSK]: {
    classNames: 'column-span-12 grid-container',
    [FIRST_NAME_EAK]: {
      classNames: 'column-span-3',
    },
    [MIDDLE_NAME_EAK]: {
      classNames: 'column-span-3',
    },
    [LAST_NAME_EAK]: {
      classNames: 'column-span-3',
    },
    [SUFFIX_EAK]: {
      classNames: 'column-span-3',
    },
    [DOB_EAK]: {
      classNames: 'column-span-6',
    },
    [GENDER_EAK]: {
      classNames: 'column-span-6',
    },
    [RACE_EAK]: {
      classNames: 'column-span-6',
    },
    [ETHNICITY_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      ENROLLMENT_DATE_EAK,
      FIRST_NAME_EAK,
      MIDDLE_NAME_EAK,
      LAST_NAME_EAK,
      SUFFIX_EAK,
      DOB_EAK,
      GENDER_EAK,
      RACE_EAK,
      ETHNICITY_EAK,
    ]
  },
  [CONTACT_INFO_PSK]: {
    classNames: 'column-span-12 grid-container',
    [STREET_EAK]: {
      classNames: 'column-span-8',
    },
    [CITY_EAK]: {
      classNames: 'column-span-4',
    },
    [US_STATE_EAK]: {
      classNames: 'column-span-6',
    },
    [ZIP_EAK]: {
      classNames: 'column-span-6',
    },
    [HOME_PHONE_EAK]: {
      classNames: 'column-span-4',
    },
    [CELL_PHONE_EAK]: {
      classNames: 'column-span-4',
    },
    [EMAIL_EAK]: {
      classNames: 'column-span-4',
    },
    [PREFERRED_METHOD_EAK]: {
      classNames: 'column-span-6',
    },
    [PREFERRED_TIME_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      STREET_EAK,
      CITY_EAK,
      US_STATE_EAK,
      ZIP_EAK,
      HOME_PHONE_EAK,
      CELL_PHONE_EAK,
      EMAIL_EAK,
      PREFERRED_METHOD_EAK,
      PREFERRED_TIME_EAK,
    ]
  },
  [MARITAL_AND_EDUCATION_PSK]: {
    classNames: 'column-span-12 grid-container',
    [MARITAL_STATUS_EAK]: {
      classNames: 'column-span-6',
    },
    [EDUCATION_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      MARITAL_STATUS_EAK,
      EDUCATION_EAK
    ]
  },
  [ID_PSK]: {
    classNames: 'column-span-12 grid-container',
    [COUNTY_ID_EAK]: {
      classNames: 'column-span-6',
    },
    [STATE_ID_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      COUNTY_ID_EAK,
      STATE_ID_EAK
    ]
  },
  [RELEASE_PSK]: {
    classNames: 'column-span-12 grid-container',
    [JAILS_PRISONS_EAK]: {
      classNames: 'column-span-4',
    },
    [JAIL_STAYS_EAK]: {
      classNames: 'column-span-4',
    },
    [JAIL_STAYS_NOTES]: {
      'ui:widget': 'hidden',
    },
    [REFERRAL_EAK]: {
      classNames: 'column-span-4',
    },
    onProbationOrParole: {
      classNames: 'column-span-12'
    },
    [SUPERVISION_INNER_PSK]: {
      classNames: 'column-span-12 grid-container',
      [SUPERVISION_TYPE_EAK]: {
        classNames: 'column-span-4',
      },
      [ATTORNEY_LAST_NAME_EAK]: {
        classNames: 'column-span-4',
      },
      [ATTORNEY_FIRST_NAME_EAK]: {
        classNames: 'column-span-4',
      },
      [ATTORNEY_EMPLOYMENT_EAK]: {
        'ui:widget': 'hidden'
      },
      [ATTORNEY_PHONE_EAK]: {
        classNames: 'column-span-6',
      },
      [ATTORNEY_EMAIL_EAK]: {
        classNames: 'column-span-6',
      },
      [OFFICER_LAST_NAME_EAK]: {
        classNames: 'column-span-6',
      },
      [OFFICER_FIRST_NAME_EAK]: {
        classNames: 'column-span-6',
      },
      [OFFICER_TITLE_EAK]: {
        'ui:widget': 'hidden'
      },
      [OFFICER_PHONE_EAK]: {
        classNames: 'column-span-6',
      },
      [OFFICER_EMAIL_EAK]: {
        classNames: 'column-span-6',
      },
      [SUPERVISION_END_DATETIME_EAK]: {
        classNames: 'column-span-6',
      },
      [SUPERVISION_LEVEL_EAK]: {
        classNames: 'column-span-6',
      },
      'ui:order': [
        SUPERVISION_TYPE_EAK,
        ATTORNEY_LAST_NAME_EAK,
        ATTORNEY_FIRST_NAME_EAK,
        ATTORNEY_EMPLOYMENT_EAK,
        ATTORNEY_PHONE_EAK,
        ATTORNEY_EMAIL_EAK,
        OFFICER_LAST_NAME_EAK,
        OFFICER_FIRST_NAME_EAK,
        OFFICER_TITLE_EAK,
        OFFICER_PHONE_EAK,
        OFFICER_EMAIL_EAK,
        SUPERVISION_END_DATETIME_EAK,
        SUPERVISION_LEVEL_EAK,
      ]
    },
    'ui:order': [
      JAILS_PRISONS_EAK,
      JAIL_STAYS_EAK,
      JAIL_STAYS_NOTES,
      REFERRAL_EAK,
      'onProbationOrParole',
      SUPERVISION_INNER_PSK
    ]
  },
  [SEX_OFFENDER_PSK]: {
    classNames: 'column-span-12 grid-container',
    [REGISTRATION_EAK]: {
      classNames: 'column-span-8',
      'ui:widget': 'RadioWidget',
      'ui:options': {
        row: true
      }
    },
    [SEX_OFFENDER_COUNTY_EAK]: {
      classNames: 'column-span-4',
    },
    [SEX_OFFENDER_STATE_EAK]: {
      classNames: 'column-span-4',
    },
    [SEX_OFFENDER_DATETIME_EAK]: {
      classNames: 'column-span-4',
    },
    [SEX_OFFENDER_END_DATETIME_EAK]: {
      classNames: 'column-span-4',
    },
    'ui:order': [
      REGISTRATION_EAK,
      SEX_OFFENDER_COUNTY_EAK,
      SEX_OFFENDER_STATE_EAK,
      SEX_OFFENDER_DATETIME_EAK,
      SEX_OFFENDER_END_DATETIME_EAK,
    ]
  },
  [COURT_HEARINGS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [HEARING_DATE_EAK]: {
      classNames: 'column-span-6',
    },
    [HEARING_TYPE_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:order': [
      HEARING_DATE_EAK,
      HEARING_TYPE_EAK
    ]
  },
};

const needsAssessmentSchema = {
  type: 'object',
  title: '',
  properties: {
    [NEEDS_ASSESSMENT_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [NEEDS_EAK]: {
          type: 'array',
          title: 'Check all the categories that apply.',
          items: {
            type: 'string',
            enum: PROVIDER_TYPES,
          },
          uniqueItems: true,
        },
        [NEEDS_ASSESSMENT_NOTES_EAK]: {
          type: 'string',
          title: 'Notes',
        },
      },
    }
  }
};

const needsAssessmentUiSchema = {
  [NEEDS_ASSESSMENT_PSK]: {
    classNames: 'column-span-12 grid-container',
    [NEEDS_EAK]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
    },
    [NEEDS_ASSESSMENT_NOTES_EAK]: {
      classNames: 'column-span-12',
      'ui:widget': 'TextareaWidget'
    },
    'ui:order': [
      NEEDS_EAK,
      NEEDS_ASSESSMENT_NOTES_EAK
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
