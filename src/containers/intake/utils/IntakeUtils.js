// @flow
import {
  List,
  Map,
  get,
  getIn,
  hasIn,
  setIn,
} from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getValuesFromEntityList } from '../../../utils/Utils';
import { deleteKeyFromFormData, updateFormData } from '../../../utils/FormUtils';
import { isDefined } from '../../../utils/LangUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PAROLE_PROBATION_CONSTS, PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey, parseEntityAddressKey } = DataProcessingUtils;
const {
  APPEARS_IN,
  ASSIGNED_TO,
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
} = APP_TYPE_FQNS;
const {
  COUNTY,
  EMAIL,
  ENTITY_KEY_ID,
  FIRST_NAME,
  GENDER,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  MARITAL_STATUS,
  NAME,
  OL_DATETIME,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  PROJECTED_RELEASE_DATETIME,
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
      getPageSectionKey(1, 4),
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
      getPageSectionKey(1, 4),
      'properties',
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
      'enumNames'
    ],
    labels
  );

  return newSchema;
};

// Entities Utils

const getClientContactInfoCount = (formData :Object) :number => {

  const contactSection :Object = get(formData, getPageSectionKey(1, 2));
  const contactInfoKeysOnly :string[] = Object.keys(contactSection).filter((entityAddressKey :string) => {

    const { entitySetName, propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
    const propertyIsAboutPreferred :boolean = propertyTypeFQN.toString() === PREFERRED.toString()
      || propertyTypeFQN.toString() === PREFERRED_METHOD_OF_CONTACT.toString();

    return entitySetName === CONTACT_INFO.toString()
      && isDefined(get(contactSection, entityAddressKey))
      && !propertyIsAboutPreferred;
  });
  return contactInfoKeysOnly.length;
};

const setClientContactInfoIndices = (formData :Object) :Object => {
  let updatedFormData = formData;
  const sectionTwoKey :string = getPageSectionKey(1, 2);
  const contactInfoCount :number = getClientContactInfoCount(formData);
  if (!contactInfoCount) return updatedFormData;

  if (!isDefined(getIn(formData, [sectionTwoKey, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]))
    && contactInfoCount === 1) {
    const currentEmailPath :string[] = [sectionTwoKey, getEntityAddressKey(1, CONTACT_INFO, EMAIL)];
    const emailValue :string = getIn(formData, currentEmailPath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, currentEmailPath);
    updatedFormData = updateFormData(
      updatedFormData,
      [sectionTwoKey, getEntityAddressKey(0, CONTACT_INFO, EMAIL)],
      emailValue
    );
  }
  return updatedFormData;
};

const setPreferredMethodOfContact = (formData :Object) :Object => {

  const preferredMethodOfContactKey :string = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
  const pageSectionKey :string = getPageSectionKey(1, 2);
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

  const emailIndex :number = contactInfoCount - 1;
  if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[2]) {
    const emailAsPreferredMethodKey :string = getEntityAddressKey(
      emailIndex,
      CONTACT_INFO,
      PREFERRED_METHOD_OF_CONTACT
    );
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, emailAsPreferredMethodKey],
      preferredMethodOfContactValue
    );
    const emailAsPreferredKey :string = getEntityAddressKey(emailIndex, CONTACT_INFO, PREFERRED);
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, emailAsPreferredKey],
      true
    );
  }
  else {
    const phoneAsPreferredMethodKey :string = getEntityAddressKey(0, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, phoneAsPreferredMethodKey],
      preferredMethodOfContactValue
    );
    const phoneAsPreferredKey :string = getEntityAddressKey(0, CONTACT_INFO, PREFERRED);
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, phoneAsPreferredKey],
      true
    );
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
  const probationParolePath :string[] = [getPageSectionKey(1, 4), getPageSectionKey(1, 7)];
  const probationOrParoleData :Object = getIn(formData, probationParolePath, {});
  const attorneyEmploymentKey :string = getEntityAddressKey(0, EMPLOYMENT, NAME);
  const officerEmployeeKey :string = getEntityAddressKey(0, EMPLOYEE, TITLE);
  const keys :string[] = Object.keys(probationOrParoleData);

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

  const sectionFourKey :string = getPageSectionKey(1, 4);
  const sectionSevenKey :string = getPageSectionKey(1, 7);
  const attorneyPhoneKey :string = getEntityAddressKey(2, CONTACT_INFO, PHONE_NUMBER);
  const attorneyEmailKey :string = getEntityAddressKey(3, CONTACT_INFO, EMAIL);
  const officerPhoneKey :string = getEntityAddressKey(4, CONTACT_INFO, PHONE_NUMBER);
  const officerEmailKey :string = getEntityAddressKey(5, CONTACT_INFO, EMAIL);

  const clientContactEntitiesCount :number = getClientContactInfoCount(formData);
  const countAfterAttorneyPhone :number = isDefined(
    getIn(formData, [sectionFourKey, sectionSevenKey, attorneyPhoneKey])
  )
    ? clientContactEntitiesCount + 1 : clientContactEntitiesCount;
  const countAfterAttorneyEmail :number = isDefined(
    getIn(formData, [sectionFourKey, sectionSevenKey, attorneyEmailKey])
  )
    ? countAfterAttorneyPhone + 1 : countAfterAttorneyPhone;
  const countAfterOfficerPhone :number = isDefined(
    getIn(formData, [sectionFourKey, sectionSevenKey, officerPhoneKey])
  )
    ? countAfterAttorneyEmail + 1 : countAfterAttorneyEmail;
  const countAfterOfficerEmail :number = isDefined(
    getIn(formData, [sectionFourKey, sectionSevenKey, officerEmailKey])
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
      [sectionFourKey, sectionSevenKey, attorneyPhoneKey],
      countAfterAttorneyPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterAttorneyEmail > countAfterAttorneyPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [sectionFourKey, sectionSevenKey, attorneyEmailKey],
      countAfterAttorneyEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  if (countAfterOfficerPhone > countAfterAttorneyEmail) {
    updatedFormData = resetKey(
      updatedFormData,
      [sectionFourKey, sectionSevenKey, officerPhoneKey],
      countAfterOfficerPhone - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: PHONE_NUMBER }
    );
  }
  if (countAfterOfficerEmail > countAfterOfficerPhone) {
    updatedFormData = resetKey(
      updatedFormData,
      [sectionFourKey, sectionSevenKey, officerEmailKey],
      countAfterOfficerEmail - 1,
      { appTypeFqn: CONTACT_INFO, propertyTypeFQN: EMAIL }
    );
  }
  return updatedFormData;
};

const setDatesAsDateTimes = (formData :Object) :Object => {

  let updatedFormData = formData;
  const currentTime :string = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);

  const releaseDatePath :string[] = [
    getPageSectionKey(1, 4),
    getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)
  ];
  const releaseDate :any = getIn(formData, releaseDatePath);
  const recognizedEndDatePath :string[] = [
    getPageSectionKey(1, 4),
    getPageSectionKey(1, 7),
    getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)
  ];
  const recgonizedDate :any = getIn(formData, recognizedEndDatePath);

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

  const isSexOffenderPath :string[] = [getPageSectionKey(1, 5), getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)];
  const isSexOffenderValue :any = getIn(formData, isSexOffenderPath);
  const registeredCountyPath :string[] = [getPageSectionKey(1, 5), getEntityAddressKey(1, LOCATION, COUNTY)];
  const registeredStatePath :string[] = [getPageSectionKey(1, 5), getEntityAddressKey(1, LOCATION, US_STATE)];
  const registeredDatePath :string[] = [getPageSectionKey(1, 5), getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)];

  if (isDefined(isSexOffenderValue) && isSexOffenderValue) {
    const clientAddressSection :any = get(formData, getPageSectionKey(1, 2));
    const clientAddressInForm :boolean = Object.keys(clientAddressSection)
      .filter((entityAddressKey :string) => {
        const { entitySetName } = parseEntityAddressKey(entityAddressKey);
        return entitySetName === LOCATION.toString();
      }).length > 0;
    if (!clientAddressInForm) {
      updatedFormData = resetKey(
        updatedFormData,
        registeredCountyPath,
        0,
        { appTypeFqn: LOCATION, propertyTypeFQN: COUNTY }
      );
      updatedFormData = resetKey(
        updatedFormData,
        registeredStatePath,
        0,
        { appTypeFqn: LOCATION, propertyTypeFQN: US_STATE }
      );
    }

    const registeredDate :any = getIn(formData, registeredDatePath);
    if (isDefined(registeredDate)) {
      const datetimeISO :string = DateTime.fromSQL(registeredDate.concat(' ', currentTime)).toISO();
      updatedFormData = updateFormData(updatedFormData, registeredDatePath, datetimeISO);
    }
  }
  if ((isDefined(isSexOffenderValue) && !isSexOffenderValue) || !isDefined(isSexOffenderPath)) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredCountyPath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredStatePath);
    updatedFormData = deleteKeyFromFormData(updatedFormData, registeredDatePath);
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
  const contactsAndAddress :Object = get(formData, getPageSectionKey(1, 2));
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
  const isSexOffenderValue :any = getIn(
    formData,
    [getPageSectionKey(1, 5), getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]
  );
  if (!isDefined(isSexOffenderValue)) return associations;

  associations.push([REPORTED, 0, PEOPLE, 0, SEX_OFFENDER, {}]);
  const sexOffenderSection :Object = get(formData, getPageSectionKey(1, 5));
  const countyKey = Object.keys(sexOffenderSection).find((key :string) => {
    const { entitySetName } = parseEntityAddressKey(key);
    return entitySetName === LOCATION.toString();
  });
  if (isDefined(countyKey)) {
    const { entityIndex } = parseEntityAddressKey(countyKey);
    associations.push([REGISTERED_FOR, 0, SEX_OFFENDER, entityIndex, LOCATION, {}]);
    associations.push([IS_REGISTERED_SEX_OFFENDER_IN, 0, PEOPLE, entityIndex, LOCATION, {}]);
  }
  return associations;
};

const getClientReleaseAssociations = (formData :Object) => {
  const associations = [];
  const outerPageSectionKey :string = getPageSectionKey(1, 4);
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

  const probationData = getIn(formData, [outerPageSectionKey, getPageSectionKey(1, 7)]);
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
    associations.push([ASSIGNED_TO, 0, EMPLOYEE, 0, PEOPLE, {}]);
    associations.push([IS, 0, OFFICERS, 0, EMPLOYEE, {}]);
  }

  /*
    person (client) -> assigned to -> parole
    parole officer (employee) + person (parole officer) -> assigned to -> parole
  */

  // Probation/Parole
  if (isDefined(get(probationData, getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)))) {
    associations.push([ASSIGNED_TO, 0, PEOPLE, 0, PROBATION_PAROLE, {}]);
    if (officerFilledOutInForm) {
      associations.push([ASSIGNED_TO, 0, EMPLOYEE, 0, PROBATION_PAROLE, {}]);
      associations.push([ASSIGNED_TO, 0, OFFICERS, 0, PROBATION_PAROLE, {}]);
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
  const probationPath :string[] = [getPageSectionKey(1, 4), getPageSectionKey(1, 7)];
  const originalProbationData :Object = getIn(originalFormData, probationPath);

  const attorneyIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([getEntityAddressKey(0, EMPLOYMENT, NAME)])
  ));
  if (attorneyIsDefined) {
    if (isDefined(get(originalProbationData, getEntityAddressKey(2, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, getEntityAddressKey(3, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 0, ATTORNEYS, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  const officerIsDefined :boolean = isDefined(getIn(
    updatedFormData,
    probationPath.concat([getEntityAddressKey(0, EMPLOYEE, TITLE)])
  ));
  if (officerIsDefined) {
    if (isDefined(get(originalProbationData, getEntityAddressKey(4, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
    if (isDefined(get(originalProbationData, getEntityAddressKey(5, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 0, OFFICERS, clientContactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, clientContactInfoCount, CONTACT_INFO, {}]);
      clientContactInfoCount += 1;
    }
  }

  return associations;
};

const getClientHearingAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const hearing = get(formData, getPageSectionKey(1, 6));
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
  hydrateIncarcerationFacilitiesSchemas,
  setClientContactInfoIndices,
  setContactIndices,
  setDatesAsDateTimes,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
  setRegisteredSexOffender,
};
