/*
 * @flow
 */

import {
  List,
  Map,
  get,
  getIn,
  has,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { FQN, UUID } from 'lattice';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { EMPTY_FIELD, getPersonFullName } from '../../../utils/FormattingUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  CONTACTED_VIA,
  EMPLOYED_BY,
  IS,
  PROVIDER,
  PROVIDER_ADDRESS,
  PROVIDER_CONTACT_INFO,
  PROVIDER_EMPLOYEES,
  PROVIDER_STAFF,
} = APP_TYPE_FQNS;
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
    if (isDefined(phoneEntity)) {
      const phoneNumber :string = getIn(phoneEntity, [PHONE_NUMBER, 0]);
      dataObj = dataObj.set('phone', phoneNumber || EMPTY_FIELD);
    }
    const emailEntity :any = contacts.find((contact :Map) => isDefined(get(contact, EMAIL)));
    if (isDefined(emailEntity)) {
      const emailAddress :string = getIn(emailEntity, [EMAIL, 0]);
      dataObj = dataObj.set('email', emailAddress || EMPTY_FIELD);
    }
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
      pointOfContact[getEntityAddressKey(-1, PROVIDER_CONTACT_INFO, PHONE_NUMBER)] = getIn(
        phoneEntity,
        [PHONE_NUMBER, 0]
      );
    }
    const emailEntity :any = contacts.find((contact :Map) => isDefined(get(contact, EMAIL)));
    if (isDefined(emailEntity)) {
      pointOfContact[getEntityAddressKey(-2, PROVIDER_CONTACT_INFO, EMAIL)] = getIn(emailEntity, [EMAIL, 0]);
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

const formatEntityIndexToIdMap = (
  providerEKID :UUID,
  address :Map,
  providerStaff :List,
  contactInfoByContactPersonEKID :Map
) :Map => {

  let entityIndexToIdMap :Map = Map();
  entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER, 0], providerEKID);
  if (!address.isEmpty()) entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_ADDRESS, 0], getEKID(address));

  providerStaff.forEach((staffMember :Map, index :number) => {
    const staffMemberEKID :UUID = getEKID(staffMember);
    entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_STAFF, -1, index], staffMemberEKID);
    const contactMethods :List = contactInfoByContactPersonEKID.get(staffMemberEKID, List());
    contactMethods.forEach((method :Map) => {
      if (method.has(PHONE_NUMBER)) {
        entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_CONTACT_INFO, -1, index], getEKID(method));
      }
      if (method.has(EMAIL)) {
        entityIndexToIdMap = entityIndexToIdMap.setIn([PROVIDER_CONTACT_INFO, -2, index], getEKID(method));
      }
    });
  });
  return entityIndexToIdMap;
};

// create all entities for each object in array
const preprocessContactsData = (contactsFormData :Object, entitySetFqn :FQN) :Object => {
  const newContactsFormData :Object = contactsFormData;
  contactsFormData[getPageSectionKey(1, 1)].forEach((contact :Object, index :number) => {
    if (!has(contact, getEntityAddressKey(-1, entitySetFqn, PHONE_NUMBER))) {
      newContactsFormData[getPageSectionKey(1, 1)][index][getEntityAddressKey(
        -1,
        entitySetFqn,
        PHONE_NUMBER
      )] = '';
    }
    if (!has(contact, getEntityAddressKey(-2, entitySetFqn, EMAIL))) {
      newContactsFormData[getPageSectionKey(1, 1)][index][getEntityAddressKey(
        -2,
        entitySetFqn,
        EMAIL
      )] = '';
    }
  });
  return newContactsFormData;
};

const getContactsAssociations = (
  newContactsEntityData :Object[],
  contactsFormData :Object,
  providerEKID :UUID
) :Array<*> => {

  const associations :Array<Array<*>> = [];
  if (!isDefined(newContactsEntityData) || !isDefined(contactsFormData)) return associations;
  if (!newContactsEntityData.length) return associations;

  newContactsEntityData.forEach((contact :Object, index :number) => {
    associations.push([IS, index, PROVIDER_STAFF, index, PROVIDER_EMPLOYEES]);
    associations.push([EMPLOYED_BY, index, PROVIDER_STAFF, providerEKID, PROVIDER]);
    associations.push([EMPLOYED_BY, index, PROVIDER_EMPLOYEES, providerEKID, PROVIDER]);
  });
  for (let index = 0; index < newContactsEntityData.length; index += 1) {
    associations.push([CONTACTED_VIA, index, PROVIDER_STAFF, index * 2, PROVIDER_CONTACT_INFO]);
    associations.push([CONTACTED_VIA, index, PROVIDER_STAFF, index * 2 + 1, PROVIDER_CONTACT_INFO]);
  }
  return associations;
};

export {
  formatEntityIndexToIdMap,
  getContactsAssociations,
  getDataForFormPrepopulation,
  getListOfContacts,
  preprocessContactsData,
};
