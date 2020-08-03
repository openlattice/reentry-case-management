// @flow
import { getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CONTACT_INFO } = APP_TYPE_FQNS;
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

  if (homePhoneInput) {
    // https://github.com/catamphetamine/libphonenumber-js/issues/225
    const homePhone = homePhoneInput.length <= 4 ? homePhoneInput : new AsYouType('US').input(homePhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, homePhoneKey, homePhone);
  }
  if (cellPhoneInput) {
    const cellPhone = cellPhoneInput.length <= 4 ? cellPhoneInput : new AsYouType('US').input(cellPhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, cellPhoneKey, cellPhone);
  }

  return formDataWithPhoneNumbersFormatted;
};

const validateParticipantPhoneNumbers = (formData :Object, errors :Object) => {
  const pageSection1 = getPageSectionKey(1, 2);
  const homePhoneKey = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
  const cellPhoneKey = getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER);

  const errorMessage :string = 'Phone number is invalid';

  const homePhone :string = getIn(formData, [pageSection1, homePhoneKey]);
  if (homePhone) {
    const parsedHomePhone = parsePhoneNumberFromString(homePhone, 'US');
    if (!parsedHomePhone.isPossible()) {
      errors[pageSection1][homePhoneKey].addError(errorMessage);
    }
  }

  const cellPhone :string = getIn(formData, [pageSection1, cellPhoneKey]);
  if (cellPhone) {
    const parsedCellPhone = parsePhoneNumberFromString(cellPhone, 'US');
    if (!parsedCellPhone.isPossible()) {
      errors[pageSection1][cellPhoneKey].addError(errorMessage);
    }
  }

  return errors;
};

export {
  formatPhoneNumbersAsYouType,
  validateParticipantPhoneNumbers,
};
