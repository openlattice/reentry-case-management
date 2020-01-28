// @flow
import {
  Map,
  get,
  getIn,
  hasIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { deleteKeyFromFormData, updateFormData } from '../../../utils/FormUtils';
import { isDefined } from '../../../utils/LangUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';

const {
  getEntityAddressKey,
  getPageSectionKey,
  parseEntityAddressKey
} = DataProcessingUtils;
const {
  APPEARS_IN,
  ASSIGNED_TO,
  CONTACTED_VIA,
  CONTACT_INFO,
  EDUCATION,
  EMPLOYEE,
  HAS,
  HEARINGS,
  IS,
  JAILS_PRISONS,
  JAIL_STAYS,
  LOCATED_AT,
  LOCATION,
  PEOPLE,
  PERSON_DETAILS,
  PERSON_DETAILS_CRIMINAL_JUSTICE,
  PROBATION_PAROLE,
  REPRESENTED_BY,
  SUBJECT_OF,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  FIRST_NAME,
  GENDER,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  MARITAL_STATUS,
  NAME,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  PROJECTED_RELEASE_DATETIME,
  RECOGNIZED_END_DATETIME,
  SEX_OFFENDER,
  TITLE,
  TYPE,
} = PROPERTY_TYPE_FQNS;

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
  updatedFormData = updateFormData(
    updatedFormData,
    [existingPath[0], existingPath[1], getEntityAddressKey(newIndex, appTypeFqn, propertyTypeFQN)],
    value
  );
  return updatedFormData;
};

const setProbationOrParoleValues = (formData :Object) :Object => {

  let updatedFormData :Object = formData;
  const probationParolePath :string[] = [getPageSectionKey(1, 4), getPageSectionKey(1, 7)];
  const probationOrParoleData :Object = getIn(formData, probationParolePath, {});
  const attorneyEmployeeKey :string = getEntityAddressKey(0, EMPLOYEE, TITLE);
  const officerEmployeeKey :string = getEntityAddressKey(1, EMPLOYEE, TITLE);
  const keys :string[] = Object.keys(probationOrParoleData);

  if ((keys.length === 2 && keys.includes(attorneyEmployeeKey) && keys.includes(officerEmployeeKey))
    || !keys.length) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyEmployeeKey]));
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerEmployeeKey]));
    return updatedFormData;
  }

  let personCount :number = 1;

  const attorneyLastNameKey :string = getEntityAddressKey(1, PEOPLE, LAST_NAME);
  const attorneyFirstNameKey :string = getEntityAddressKey(1, PEOPLE, FIRST_NAME);
  if (!isDefined(get(probationOrParoleData, attorneyLastNameKey))
    || !isDefined(get(probationOrParoleData, attorneyFirstNameKey))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyEmployeeKey]));
  }
  else personCount += 1;

  const officerLastNameKey :string = getEntityAddressKey(2, PEOPLE, LAST_NAME);
  const officerFirstNameKey :string = getEntityAddressKey(2, PEOPLE, FIRST_NAME);
  if (!isDefined(get(probationOrParoleData, officerLastNameKey))
    && !isDefined(get(probationOrParoleData, officerFirstNameKey))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerEmployeeKey]));
    return updatedFormData;
  }
  if (personCount === 1) {
    updatedFormData = resetKey(
      updatedFormData,
      probationParolePath.concat(officerLastNameKey),
      personCount,
      { appTypeFqn: PEOPLE, propertyTypeFQN: LAST_NAME }
    );
    updatedFormData = resetKey(
      updatedFormData,
      probationParolePath.concat(officerFirstNameKey),
      personCount,
      { appTypeFqn: PEOPLE, propertyTypeFQN: FIRST_NAME }
    );
  }

  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === 'Probation'
    && personCount === 2) {
    updatedFormData = updateFormData(
      updatedFormData,
      probationParolePath.concat([officerEmployeeKey]),
      'Probation Officer'
    );
  }
  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === 'Parole') {
    if (personCount === 2) {
      updatedFormData = updateFormData(
        updatedFormData,
        probationParolePath.concat([officerEmployeeKey]),
        'Parole Officer'
      );
    }
    else {
      updatedFormData = updateFormData(
        updatedFormData,
        probationParolePath.concat([attorneyEmployeeKey]),
        'Parole Officer'
      );
      updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerEmployeeKey]));
    }
  }
  return updatedFormData;
};

// fabricate's index mappers don't work, because these values are not in arrays
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
  console.log('getClientDetailsAssociations contactInfoCount: ', contactInfoCount);
  if (contactInfoCount) {
    for (let i = 0; i < contactInfoCount; i += 1) {
      associations.push([CONTACTED_VIA, 0, PEOPLE, i, CONTACT_INFO, {}]);
    }
    // const phoneNumberFilledOutInForm :boolean = isDefined(
    //   get(contactsAndAddress, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER))
    // );
    // if (phoneNumberFilledOutInForm) {
    //   associations.push([CONTACTED_VIA, 0, PEOPLE, 0, CONTACT_INFO, {}]);
    // }
    // if (isDefined(get(contactsAndAddress, getEntityAddressKey(1, CONTACT_INFO, EMAIL)))) {
    //   // const emailEntityIndex :number = phoneNumberFilledOutInForm ? 1 : 0;
    //   associations.push([CONTACTED_VIA, 0, PEOPLE, contactInfoCount - 1, CONTACT_INFO, {}]);
    // }
  }

  const address :any = Object.keys(contactsAndAddress).find((entityAddressKey :string) => {
    const { entitySetName } = parseEntityAddressKey(entityAddressKey);
    return entitySetName === LOCATION.toString() && isDefined(get(contactsAndAddress, entityAddressKey));
  });
  if (isDefined(address)) associations.push([LOCATED_AT, 0, PEOPLE, 0, LOCATION, {}]);

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

const getClientCJDetailsAssociations = (formData :Object) :Array<Array<*>> => {
  const associations = [];
  const educationLevel :any = getIn(
    formData,
    [getPageSectionKey(1, 5), getEntityAddressKey(0, PERSON_DETAILS_CRIMINAL_JUSTICE, SEX_OFFENDER)]
  );
  if (!isDefined(educationLevel)) return associations;
  associations.push([HAS, 0, PEOPLE, 0, PERSON_DETAILS_CRIMINAL_JUSTICE, {}]);
  return associations;
};

const getClientReleaseAssociations = (formData :Object) => {
  const associations = [];
  const outerPageSectionKey :string = getPageSectionKey(1, 4);
  const releaseDate :any = getIn(
    formData,
    [outerPageSectionKey, getEntityAddressKey(0, JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]
  );
  // change to EKID once you hydrate form with real jails from entity set:
  const incarcerationFacility :any = getIn(
    formData,
    [outerPageSectionKey, getEntityAddressKey(0, JAILS_PRISONS, NAME)]
  );

  if (isDefined(releaseDate) || isDefined(incarcerationFacility)) {
    associations.push([LOCATED_AT, 0, JAIL_STAYS, 0, JAILS_PRISONS, {}]);
    associations.push([SUBJECT_OF, 0, PEOPLE, 0, JAIL_STAYS, {}]);
  }

  const probationData = getIn(formData, [outerPageSectionKey, getPageSectionKey(1, 7)]);
  if (!isDefined(probationData) || Object.values(probationData).every((value :any) => !isDefined(value))) {
    return associations;
  }

  /*
    person (client) -> represented by -> employee (attorney)
    person (attorney) -> is -> employee (attorney)
  */
  const attorneyFilledOutInForm :boolean = isDefined(get(probationData, getEntityAddressKey(1, PEOPLE, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(1, PEOPLE, FIRST_NAME))));

  let contactInfoCount = getClientContactInfoCount(formData);

  // Attorney
  if (attorneyFilledOutInForm) {
    associations.push([REPRESENTED_BY, 0, PEOPLE, 0, EMPLOYEE, {}]);
    associations.push([IS, 0, PEOPLE, 0, EMPLOYEE, {}]);

    if (isDefined(get(probationData, getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 1, PEOPLE, contactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, contactInfoCount, CONTACT_INFO, {}]);
      contactInfoCount += 1;
    }
    if (isDefined(get(probationData, getEntityAddressKey(-3, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 1, PEOPLE, contactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, contactInfoCount, CONTACT_INFO, {}]);
      contactInfoCount += 1;
    }
  }

  /*
    parole officer (employee) + person (parole officer) -> assigned to -> person (client)
    person (parole officer) -> is -> employee (parole officer)
  */

  // Probation/Parole Officer
  // don't want add this person as index 2 if there's no person at index 1:
  const officerFilledOutInForm = isDefined(get(probationData, getEntityAddressKey(2, PEOPLE, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(2, PEOPLE, FIRST_NAME))));
  const officerIndex :number = attorneyFilledOutInForm ? 2 : 1;
  const officerEmployeeIndex :number = attorneyFilledOutInForm ? 1 : 0;
  if (officerFilledOutInForm) {

    associations.push([ASSIGNED_TO, officerEmployeeIndex, EMPLOYEE, 0, PEOPLE, {}]);
    associations.push([IS, officerIndex, PEOPLE, officerEmployeeIndex, EMPLOYEE, {}]);

    if (isDefined(get(probationData, getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, officerIndex, PEOPLE, contactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, officerEmployeeIndex, EMPLOYEE, contactInfoCount, CONTACT_INFO, {}]);
      contactInfoCount += 1;
    }
    if (isDefined(get(probationData, getEntityAddressKey(-5, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, officerIndex, PEOPLE, contactInfoCount, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, officerEmployeeIndex, EMPLOYEE, contactInfoCount, CONTACT_INFO, {}]);
      contactInfoCount += 1;
    }
  }

  /*
    person (client) -> assigned to -> parole
    parole officer (employee) + person (parole officer) -> assigned to -> parole
  */

  // Probation/Parole
  if (isDefined(get(probationData, getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)))) {
    associations.push([ASSIGNED_TO, 0, PEOPLE, 0, PROBATION_PAROLE, {}]);
    if (officerFilledOutInForm) {
      associations.push([ASSIGNED_TO, officerEmployeeIndex, EMPLOYEE, 0, PROBATION_PAROLE, {}]);
      associations.push([ASSIGNED_TO, officerIndex, PEOPLE, 0, PROBATION_PAROLE, {}]);
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

export {
  getClientCJDetailsAssociations,
  getClientContactAndAddressAssociations,
  getClientContactInfoCount,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  setClientContactInfoIndices,
  setContactIndices,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
};
