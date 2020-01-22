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
  CONTACTED_VIA,
  CONTACT_INFO,
  LOCATED_AT,
  LOCATION,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
} = PROPERTY_TYPE_FQNS;

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

export {
  getClientContactAndAddressAssociations,
  setPreferredMethodOfContact,
};
