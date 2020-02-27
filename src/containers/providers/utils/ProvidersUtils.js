// @flow
import { List, Map, get } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { EMPTY_FIELD, getPersonFullName } from '../../../utils/FormattingUtils';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey } = DataProcessingUtils;
const { CONTACT_INFO, PROVIDER_STAFF } = APP_TYPE_FQNS;
const {
  CITY,
  DESCRIPTION,
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  PHONE_NUMBER,
  STREET,
  TYPE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getListOfContacts = (staffEntities :List, contactInfoByContactPersonEKID :Map) :List => {
  let data :List = List();

  staffEntities.forEach((staff :Map) => {
    let dataObj :Map = Map({
      name: EMPTY_FIELD,
      phone: EMPTY_FIELD,
      email: EMPTY_FIELD,
    });
    const name :string = getPersonFullName(staff);
    dataObj = dataObj.set('name', name);
    const staffEKID :UUID = getEKID(staff);
    const contacts :List = contactInfoByContactPersonEKID.get(staffEKID, List());
    const phoneEntity :any = contacts.find((contact :Map) => isDefined(get(contact, PHONE_NUMBER)));
    if (isDefined(phoneEntity)) dataObj = dataObj.set('phone', get(phoneEntity, PHONE_NUMBER));
    const emailEntity :any = contacts.find((contact :Map) => isDefined(get(contact, EMAIL)));
    if (isDefined(emailEntity)) dataObj = dataObj.set('email', get(emailEntity, PHONE_NUMBER));
    dataObj = dataObj.set('id', staffEKID);
    data = data.push(dataObj);
  });
  return data;
};

const getDataForFormPrepopulation = (
  provider :Map,
  address :Map,
  providerStaff :List,
  contactInfoByContactPersonEKID :Map
) :Object => {

  const { [DESCRIPTION]: providerDescription, [NAME]: providerName, [TYPE]: types } = getEntityProperties(
    provider,
    [DESCRIPTION, NAME, TYPE]
  );
  const providerTypes :string[] = typeof types === 'string' ? [types] : types;
  const {
    [CITY]: city,
    [STREET]: streetAddress,
    [US_STATE]: state,
    [ZIP]: zipCode,
  } = getEntityProperties(address, [CITY, STREET, US_STATE, ZIP]);

  const pointsOfContact :Object[] = [];
  providerStaff.forEach((staff :Map) => {
    const pointOfContact :Object = {};
    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(staff, [FIRST_NAME, LAST_NAME]);
    pointOfContact[getEntityAddressKey(-1, PROVIDER_STAFF, FIRST_NAME)] = firstName;
    pointOfContact[getEntityAddressKey(-1, PROVIDER_STAFF, LAST_NAME)] = lastName;
    const staffEKID :UUID = getEKID(staff);
    const contacts :List = contactInfoByContactPersonEKID.get(staffEKID, List());
    const phoneEntity :any = contacts.find((contact :Map) => isDefined(get(contact, PHONE_NUMBER)));
    if (isDefined(phoneEntity)) {
      pointOfContact[getEntityAddressKey(-1, CONTACT_INFO, PHONE_NUMBER)] = get(phoneEntity, PHONE_NUMBER);
    }
    const emailEntity :any = contacts.find((contact :Map) => isDefined(get(contact, EMAIL)));
    if (isDefined(emailEntity)) {
      pointOfContact[getEntityAddressKey(-2, CONTACT_INFO, EMAIL)] = get(emailEntity, EMAIL);
    }
    pointsOfContact.push(pointOfContact);
  });

  return {
    city,
    pointsOfContact,
    providerDescription,
    providerName,
    providerTypes,
    state,
    streetAddress,
    zipCode,
  };
};

export {
  getDataForFormPrepopulation,
  getListOfContacts,
};
