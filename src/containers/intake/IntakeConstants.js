// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

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

/*
 * enrollment date
 */
export const ENROLLMENT_DATE_PSK = getPageSectionKey(1, 1);
export const ENROLLMENT_DATE_EAK = getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED);

/*
 * person
 */
export const PERSON_PSK = getPageSectionKey(1, 2);
export const FIRST_NAME_EAK = getEntityAddressKey(0, PEOPLE, FIRST_NAME);
export const MIDDLE_NAME_EAK = getEntityAddressKey(0, PEOPLE, MIDDLE_NAME);
export const LAST_NAME_EAK = getEntityAddressKey(0, PEOPLE, LAST_NAME);
export const SUFFIX_EAK = getEntityAddressKey(0, PEOPLE, PERSON_SUFFIX);
export const DOB_EAK = getEntityAddressKey(0, PEOPLE, DOB);
export const GENDER_EAK = getEntityAddressKey(0, PERSON_DETAILS, GENDER);
export const RACE_EAK = getEntityAddressKey(0, PEOPLE, RACE);
export const ETHNICITY_EAK = getEntityAddressKey(0, PEOPLE, ETHNICITY);

/*
 * contact info
 */
export const CONTACT_INFO_PSK = getPageSectionKey(1, 3);
export const STREET_EAK = getEntityAddressKey(0, LOCATION, STREET);
export const CITY_EAK = getEntityAddressKey(0, LOCATION, CITY);
export const US_STATE_EAK = getEntityAddressKey(0, LOCATION, US_STATE);
export const ZIP_EAK = getEntityAddressKey(0, LOCATION, ZIP);
export const HOME_PHONE_EAK = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
export const CELL_PHONE_EAK = getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER);
export const EMAIL_EAK = getEntityAddressKey(2, CONTACT_INFO, EMAIL);
export const PREFERRED_METHOD_EAK = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
export const PREFERRED_TIME_EAK = getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES);

/*
 * marital status and education
 */
export const MARITAL_AND_EDUCATION_PSK = getPageSectionKey(1, 4);
export const MARITAL_STATUS_EAK = getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS);
export const EDUCATION_EAK = getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL);

/*
 * ids
 */
export const ID_PSK = getPageSectionKey(1, 5);
export const COUNTY_ID_EAK = getEntityAddressKey(0, PEOPLE, COUNTY_ID);
export const STATE_ID_EAK = getEntityAddressKey(0, STATE_ID, OL_ID_FQN);

/*
 * release and supervision information
 */
export const RELEASE_PSK = getPageSectionKey(1, 6);
export const JAILS_PRISONS_EAK = getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID);
export const JAIL_STAYS_EAK = getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME);
export const JAIL_STAYS_NOTES = getEntityAddressKey(0, MANUAL_JAIL_STAYS, NOTES);
export const REFERRAL_EAK = getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE);

export const SUPERVISION_INNER_PSK = getPageSectionKey(1, 7);
export const SUPERVISION_TYPE_EAK = getEntityAddressKey(0, PROBATION_PAROLE, TYPE);
export const ATTORNEY_LAST_NAME_EAK = getEntityAddressKey(0, ATTORNEYS, LAST_NAME);
export const ATTORNEY_FIRST_NAME_EAK = getEntityAddressKey(0, ATTORNEYS, FIRST_NAME);
export const ATTORNEY_EMPLOYMENT_EAK = getEntityAddressKey(0, EMPLOYMENT, NAME);
export const ATTORNEY_PHONE_EAK = getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER);
export const ATTORNEY_EMAIL_EAK = getEntityAddressKey(-3, CONTACT_INFO, EMAIL);
export const OFFICER_LAST_NAME_EAK = getEntityAddressKey(0, OFFICERS, LAST_NAME);
export const OFFICER_FIRST_NAME_EAK = getEntityAddressKey(0, OFFICERS, FIRST_NAME);
export const OFFICER_TITLE_EAK = getEntityAddressKey(0, EMPLOYEE, TITLE);
export const OFFICER_PHONE_EAK = getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER);
export const OFFICER_EMAIL_EAK = getEntityAddressKey(-5, CONTACT_INFO, EMAIL);
export const SUPERVISION_END_DATETIME_EAK = getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME);
export const SUPERVISION_LEVEL_EAK = getEntityAddressKey(0, PROBATION_PAROLE, LEVEL);

/*
 * sex offender
 */
export const SEX_OFFENDER_PSK = getPageSectionKey(1, 8);
export const REGISTRATION_EAK = getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG);
export const SEX_OFFENDER_COUNTY_EAK = getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY);
export const SEX_OFFENDER_STATE_EAK = getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE);
export const SEX_OFFENDER_DATETIME_EAK = getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME);
export const SEX_OFFENDER_END_DATETIME_EAK = getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME);

/*
 * court hearings
 */
export const COURT_HEARINGS_PSK = getPageSectionKey(1, 9);
export const HEARING_DATE_EAK = getEntityAddressKey(0, HEARINGS, DATE);
export const HEARING_TYPE_EAK = getEntityAddressKey(0, HEARINGS, TYPE);

/*
 * needs assessment
 */
export const NEEDS_ASSESSMENT_PSK = getPageSectionKey(1, 10);
export const NEEDS_EAK = getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE);
export const NEEDS_ASSESSMENT_NOTES_EAK = getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES);
