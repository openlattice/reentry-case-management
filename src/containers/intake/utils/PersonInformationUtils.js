// @flow
import {
  get,
  getIn,
  hasIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { deleteKeyFromFormData, updateFormData } from '../../../utils/FormUtils';
import { isDefined } from '../../../utils/LangUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey, parseEntityAddressKey } = DataProcessingUtils;
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

const setPreferredMethodOfContact = (formData :Object) :Object => {

  const preferredMethodOfContactKey :string = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
  const pageSectionKey :string = getPageSectionKey(1, 2);
  const preferredMethodOfContactPath :string[] = [pageSectionKey, preferredMethodOfContactKey];
  const preferredMethodOfContactValue :string = getIn(formData, preferredMethodOfContactPath);

  if (!isDefined(formData)
    || !hasIn(formData, preferredMethodOfContactPath)
    || !PREFERRED_COMMUNICATION_METHODS.includes(preferredMethodOfContactValue)) {
    return formData;
  }

  let updatedFormData = formData;
  if (preferredMethodOfContactValue === PREFERRED_COMMUNICATION_METHODS[2]) {
    const emailAsPreferredMethodKey :string = getEntityAddressKey(1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
    updatedFormData = updateFormData(
      updatedFormData,
      [pageSectionKey, emailAsPreferredMethodKey],
      preferredMethodOfContactValue
    );
    const emailAsPreferredKey :string = getEntityAddressKey(1, CONTACT_INFO, PREFERRED);
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

  updatedFormData = deleteKeyFromFormData(updatedFormData, preferredMethodOfContactPath);

  return updatedFormData;
};

const setProbationOrParoleValues = (formData :Object) :Object => {

  let updatedFormData :Object = formData;
  const probationParolePath :string[] = [getPageSectionKey(1, 4), getPageSectionKey(1, 7)];
  const probationOrParoleData :Object = getIn(formData, probationParolePath);
  const attorneyKey :string = getEntityAddressKey(0, EMPLOYEE, TITLE);
  const officerKey :string = getEntityAddressKey(1, EMPLOYEE, TITLE);
  const keys :string[] = Object.keys(probationOrParoleData);

  if (keys.length === 2 && keys.includes(attorneyKey) && keys.includes(officerKey)) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyKey]));
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerKey]));
    return updatedFormData;
  }

  if (!isDefined(get(probationOrParoleData, getEntityAddressKey(1, PEOPLE, LAST_NAME)))
    && !isDefined(get(probationOrParoleData, getEntityAddressKey(1, PEOPLE, FIRST_NAME)))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([attorneyKey]));
  } // NEED TO DEAL WITH THE INDEX DISCREPANCIES

  if (!isDefined(get(probationOrParoleData, getEntityAddressKey(2, PEOPLE, LAST_NAME)))
    && !isDefined(get(probationOrParoleData, getEntityAddressKey(2, PEOPLE, FIRST_NAME)))) {
    updatedFormData = deleteKeyFromFormData(updatedFormData, probationParolePath.concat([officerKey]));
    return updatedFormData;
  }

  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === 'Probation') {
    updatedFormData = updateFormData(updatedFormData, probationParolePath.concat([officerKey]), 'Probation Officer');
  }
  if (get(probationOrParoleData, getEntityAddressKey(0, PROBATION_PAROLE, TYPE)) === 'Parole') {
    updatedFormData = updateFormData(updatedFormData, probationParolePath.concat([officerKey]), 'Parole Officer');
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

  if (isDefined(get(contactsAndAddress, getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)))) {
    associations.push([CONTACTED_VIA, 0, PEOPLE, 0, CONTACT_INFO, {}]);
  }
  if (isDefined(get(contactsAndAddress, getEntityAddressKey(1, CONTACT_INFO, EMAIL)))) {
    associations.push([CONTACTED_VIA, 0, PEOPLE, 1, CONTACT_INFO, {}]);
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
  const jailOrPrison :any = getIn(formData, [outerPageSectionKey, getEntityAddressKey(0, JAILS_PRISONS, NAME)]);

  if (isDefined(releaseDate) || isDefined(jailOrPrison)) {
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
  // Attorney
  if (isDefined(get(probationData, getEntityAddressKey(1, PEOPLE, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(1, PEOPLE, FIRST_NAME))))) {
    associations.push([REPRESENTED_BY, 0, PEOPLE, 0, EMPLOYEE, {}]);
    associations.push([IS, 0, PEOPLE, 0, EMPLOYEE, {}]);

    if (isDefined(get(probationData, getEntityAddressKey(2, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 1, PEOPLE, 2, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, 2, CONTACT_INFO, {}]);
    }
    if (isDefined(get(probationData, getEntityAddressKey(3, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 1, PEOPLE, 3, CONTACT_INFO, {}]);
      associations.push([CONTACTED_VIA, 0, EMPLOYEE, 3, CONTACT_INFO, {}]);
    }
  }

  // Probation/Parole Officer
  if (isDefined(get(probationData, getEntityAddressKey(2, PEOPLE, LAST_NAME)))
    || isDefined(get((probationData, getEntityAddressKey(2, PEOPLE, FIRST_NAME))))) {
    associations.push([ASSIGNED_TO, 2, PEOPLE, 0, PEOPLE, {}]);
    associations.push([ASSIGNED_TO, 2, PEOPLE, 0, PROBATION_PAROLE, {}]);

    if (isDefined(get(probationData, getEntityAddressKey(4, CONTACT_INFO, PHONE_NUMBER)))) {
      associations.push([CONTACTED_VIA, 2, PEOPLE, 4, CONTACT_INFO, {}]);
    }
    if (isDefined(get(probationData, getEntityAddressKey(5, CONTACT_INFO, EMAIL)))) {
      associations.push([CONTACTED_VIA, 2, PEOPLE, 5, CONTACT_INFO, {}]);
    }
  }

  // Probation/Parole
  if (isDefined(get(probationData, getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)))) {
    associations.push([ASSIGNED_TO, 0, PEOPLE, 0, PROBATION_PAROLE, {}]);
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
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
};
