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

const { getEntityAddressKey, getPageSectionKey, parseEntityAddressKey } = DataProcessingUtils;
const {
  APPEARS_IN,
  MANUAL_ASSIGNED_TO,
  ATTORNEYS,
  CONTACTED_VIA,
  CONTACT_INFO,
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
  COUNTY,
  DATETIME_COMPLETED,
  DOB,
  EMAIL,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  GENERAL_NOTES,
  HIGHEST_EDUCATION_LEVEL,
  IS_CELL_PHONE,
  LAST_NAME,
  MARITAL_STATUS,
  MIDDLE_NAME,
  NAME,
  OL_DATETIME,
  OL_ID_FQN,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  PROJECTED_RELEASE_DATETIME,
  RACE,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  SOURCE,
  TITLE,
  TYPE,
  US_STATE,
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
      getPageSectionKey(1, 5),
      'properties',
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
      'enum'
    ],
    values
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 5),
      'properties',
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
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
    formData[getPageSectionKey(1, 1)] = {
      [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: lastName,
      [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: firstName,
      [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: middleName,
      [getEntityAddressKey(0, PEOPLE, DOB)]: DateTime.fromISO(dobISO).toISODate(),
      [getEntityAddressKey(0, PEOPLE, RACE)]: race,
      [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: ethnicity,
    };
  }

  if (selectedReleaseDate) {
    formData[getPageSectionKey(1, 5)] = {
      [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: selectedReleaseDate
    };
  }
  return formData;
};

// Entities Utils

const getClientContactInfoCount = (formData :Object) :number => {

  const contactSection :Object = get(formData, getPageSectionKey(1, 4));
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
  const pageSectionKey :string = getPageSectionKey(1, 4);
  const contactInfoCount :number = getClientContactInfoCount(formData);
  if (!contactInfoCount) return updatedFormData;

  const currentHomePhonePath :string[] = [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)];
  const homePhoneNumber = getIn(formData, [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]);
  const currentCellPath :string[] = [pageSectionKey, getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)];
  const cellPhoneNumber = getIn(formData, [pageSectionKey, getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)]);
  const currentEmailPath :string[] = [pageSectionKey, getEntityAddressKey(2, CONTACT_INFO, EMAIL)];
  const email = getIn(formData, [pageSectionKey, getEntityAddressKey(2, CONTACT_INFO, EMAIL)]);

  if (contactInfoCount === 3 || (isDefined(homePhoneNumber) && isDefined(cellPhoneNumber))) {
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, getEntityAddressKey(1, CONTACT_INFO, IS_CELL_PHONE)],
      true
    );
  }
  else if (contactInfoCount === 2) {
    if (!isDefined(homePhoneNumber) || !isDefined(cellPhoneNumber)) {
      updatedFormData = deleteKeyFromFormData(updatedFormData, currentEmailPath);
      updatedFormData = updateFormData(
        updatedFormData,
        [pageSectionKey, getEntityAddressKey(1, CONTACT_INFO, EMAIL)],
        email
      );

      if (isDefined(cellPhoneNumber)) {
        updatedFormData = deleteKeyFromFormData(updatedFormData, currentCellPath);
        updatedFormData = updateFormData(
          updatedFormData,
          [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)],
          cellPhoneNumber
        );
        updatedFormData = updateFormData(
          updatedFormData,
          [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, IS_CELL_PHONE)],
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
        [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)],
        cellPhoneNumber
      );
      updatedFormData = updateFormData(
        updatedFormData,
        [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, IS_CELL_PHONE)],
        true
      );
    }
    if (indexToKeep === 2) {
      updatedFormData = updateFormData(
        updatedFormData,
        [pageSectionKey, getEntityAddressKey(0, CONTACT_INFO, EMAIL)],
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

  const preferredMethodOfContactKey :string = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
  const pageSectionKey :string = getPageSectionKey(1, 4);
  const preferredMethodOfContactPath :string[] = [pageSectionKey, preferredMethodOfContactKey];
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

  const contactInfoSection = get(formData, pageSectionKey);
  let indexToSet;
  if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[1]
    || preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[2]) {
    const cellPhoneProperty = Object.keys(contactInfoSection).find((entityAddressKey :string) => {
      const { propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      return propertyTypeFQN.toString() === IS_CELL_PHONE.toString();
    });
    const { entityIndex } = parseEntityAddressKey(cellPhoneProperty);
    indexToSet = entityIndex;
  }
  else if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[3]) {
    const emailProperty :string[] = Object.keys(contactInfoSection).filter((entityAddressKey :string) => {
      const { propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      return propertyTypeFQN.toString() === EMAIL.toString();
    });
    const [emailEntityKeyAddress] = emailProperty;
    const { entityIndex } = parseEntityAddressKey(emailEntityKeyAddress);
    indexToSet = entityIndex;
  }
  else {
    indexToSet = 0;
  }

  if (isDefined(indexToSet)) {
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, getEntityAddressKey(indexToSet, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)],
      preferredMethodOfContactValue
    );
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, getEntityAddressKey(indexToSet, CONTACT_INFO, PREFERRED)],
      true
    );
  }

  return updatedFormData;
};

const setPreferredTimeOfContact = (formData :Object) :Object => {

  const preferredTimeOfContactKey :string = getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES);
  const pageSectionKey :string = getPageSectionKey(1, 4);
  const preferredTimeOfContactPath :string[] = [pageSectionKey, preferredTimeOfContactKey];
  const preferredTimeOfContactValue :string = getIn(formData, preferredTimeOfContactPath);
  const contactInfoCount :number = getClientContactInfoCount(formData);

  let updatedFormData = formData;
  updatedFormData = deleteKeyFromFormData(updatedFormData, preferredTimeOfContactPath);
  if (!contactInfoCount) return updatedFormData;
  let contactIndex :number = 0;
  while (contactIndex < contactInfoCount) {
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, getEntityAddressKey(contactIndex, CONTACT_INFO, GENERAL_NOTES)],
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
  const probationParolePath :string[] = [getPageSectionKey(1, 5), getPageSectionKey(1, 6)];
  const probationOrParoleData :Object = getIn(formData, probationParolePath, {});
  const attorneyEmploymentKey :string = getEntityAddressKey(0, EMPLOYMENT, NAME);
  const officerEmployeeKey :string = getEntityAddressKey(0, EMPLOYEE, TITLE);
  const keys :string[] = Object.keys(probationOrParoleData);

  updatedFormData = deleteKeyFromFormData(updatedFormData, [getPageSectionKey(1, 5), 'onProbationOrParole']);

  if ((keys.length === 2 && keys.includes(attorneyEmploymentKey) && keys.includes(officerEmployeeKey))
    || !keys.length) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyEmploymentKey]));
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerEmployeeKey]));
    return updatedFormData;
  }

  const attorneyLastNameKey :string = getEntityAddressKey(0, ATTORNEYS, LAST_NAME);
  const attorneyFirstNameKey :string = getEntityAddressKey(0, ATTORNEYS, FIRST_NAME);
  if (!isDefined(get(probationOrParoleData, attorneyLastNameKey))
    || !isDefined(get(probationOrParoleData, attorneyFirstNameKey))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyEmploymentKey]));
  }

  const officerLastNameKey :string = getEntityAddressKey(0, OFFICERS, LAST_NAME);
  const officerFirstNameKey :string = getEntityAddressKey(0, OFFICERS, FIRST_NAME);
  const officerIsNotDefined :boolean = !isDefined(get(probationOrParoleData, officerLastNameKey))
    && !isDefined(get(probationOrParoleData, officerFirstNameKey));

  if (officerIsNotDefined) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerEmployeeKey]));
    return updatedFormData;
  }

  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === PROBATION
    && !officerIsNotDefined) {
    updatedFormData = updateFormData(
      updatedFormData,
      probationParolePath.concat([officerEmployeeKey]),
      PROBATION_OFFICER
    );
  }
  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === PAROLE
    && !officerIsNotDefined) {
    updatedFormData = updateFormData(
      updatedFormData,
      probationParolePath.concat([officerEmployeeKey]),
      PAROLE_OFFICER
    );
  }
  return updatedFormData;
};

// fabricate's index mappers don't work for these, because these values are not in arrays
const setContactIndices = (formData :Object) :Map => {

  const outerPageSectionKey :string = getPageSectionKey(1, 5);
  const innerPageSectionKey :string = getPageSectionKey(1, 6);
  const attorneyPhoneKey :string = getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER);
  const attorneyEmailKey :string = getEntityAddressKey(-3, CONTACT_INFO, EMAIL);
  const officerPhoneKey :string = getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER);
  const officerEmailKey :string = getEntityAddressKey(-5, CONTACT_INFO, EMAIL);

  const clientContactEntitiesCount :number = getClientContactInfoCount(formData);
  const countAfterAttorneyPhone :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, attorneyPhoneKey])
  )
    ? clientContactEntitiesCount + 1 : clientContactEntitiesCount;
  const countAfterAttorneyEmail :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, attorneyEmailKey])
  )
    ? countAfterAttorneyPhone + 1 : countAfterAttorneyPhone;
  const countAfterOfficerPhone :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, officerPhoneKey])
  )
    ? countAfterAttorneyEmail + 1 : countAfterAttorneyEmail;
  const countAfterOfficerEmail :number = isDefined(
    getIn(formData, [outerPageSectionKey, innerPageSectionKey, officerEmailKey])
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
      [outerPageSectionKey, innerPageSectionKey, attorneyPhoneKey],
      countAfterAttorneyPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterAttorneyEmail > countAfterAttorneyPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, attorneyEmailKey],
      countAfterAttorneyEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  if (countAfterOfficerPhone > countAfterAttorneyEmail) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, officerPhoneKey],
      countAfterOfficerPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterOfficerEmail > countAfterOfficerPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [outerPageSectionKey, innerPageSectionKey, officerEmailKey],
      countAfterOfficerEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  return updatedFormData;
};

const setDatesAsDateTimes = (formData :Object) :Object => {

  let updatedFormData = formData;
  const currentTime :string = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);

  const needsAssessmentDatePath :string[] = [
    getPageSectionKey(1, 1),
    getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)
  ];
  const needsAssessmentDate :any = getIn(formData, needsAssessmentDatePath);

  const releaseDatePath :string[] = [
    getPageSectionKey(1, 5),
    getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)
  ];
  const releaseDate :any = getIn(formData, releaseDatePath);
  const recognizedEndDatePath :string[] = [
    getPageSectionKey(1, 5),
    getPageSectionKey(1, 6),
    getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)
  ];
  const recgonizedDate :any = getIn(formData, recognizedEndDatePath);

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

  const pageSectionKey = getPageSectionKey(1, 7);
  const isSexOffenderPath :string[] = [pageSectionKey, getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)];
  const isSexOffenderValue :any = getIn(formData, isSexOffenderPath);
  const registeredCountyPath :string[] = [
    pageSectionKey,
    getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)
  ];
  const registeredStatePath :string[] = [
    pageSectionKey,
    getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)
  ];
  const registeredDatePath :string[] = [pageSectionKey, getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)];
  const registryEndDatePath :string[] = [
    pageSectionKey,
    getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME)
  ];

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
  const personGender :any = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PERSON_DETAILS, GENDER)]);
  const maritalStatus :any = getIn(
    formData,
    [getPageSectionKey(1, 3), getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]
  );
  if (!isDefined(personGender) && !isDefined(maritalStatus)) return associations;

  associations.push([HAS, 0, PEOPLE, 0, PERSON_DETAILS, {}]);
  return associations;
};

const getClientContactAndAddressAssociations = (formData :Object) :Array<Array<*>> => {

  const associations = [];
  const contactsAndAddress :Object = get(formData, getPageSectionKey(1, 4));
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
  const educationLevel :any = getIn(
    formData,
    [getPageSectionKey(1, 3), getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]
  );
  if (!isDefined(educationLevel)) return associations;
  associations.push([HAS, 0, PEOPLE, 0, EDUCATION, {}]);
  return associations;
};

const getClientSexOffenderAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const pageSectionKey = getPageSectionKey(1, 7);
  const isSexOffenderValue :any = getIn(
    formData,
    [pageSectionKey, getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]
  );
  if (!isDefined(isSexOffenderValue)) return associations;

  associations.push([REPORTED, 0, PEOPLE, 0, SEX_OFFENDER, {}]);
  const sexOffenderSection :Object = get(formData, pageSectionKey);
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
  const outerPageSectionKey :string = getPageSectionKey(1, 5);
  const innerPageSectionKey :string = getPageSectionKey(1, 6);
  const releaseDate :any = getIn(
    formData,
    [outerPageSectionKey, getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]
  );
  const incarcerationFacilityEKID :any = getIn(
    formData,
    [outerPageSectionKey, getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]
  );
  const referredFrom :any = getIn(
    formData,
    [outerPageSectionKey, getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]
  );

  if (isDefined(releaseDate)) {
    associations.push([MANUAL_SUBJECT_OF, 0, PEOPLE, 0, MANUAL_JAIL_STAYS, {}]);
  }
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
  const attorneyFilledOutInForm :boolean = isDefined(get(probationData, getEntityAddressKey(0, ATTORNEYS, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(0, ATTORNEYS, FIRST_NAME))));

  // Attorney
  if (attorneyFilledOutInForm) {
    associations.push([REPRESENTED_BY, 0, PEOPLE, 0, EMPLOYMENT, {}]);
    associations.push([HAS, 0, ATTORNEYS, 0, EMPLOYMENT, {}]);
  }

  /*
    parole officer (employee) -> assigned to -> person (client)
    person (parole officer) -> is -> employee (parole officer)
  */

  // Probation/Parole Officer
  const officerFilledOutInForm = isDefined(get(probationData, getEntityAddressKey(0, OFFICERS, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(0, OFFICERS, FIRST_NAME))));
  if (officerFilledOutInForm) {
    associations.push([MANUAL_ASSIGNED_TO, 0, EMPLOYEE, 0, PEOPLE, {}]);
    associations.push([IS, 0, OFFICERS, 0, EMPLOYEE, {}]);
  }

  /*
    person (client) -> assigned to -> parole
    parole officer (employee) + person (parole officer) -> assigned to -> parole
  */

  // Probation/Parole
  if (isDefined(get(probationData, getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)))) {
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
  const probationPath :string[] = [getPageSectionKey(1, 5), getPageSectionKey(1, 6)];
  const originalProbationData :Object = getIn(originalFormData, probationPath);

  const attorneyIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([getEntityAddressKey(0, EMPLOYMENT, NAME)])
  ));
  if (attorneyIsDefined) {
    if (isDefined(get(originalProbationData, getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, getEntityAddressKey(-3, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  const officerIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([getEntityAddressKey(0, EMPLOYEE, TITLE)])
  ));
  if (officerIsDefined) {
    if (isDefined(get(originalProbationData, getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, getEntityAddressKey(-5, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  return associations;
};

const getClientHearingAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const hearing = get(formData, getPageSectionKey(1, 8));
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

const getStateIDAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const ids = get(formData, getPageSectionKey(1, 2));
  if (!isDefined(ids) || !Object.values(ids).length) return associations;
  if (isDefined(get(ids, getEntityAddressKey(0, STATE_ID, OL_ID_FQN)))) {
    associations.push([HAS, 0, PEOPLE, 0, STATE_ID, {}]);
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
  getNeedsAssessmentAssociations,
  getOfficerAndAttorneyContactAssociations,
  getStateIDAssociations,
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
