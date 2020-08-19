// @flow
import { get, getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CONTACT_INFO, EMERGENCY_CONTACT_INFO } = APP_TYPE_FQNS;
const { PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

const formatPhoneNumbersAsYouType = (
  formData :Object,
  sectionNumber :number,
  defaultValue :?string = undefined
) :Object => {

  let formDataWithPhoneNumbersFormatted = formData;

  const homePhoneKey :string[] = [
    getPageSectionKey(1, sectionNumber),
    getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)
  ];
  const homePhoneInput = getIn(formDataWithPhoneNumbersFormatted, homePhoneKey) || defaultValue;
  const cellPhoneKey :string[] = [
    getPageSectionKey(1, sectionNumber),
    getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)
  ];
  const cellPhoneInput = getIn(formDataWithPhoneNumbersFormatted, cellPhoneKey) || defaultValue;

  const attorneyPhoneKey :string[] = [
    getPageSectionKey(1, 5),
    getPageSectionKey(1, 6),
    getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)
  ];
  const attorneyPhoneInput = getIn(formDataWithPhoneNumbersFormatted, attorneyPhoneKey) || defaultValue;
  const probationOfficerPhoneKey :string[] = [
    getPageSectionKey(1, 5),
    getPageSectionKey(1, 6),
    getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)
  ];
  const probationOfficerPhoneInput = getIn(formDataWithPhoneNumbersFormatted, probationOfficerPhoneKey) || defaultValue;

  if (homePhoneInput) {
    // https://github.com/catamphetamine/libphonenumber-js/issues/225
    const homePhone = homePhoneInput.length <= 4 ? homePhoneInput : new AsYouType('US').input(homePhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, homePhoneKey, homePhone);
  }
  if (cellPhoneInput) {
    const cellPhone = cellPhoneInput.length <= 4 ? cellPhoneInput : new AsYouType('US').input(cellPhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, cellPhoneKey, cellPhone);
  }
  if (attorneyPhoneInput) {
    const attorneyPhone = attorneyPhoneInput.length <= 4
      ? attorneyPhoneInput
      : new AsYouType('US').input(attorneyPhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, attorneyPhoneKey, attorneyPhone);
  }
  if (probationOfficerPhoneInput) {
    const probationOfficerPhone = probationOfficerPhoneInput.length <= 4
      ? probationOfficerPhoneInput
      : new AsYouType('US').input(probationOfficerPhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(
      formDataWithPhoneNumbersFormatted,
      probationOfficerPhoneKey,
      probationOfficerPhone
    );
  }

  return formDataWithPhoneNumbersFormatted;
};

const validateParticipantPhoneNumbers = (formData :Object, errors :Object) => {
  const participantContactsPageSectionKey = getPageSectionKey(1, 4);
  const homePhoneKey = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
  const cellPhoneKey = getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER);

  const otherContactsPageSectionKeys = [getPageSectionKey(1, 5), getPageSectionKey(1, 6)];
  const attorneyPhonePath :string[] = otherContactsPageSectionKeys
    .concat([getEntityAddressKey(-2, CONTACT_INFO, PHONE_NUMBER)]);
  const probationOfficerPath :string[] = otherContactsPageSectionKeys
    .concat([getEntityAddressKey(-4, CONTACT_INFO, PHONE_NUMBER)]);

  const errorMessage :string = 'Phone number is invalid';

  const homePhone :string = getIn(formData, [participantContactsPageSectionKey, homePhoneKey]);
  if (homePhone) {
    const parsedHomePhone = parsePhoneNumberFromString(homePhone, 'US');
    if (!parsedHomePhone.isPossible()) {
      errors[participantContactsPageSectionKey][homePhoneKey].addError(errorMessage);
    }
  }

  const cellPhone :string = getIn(formData, [participantContactsPageSectionKey, cellPhoneKey]);
  if (cellPhone) {
    const parsedCellPhone = parsePhoneNumberFromString(cellPhone, 'US');
    if (!parsedCellPhone.isPossible()) {
      errors[participantContactsPageSectionKey][cellPhoneKey].addError(errorMessage);
    }
  }

  const attorneyPhone :string = getIn(formData, attorneyPhonePath);
  if (attorneyPhone) {
    const parsedAttorneyPhone = parsePhoneNumberFromString(attorneyPhone, 'US');
    if (!parsedAttorneyPhone.isPossible()) {
      errors[attorneyPhonePath[0]][attorneyPhonePath[1]][attorneyPhonePath[2]].addError(errorMessage);
    }
  }

  const probationOfficerPhone :string = getIn(formData, probationOfficerPath);
  if (probationOfficerPhone) {
    const parsedProbationOfficerPhone = parsePhoneNumberFromString(probationOfficerPhone, 'US');
    if (!parsedProbationOfficerPhone.isPossible()) {
      errors[probationOfficerPath[0]][probationOfficerPath[1]][probationOfficerPath[2]].addError(errorMessage);
    }
  }

  return errors;
};

// Emergency Contact Info:

const formatEmergencyContactPhoneAsYouType = (
  formData :Object,
  defaultValue :?string = undefined
) :Object => {

  let formDataWithPhoneNumbersFormatted = formData;

  const contacts = get(formDataWithPhoneNumbersFormatted, getPageSectionKey(1, 1));

  contacts.forEach((contact :Object, index :number) => {
    const phoneInput = get(contact, getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER)) || defaultValue;
    if (phoneInput) {
      const phone = phoneInput.length <= 4 ? phoneInput : new AsYouType('US').input(phoneInput);
      formDataWithPhoneNumbersFormatted = setIn(
        formDataWithPhoneNumbersFormatted,
        [getPageSectionKey(1, 1), index, getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER)],
        phone
      );
    }
  });

  return formDataWithPhoneNumbersFormatted;
};

export {
  formatEmergencyContactPhoneAsYouType,
  formatPhoneNumbersAsYouType,
  validateParticipantPhoneNumbers,
};
