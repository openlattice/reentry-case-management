// @flow
import {
  List,
  Map,
  get,
  getIn,
  hasIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { deleteKeyFromFormData, updateFormData } from '../../../utils/FormUtils';
import { isDefined } from '../../../utils/LangUtils';
import { getValuesFromEntityList } from '../../../utils/Utils';
import { PAROLE_PROBATION_CONSTS, PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';
import {
  ATTORNEY_EMAIL_EAK,
  ATTORNEY_EMPLOYMENT_EAK,
  ATTORNEY_FIRST_NAME_EAK,
  ATTORNEY_LAST_NAME_EAK,
  ATTORNEY_PHONE_EAK,
  CELL_PHONE_EAK,
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
  HOME_PHONE_EAK,
  ID_PSK,
  IS_CELL_PHONE_EAK,
  JAILS_PRISONS_EAK,
  JAIL_STAYS_EAK,
  LAST_NAME_EAK,
  MARITAL_AND_EDUCATION_PSK,
  MARITAL_STATUS_EAK,
  MIDDLE_NAME_EAK,
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
  SUPERVISION_END_DATETIME_EAK,
  SUPERVISION_INNER_PSK,
  SUPERVISION_TYPE_EAK,
} from '../IntakeConstants';

const { getEntityAddressKey, parseEntityAddressKey } = DataProcessingUtils;
const {
  APPEARS_IN,
  MANUAL_ASSIGNED_TO,
  ATTORNEYS,
  CONTACTED_VIA,
  CONTACT_INFO,
  COUNTY_ID,
  EDUCATION,
  EMPLOYEE,
  EMPLOYMENT,
  HAS,
  HEARINGS,
  IS,
  IS_REGISTERED_SEX_OFFENDER_IN,
  LOCATION,
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  MANUAL_LOCATED_AT,
  MANUAL_SUBJECT_OF,
  NEEDS_ASSESSMENT,
  OFFICERS,
  PEOPLE,
  PERSON_DETAILS,
  PROBATION_PAROLE,
  REFERRAL_REQUEST,
  REGISTERED_FOR,
  REPORTED,
  REPRESENTED_BY,
  SEX_OFFENDER,
  SEX_OFFENDER_REGISTRATION_LOCATION,
  STATE_ID,
} = APP_TYPE_FQNS;
const {
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  GENERAL_NOTES,
  IS_CELL_PHONE,
  LAST_NAME,
  MIDDLE_NAME,
  NAME,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  RACE,
} = PROPERTY_TYPE_FQNS;
const {
  PAROLE,
  PAROLE_OFFICER,
  PROBATION,
  PROBATION_OFFICER
} = PAROLE_PROBATION_CONSTS;

// Form Utils

const hydrateIncarcerationFacilitiesSchemas = (schema :Object, facilities :List) :Object => {
  const [values, labels] = getValuesFromEntityList(facilities, [NAME]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      RELEASE_PSK,
      'properties',
      JAILS_PRISONS_EAK,
      'enum'
    ],
    values
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      RELEASE_PSK,
      'properties',
      JAILS_PRISONS_EAK,
      'enumNames'
    ],
    labels
  );

  return newSchema;
};

const prepopulateFormData = (selectedPerson :Map, selectedReleaseDate :string) :Object => {
  const formData :Object = {};

  if (isDefined(selectedPerson) && !selectedPerson.isEmpty()) {
    const {
      [DOB]: dobISO,
      [ETHNICITY]: ethnicity,
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName,
      [MIDDLE_NAME]: middleName,
      [RACE]: race,
    } = getEntityProperties(
      selectedPerson,
      [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE],
    );
    formData[PERSON_PSK] = {
      [LAST_NAME_EAK]: lastName,
      [FIRST_NAME_EAK]: firstName,
      [MIDDLE_NAME_EAK]: middleName,
      [DOB_EAK]: DateTime.fromISO(dobISO).toISODate(),
      [RACE_EAK]: race,
      [ETHNICITY_EAK]: ethnicity,
    };
  }

  if (selectedReleaseDate) {
    formData[RELEASE_PSK] = {
      [JAIL_STAYS_EAK]: selectedReleaseDate
    };
  }
  return formData;
};

// Entities Utils

const getClientContactInfoCount = (formData :Object) :number => {

  const contactSection :Object = get(formData, CONTACT_INFO_PSK);
  const contactInfoKeysOnly :string[] = Object.keys(contactSection).filter((entityAddressKey :string) => {

    const { entitySetName, propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
    const propertyIsAboutPreferred :boolean = propertyTypeFQN.toString() === PREFERRED.toString()
      || propertyTypeFQN.toString() === PREFERRED_METHOD_OF_CONTACT.toString()
      || propertyTypeFQN.toString() === GENERAL_NOTES.toString()
      || propertyTypeFQN.toString() === IS_CELL_PHONE.toString();

    return entitySetName === CONTACT_INFO.toString()
      && isDefined(get(contactSection, entityAddressKey))
      && !propertyIsAboutPreferred;
  });
  return contactInfoKeysOnly.length;
};

const setClientContactInfoIndices = (formData :Object) :Object => {
  let updatedFormData = formData;
  const contactInfoCount :number = getClientContactInfoCount(formData);
  if (!contactInfoCount) return updatedFormData;

  const currentHomePhonePath :string[] = [CONTACT_INFO_PSK, HOME_PHONE_EAK];
  const homePhoneNumber = getIn(formData, [CONTACT_INFO_PSK, HOME_PHONE_EAK]);
  const currentCellPath :string[] = [CONTACT_INFO_PSK, CELL_PHONE_EAK];
  const cellPhoneNumber = getIn(formData, [CONTACT_INFO_PSK, CELL_PHONE_EAK]);
  const currentEmailPath :string[] = [CONTACT_INFO_PSK, EMAIL_EAK];
  const email = getIn(formData, [CONTACT_INFO_PSK, EMAIL_EAK]);

  if (contactInfoCount === 3 || (isDefined(homePhoneNumber) && isDefined(cellPhoneNumber))) {
    updatedFormData = updateFormData(
      updatedFormData,
      [CONTACT_INFO_PSK, IS_CELL_PHONE_EAK],
      true
    );
  }
  else if (contactInfoCount === 2) {
    if (!isDefined(homePhoneNumber) || !isDefined(cellPhoneNumber)) {
      updatedFormData = deleteKeyFromFormData(updatedFormData, currentEmailPath);
      updatedFormData = updateFormData(
        updatedFormData,
        [CONTACT_INFO_PSK, getEntityAddressKey(1, CONTACT_INFO, EMAIL)],
        email
      );

      if (isDefined(cellPhoneNumber)) {
        updatedFormData = deleteKeyFromFormData(updatedFormData, currentCellPath);
        updatedFormData = updateFormData(
          updatedFormData,
          [CONTACT_INFO_PSK, HOME_PHONE_EAK],
          cellPhoneNumber
        );
        updatedFormData = updateFormData(
          updatedFormData,
          [CONTACT_INFO_PSK, getEntityAddressKey(0, CONTACT_INFO, IS_CELL_PHONE)],
          true
        );
      }
    }
    if (!isDefined(email)) {
      updatedFormData = deleteKeyFromFormData(updatedFormData, currentEmailPath);
    }
  }
  else if (contactInfoCount === 1) {
    const contactInfoValues = [homePhoneNumber, cellPhoneNumber, email];
    const indexToKeep = contactInfoValues.findIndex((listValue) => isDefined(listValue));
    if (indexToKeep === 1) {
      updatedFormData = updateFormData(
        updatedFormData,
        [CONTACT_INFO_PSK, HOME_PHONE_EAK],
        cellPhoneNumber
      );
      updatedFormData = updateFormData(
        updatedFormData,
        [CONTACT_INFO_PSK, getEntityAddressKey(0, CONTACT_INFO, IS_CELL_PHONE)],
        true
      );
    }
    if (indexToKeep === 2) {
      updatedFormData = updateFormData(
        updatedFormData,
        [CONTACT_INFO_PSK, getEntityAddressKey(0, CONTACT_INFO, EMAIL)],
        email
      );
      updatedFormData = deleteKeyFromFormData(updatedFormData, currentHomePhonePath);
    }
    updatedFormData = deleteKeyFromFormData(updatedFormData, currentCellPath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, currentEmailPath);
  }

  return updatedFormData;
};

const setPreferredMethodOfContact = (formData :Object) :Object => {

  const preferredMethodOfContactPath :string[] = [CONTACT_INFO_PSK, PREFERRED_METHOD_EAK];
  const preferredMethodOfContactValue :string = getIn(formData, preferredMethodOfContactPath);
  const contactInfoCount :number = getClientContactInfoCount(formData);

  if (!isDefined(formData)
    || !hasIn(formData, preferredMethodOfContactPath)
    || !PREFERRED_COMMUNICATION_METHODS.includes(preferredMethodOfContactValue)) {
    return formData;
  }

  let updatedFormData = formData;
  updatedFormData = deleteKeyFromFormData(updatedFormData, preferredMethodOfContactPath);
  if (!contactInfoCount) return updatedFormData;

  const contactInfoSection = get(formData, CONTACT_INFO_PSK);
  let indexToSet;
  if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[1]
    || preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[2]) {
    const cellPhoneProperty = Object.keys(contactInfoSection).find((entityAddressKey :string) => {
      const { propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      return propertyTypeFQN.toString() === IS_CELL_PHONE.toString();
    });
    if (isDefined(cellPhoneProperty)) {
      const { entityIndex } = parseEntityAddressKey(cellPhoneProperty);
      indexToSet = entityIndex;
    }
  }
  else if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[3]) {
    const emailProperty :string[] = Object.keys(contactInfoSection).filter((entityAddressKey :string) => {
      const { propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      return propertyTypeFQN.toString() === EMAIL.toString();
    });
    if (isDefined(emailProperty)) {
      const [emailEntityKeyAddress] = emailProperty;
      const { entityIndex } = parseEntityAddressKey(emailEntityKeyAddress);
      indexToSet = entityIndex;
    }
  }
  else if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[0]) {
    indexToSet = 0;
  }

  if (isDefined(indexToSet)) {
    updatedFormData = updateFormData(
      updatedFormData,
      [CONTACT_INFO_PSK, getEntityAddressKey(indexToSet, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)],
      preferredMethodOfContactValue
    );
    updatedFormData = updateFormData(
      updatedFormData,
      [CONTACT_INFO_PSK, getEntityAddressKey(indexToSet, CONTACT_INFO, PREFERRED)],
      true
    );
  }

  return updatedFormData;
};

const setPreferredTimeOfContact = (formData :Object) :Object => {

  const preferredTimeOfContactPath :string[] = [CONTACT_INFO_PSK, PREFERRED_TIME_EAK];
  const preferredTimeOfContactValue :string = getIn(formData, preferredTimeOfContactPath);
  const contactInfoCount :number = getClientContactInfoCount(formData);

  let updatedFormData = formData;
  updatedFormData = deleteKeyFromFormData(updatedFormData, preferredTimeOfContactPath);
  if (!contactInfoCount) return updatedFormData;
  let contactIndex :number = 0;
  while (contactIndex < contactInfoCount) {
    updatedFormData = updateFormData(
      updatedFormData,
      [CONTACT_INFO_PSK, getEntityAddressKey(contactIndex, CONTACT_INFO, GENERAL_NOTES)],
      preferredTimeOfContactValue
    );
    contactIndex += 1;
  }

  return updatedFormData;
};

const resetKey = (
  formData :Object,
  existingPath :string[],
  newIndex :number,
  fqns :Object
) :Object => {

  let updatedFormData = formData;
  const value :any = getIn(updatedFormData, existingPath);
  updatedFormData = deleteKeyFromFormData(updatedFormData, existingPath);
  const { appTypeFqn, propertyTypeFQN } = fqns;
  const existingPathWithoutOldKey :string[] = existingPath.slice(0, existingPath.length - 1);
  updatedFormData = updateFormData(
    updatedFormData,
    existingPathWithoutOldKey.concat(getEntityAddressKey(newIndex, appTypeFqn, propertyTypeFQN)),
    value
  );
  return updatedFormData;
};

const setProbationOrParoleValues = (formData :Object) :Object => {

  let updatedFormData :Object = formData;
  const probationParolePath :string[] = [RELEASE_PSK, SUPERVISION_INNER_PSK];
  const probationOrParoleData :Object = getIn(formData, probationParolePath, {});
  const keys :string[] = Object.keys(probationOrParoleData);

  updatedFormData = deleteKeyFromFormData(updatedFormData, [RELEASE_PSK, 'onProbationOrParole']);

  if ((keys.length === 2 && keys.includes(ATTORNEY_EMPLOYMENT_EAK) && keys.includes(OFFICER_TITLE_EAK))
    || !keys.length) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([ATTORNEY_EMPLOYMENT_EAK]));
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([OFFICER_TITLE_EAK]));
    return updatedFormData;
  }

  if (!isDefined(get(probationOrParoleData, ATTORNEY_LAST_NAME_EAK))
    || !isDefined(get(probationOrParoleData, ATTORNEY_FIRST_NAME_EAK))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([ATTORNEY_EMPLOYMENT_EAK]));
  }

  const officerIsNotDefined :boolean = !isDefined(get(probationOrParoleData, ATTORNEY_FIRST_NAME_EAK))
    && !isDefined(get(probationOrParoleData, OFFICER_FIRST_NAME_EAK));
  if (officerIsNotDefined) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([OFFICER_TITLE_EAK]));
    return updatedFormData;
  }

  if (get(probationOrParoleData, SUPERVISION_TYPE_EAK) === PROBATION
    && !officerIsNotDefined) {
    updatedFormData = updateFormData(
      updatedFormData,
      probationParolePath.concat([OFFICER_TITLE_EAK]),
      PROBATION_OFFICER
    );
  }
  if (get(probationOrParoleData, SUPERVISION_TYPE_EAK) === PAROLE
    && !officerIsNotDefined) {
    updatedFormData = updateFormData(
      updatedFormData,
      probationParolePath.concat([OFFICER_TITLE_EAK]),
      PAROLE_OFFICER
    );
  }
  return updatedFormData;
};

// fabricate's index mappers don't work for these, because these values are not in arrays
const setContactIndices = (formData :Object) :Map => {

  const outerPageSectionKey :string = RELEASE_PSK;
  const innerPageSectionKey :string = SUPERVISION_INNER_PSK;

  const clientContactEntitiesCount :number = getClientContactInfoCount(formData);
  const countAfterAttorneyPhone :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, ATTORNEY_PHONE_EAK])
  )
    ? clientContactEntitiesCount + 1 : clientContactEntitiesCount;
  const countAfterAttorneyEmail :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, ATTORNEY_EMAIL_EAK])
  )
    ? countAfterAttorneyPhone + 1 : countAfterAttorneyPhone;
  const countAfterOfficerPhone :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, OFFICER_PHONE_EAK])
  )
    ? countAfterAttorneyEmail + 1 : countAfterAttorneyEmail;
  const countAfterOfficerEmail :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, OFFICER_EMAIL_EAK])
  )
    ? countAfterOfficerPhone + 1 : countAfterOfficerPhone;

  let updatedFormData = formData;
  if (clientContactEntitiesCount === countAfterAttorneyPhone && countAfterAttorneyPhone === countAfterAttorneyEmail
    && countAfterAttorneyEmail === countAfterOfficerPhone && countAfterOfficerPhone === countAfterOfficerEmail) {
    return updatedFormData;
  }

  if (countAfterAttorneyPhone > clientContactEntitiesCount) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, ATTORNEY_PHONE_EAK],
      countAfterAttorneyPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterAttorneyEmail > countAfterAttorneyPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, ATTORNEY_EMAIL_EAK],
      countAfterAttorneyEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  if (countAfterOfficerPhone > countAfterAttorneyEmail) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, OFFICER_PHONE_EAK],
      countAfterOfficerPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterOfficerEmail > countAfterOfficerPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, OFFICER_EMAIL_EAK],
      countAfterOfficerEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  return updatedFormData;
};

const setDatesAsDateTimes = (formData :Object) :Object => {

  let updatedFormData = formData;
  const currentTime :string = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);

  const needsAssessmentDatePath :string[] = [ENROLLMENT_DATE_PSK, ENROLLMENT_DATE_EAK];
  const needsAssessmentDate :?string = getIn(formData, needsAssessmentDatePath);

  const releaseDatePath :string[] = [RELEASE_PSK, JAIL_STAYS_EAK];
  const releaseDate :?string = getIn(formData, releaseDatePath);
  const recognizedEndDatePath :string[] = [RELEASE_PSK, SUPERVISION_INNER_PSK, SUPERVISION_END_DATETIME_EAK];
  const recgonizedDate :?string = getIn(formData, recognizedEndDatePath);

  if (isDefined(needsAssessmentDate)) {
    const datetimeISO :string = DateTime.fromSQL(needsAssessmentDate.concat(' ', currentTime)).toISO();
    updatedFormData = updateFormData(updatedFormData, needsAssessmentDatePath, datetimeISO);
  }
  if (isDefined(releaseDate)) {
    const datetimeISO :string = DateTime.fromSQL(releaseDate.concat(' ', currentTime)).toISO();
    updatedFormData = updateFormData(updatedFormData, releaseDatePath, datetimeISO);
  }
  if (isDefined(recgonizedDate)) {
    const datetimeISO :string = DateTime.fromSQL(recgonizedDate.concat(' ', currentTime)).toISO();
    updatedFormData = updateFormData(updatedFormData, recognizedEndDatePath, datetimeISO);
  }
  return updatedFormData;
};

const setRegisteredSexOffender = (formData :Object) :Object => {

  let updatedFormData = formData;
  const currentTime :string = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
  const isSexOffenderPath :string[] = [SEX_OFFENDER_PSK, REGISTRATION_EAK];
  const isSexOffenderValue :any = getIn(formData, isSexOffenderPath);
  const registeredCountyPath :string[] = [SEX_OFFENDER_PSK, SEX_OFFENDER_COUNTY_EAK];
  const registeredStatePath :string[] = [SEX_OFFENDER_PSK, SEX_OFFENDER_STATE_EAK];
  const registeredDatePath :string[] = [SEX_OFFENDER_PSK, SEX_OFFENDER_DATETIME_EAK];
  const registryEndDatePath :string[] = [SEX_OFFENDER_PSK, SEX_OFFENDER_END_DATETIME_EAK];

  if (isDefined(isSexOffenderValue) && isSexOffenderValue) {
    const registeredDate :any = getIn(formData, registeredDatePath);
    if (isDefined(registeredDate)) {
      const datetimeISO :string = DateTime.fromSQL(registeredDate.concat(' ', currentTime)).toISO();
      updatedFormData = updateFormData(updatedFormData, registeredDatePath, datetimeISO);
    }
    const registryEndDate :any = getIn(formData, registryEndDatePath);
    if (isDefined(registryEndDate)) {
      const datetimeISO :string = DateTime.fromSQL(registryEndDate.concat(' ', currentTime)).toISO();
      updatedFormData = updateFormData(updatedFormData, registryEndDatePath, datetimeISO);
    }
  }
  if ((isDefined(isSexOffenderValue) && !isSexOffenderValue) || !isDefined(isSexOffenderPath)) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredCountyPath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredStatePath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredDatePath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, registryEndDatePath);
  }
  return updatedFormData;
};

// Associations Utils

const getClientDetailsAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const personGender :any = getIn(formData, [PERSON_PSK, GENDER_EAK]);
  const maritalStatus :any = getIn(formData, [MARITAL_AND_EDUCATION_PSK, MARITAL_STATUS_EAK]);
  if (!isDefined(personGender) && !isDefined(maritalStatus)) return associations;

  associations.push([HAS, 0, PEOPLE, 0, PERSON_DETAILS, {}]);
  return associations;
};

const getClientContactAndAddressAssociations = (formData :Object) :Array<Array<*>> => {

  const associations = [];
  const contactsAndAddress :Object = get(formData, CONTACT_INFO_PSK);
  if (!Object.values(contactsAndAddress).length) return associations;

  const contactInfoCount :number = getClientContactInfoCount(formData);
  if (contactInfoCount) {
    for (let i = 0; i < contactInfoCount; i += 1) {
      associations.push([CONTACTED_VIA, 0, PEOPLE, i, CONTACT_INFO, {}]);
    }
  }

  const address :any = Object.keys(contactsAndAddress).find((entityAddressKey :string) => {
    const { entitySetName } = parseEntityAddressKey(entityAddressKey);
    return entitySetName === LOCATION.toString() && isDefined(get(contactsAndAddress, entityAddressKey));
  });
  if (isDefined(address)) associations.push([MANUAL_LOCATED_AT, 0, PEOPLE, 0, LOCATION, {}]);

  return associations;
};

const getClientEducationAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const educationLevel :any = getIn(formData, [MARITAL_AND_EDUCATION_PSK, EDUCATION_EAK]);
  if (!isDefined(educationLevel)) return associations;
  associations.push([HAS, 0, PEOPLE, 0, EDUCATION, {}]);
  return associations;
};

const getClientSexOffenderAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const isSexOffenderValue :any = getIn(formData, [SEX_OFFENDER_PSK, REGISTRATION_EAK]);
  if (!isDefined(isSexOffenderValue)) return associations;

  associations.push([REPORTED, 0, PEOPLE, 0, SEX_OFFENDER, {}]);
  const sexOffenderSection :Object = get(formData, SEX_OFFENDER_PSK);
  const countyKey = Object.keys(sexOffenderSection).find((key :string) => {
    const { entitySetName } = parseEntityAddressKey(key);
    return entitySetName === SEX_OFFENDER_REGISTRATION_LOCATION.toString();
  });
  if (isDefined(countyKey)) {
    const { entityIndex } = parseEntityAddressKey(countyKey);
    associations.push([REGISTERED_FOR, 0, SEX_OFFENDER, entityIndex, SEX_OFFENDER_REGISTRATION_LOCATION, {}]);
    associations.push([IS_REGISTERED_SEX_OFFENDER_IN, 0, PEOPLE, entityIndex, SEX_OFFENDER_REGISTRATION_LOCATION, {}]);
  }
  return associations;
};

const getClientReleaseAssociations = (formData :Object) => {
  const associations = [];
  const outerPageSectionKey :string = RELEASE_PSK;
  const innerPageSectionKey :string = SUPERVISION_INNER_PSK;

  const incarcerationFacilityEKID :any = getIn(formData, [outerPageSectionKey, JAILS_PRISONS_EAK]);
  const referredFrom :any = getIn(formData, [outerPageSectionKey, REFERRAL_EAK]);

  associations.push([MANUAL_SUBJECT_OF, 0, PEOPLE, 0, MANUAL_JAIL_STAYS, {}]);

  if (isDefined(incarcerationFacilityEKID) && incarcerationFacilityEKID.length) {
    associations.push([MANUAL_LOCATED_AT, 0, MANUAL_JAIL_STAYS, incarcerationFacilityEKID, MANUAL_JAILS_PRISONS, {}]);
  }
  if (isDefined(referredFrom)) {
    associations.push([MANUAL_SUBJECT_OF, 0, PEOPLE, 0, REFERRAL_REQUEST, {}]);
  }

  const probationData = getIn(formData, [outerPageSectionKey, innerPageSectionKey]);
  if (!isDefined(probationData) || Object.values(probationData).every((value :any) => !isDefined(value))) {
    return associations;
  }

  /*
    person (client) -> represented by -> employment/occupation (attorney)
    person (attorney) -> has -> employment/occupation (attorney)
  */
  const attorneyFilledOutInForm :boolean = isDefined(get(probationData, ATTORNEY_LAST_NAME_EAK))
    || isDefined(get((probationData, ATTORNEY_FIRST_NAME_EAK)));

  // Attorney
  if (attorneyFilledOutInForm) {
    associations.push([REPRESENTED_BY, 0, PEOPLE, 0, EMPLOYMENT, {}]);
    associations.push([REPRESENTED_BY, 0, PEOPLE, 0, ATTORNEYS, {}]);
    associations.push([HAS, 0, ATTORNEYS, 0, EMPLOYMENT, {}]);
  }

  /*
    parole officer (employee) -> assigned to -> person (client)
    person (parole officer) -> is -> employee (parole officer)
  */

  // Probation/Parole Officer
  const officerFilledOutInForm = isDefined(get(probationData, OFFICER_LAST_NAME_EAK))
    || isDefined(get((probationData, OFFICER_FIRST_NAME_EAK)));
  if (officerFilledOutInForm) {
    associations.push([MANUAL_ASSIGNED_TO, 0, EMPLOYEE, 0, PEOPLE, {}]);
    associations.push([IS, 0, OFFICERS, 0, EMPLOYEE, {}]);
  }

  /*
    person (client) -> assigned to -> parole
    parole officer (employee) + person (parole officer) -> assigned to -> parole
  */

  // Probation/Parole
  if (isDefined(get(probationData, SUPERVISION_TYPE_EAK))) {
    associations.push([MANUAL_ASSIGNED_TO, 0, PEOPLE, 0, PROBATION_PAROLE, {}]);
    if (officerFilledOutInForm) {
      associations.push([MANUAL_ASSIGNED_TO, 0, EMPLOYEE, 0, PROBATION_PAROLE, {}]);
      associations.push([MANUAL_ASSIGNED_TO, 0, OFFICERS, 0, PROBATION_PAROLE, {}]);
    }
  }

  return associations;
};

const getOfficerAndAttorneyContactAssociations = (
  originalFormData :Object,
  updatedFormData :Object
) :Array<Array<*>> => {

  const associations :Array<Array<*>> = [];
  let clientContactInfoCount :number = getClientContactInfoCount(originalFormData);
  const probationPath :string[] = [RELEASE_PSK, SUPERVISION_INNER_PSK];
  const originalProbationData :Object = getIn(originalFormData, probationPath);

  const attorneyIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([ATTORNEY_EMPLOYMENT_EAK])
  ));
  if (attorneyIsDefined) {
    if (isDefined(get(originalProbationData, ATTORNEY_PHONE_EAK))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, ATTORNEY_EMAIL_EAK))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  const officerIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([OFFICER_TITLE_EAK])
  ));
  if (officerIsDefined) {
    if (isDefined(get(originalProbationData, OFFICER_PHONE_EAK))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, OFFICER_EMAIL_EAK))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  return associations;
};

const getClientHearingAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const hearing = get(formData, COURT_HEARINGS_PSK);
  if (!Object.values(hearing).length) return associations;

  associations.push([APPEARS_IN, 0, PEOPLE, 0, HEARINGS, {}]);
  return associations;
};

const getNeedsAssessmentAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  if (isDefined(formData)) {
    associations.push([MANUAL_SUBJECT_OF, 0, PEOPLE, 0, NEEDS_ASSESSMENT, {}]);
  }
  return associations;
};

const getIDAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const ids = get(formData, ID_PSK);
  if (!isDefined(ids) || !Object.values(ids).length) return associations;
  if (isDefined(get(ids, STATE_ID_EAK))) {
    associations.push([HAS, 0, PEOPLE, 0, STATE_ID, {}]);
  }
  if (isDefined(get(ids, COUNTY_ID_EAK))) {
    associations.push([HAS, 0, PEOPLE, 0, COUNTY_ID, {}]);
  }
  return associations;
};

export {
  getClientContactAndAddressAssociations,
  getClientContactInfoCount,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  getClientSexOffenderAssociations,
  getIDAssociations,
  getNeedsAssessmentAssociations,
  getOfficerAndAttorneyContactAssociations,
  hydrateIncarcerationFacilitiesSchemas,
  prepopulateFormData,
  setClientContactInfoIndices,
  setContactIndices,
  setDatesAsDateTimes,
  setPreferredMethodOfContact,
  setPreferredTimeOfContact,
  setProbationOrParoleValues,
  setRegisteredSexOffender,
};
