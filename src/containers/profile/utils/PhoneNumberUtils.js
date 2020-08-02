// @flow
import { getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { AsYouType } from 'libphonenumber-js';

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
    const homePhone = homePhoneInput.length <= 4 ? homePhoneInput : new AsYouType('US').input(homePhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, homePhoneKey, homePhone);
  }
  if (cellPhoneInput) {
    const cellPhone = cellPhoneInput.length <= 4 ? cellPhoneInput : new AsYouType('US').input(cellPhoneInput);
    formDataWithPhoneNumbersFormatted = setIn(formDataWithPhoneNumbersFormatted, cellPhoneKey, cellPhone);
  }

  return formDataWithPhoneNumbersFormatted;
};

/* eslint-disable import/prefer-default-export */
export {
  formatPhoneNumbersAsYouType,
};
