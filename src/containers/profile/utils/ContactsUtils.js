// @flow
import { List, Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CONTACT_INFO, LOCATION } = APP_TYPE_FQNS;
const {
  CITY,
  EMAIL,
  GENERAL_NOTES,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  STREET,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getPersonContactData = (participantNeighbors :Map) :Map => {
  const contactData :Map = Map().withMutations((map :Map) => {
    const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());
    const preferredContact = contactInfoEntities.find((contact :Map) => contact.has(PREFERRED)
      && contact.getIn([PREFERRED, 0]) === true);
    if (isDefined(preferredContact)) {
      const {
        [PREFERRED_METHOD_OF_CONTACT]: preferredMethod,
        [GENERAL_NOTES]: preferredTime
      } = getEntityProperties(preferredContact, [GENERAL_NOTES, PREFERRED_METHOD_OF_CONTACT]);
      map.set('preferredMethod', preferredMethod);
      map.set('preferredTime', preferredTime);
    }
    const email = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
    if (isDefined(email)) map.set('email', email.getIn([EMAIL, 0]));
    const phone = contactInfoEntities.find((contact :Map) => contact.has(PHONE_NUMBER));
    if (isDefined(phone)) map.set('phone', phone.getIn([PHONE_NUMBER, 0]));
  });
  return contactData;
};

const getAddress = (address :Map) :string => {
  let addressString :string = '';
  if (isDefined(address)) {
    const {
      [CITY]: city,
      [STREET]: street,
      [US_STATE]: usState,
      [ZIP]: zip
    } = getEntityProperties(address, [CITY, STREET, US_STATE, ZIP]);
    if (street.length) addressString = street;
    if (city.length) addressString = `${addressString} ${city}`;
    if (usState.length) addressString = `${addressString}${city.length ? ',' : ''} ${usState}`;
    if (zip.length) addressString = `${addressString} ${zip}`;
  }
  return addressString;
};

const getOriginalFormData = (contactInfoEntities :List, address :Map) => {

  const originalFormData = {
    [getPageSectionKey(1, 1)]: {},
    [getPageSectionKey(1, 2)]: {},
  };

  if (isDefined(address)) {
    const {
      [CITY]: city,
      [STREET]: street,
      [US_STATE]: usState,
      [ZIP]: zip
    } = getEntityProperties(address, [CITY, STREET, US_STATE, ZIP]);

    originalFormData[getPageSectionKey(1, 2)] = {
      [getEntityAddressKey(0, LOCATION, STREET)]: street,
      [getEntityAddressKey(0, LOCATION, CITY)]: city,
      [getEntityAddressKey(0, LOCATION, US_STATE)]: usState,
      [getEntityAddressKey(0, LOCATION, ZIP)]: zip,
    };
  }

  const preferredContact = contactInfoEntities.find((contact :Map) => contact.has(PREFERRED)
    && contact.getIn([PREFERRED, 0]) === true);
  if (isDefined(preferredContact)) {
    const {
      [GENERAL_NOTES]: preferredTime,
      [PREFERRED_METHOD_OF_CONTACT]: preferredMethod
    } = getEntityProperties(preferredContact, [GENERAL_NOTES, PREFERRED_METHOD_OF_CONTACT]);

    originalFormData[getPageSectionKey(1, 1)] = {
      [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: preferredMethod,
      [getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)]: preferredTime,
    };
  }

  const emailEntity = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
  let email;
  if (isDefined(emailEntity)) email = emailEntity.getIn([EMAIL, 0]);
  const phoneEntity = contactInfoEntities.find((contact :Map) => contact.has(PHONE_NUMBER));
  let phone;
  if (isDefined(phoneEntity)) phone = phoneEntity.getIn([PHONE_NUMBER, 0]);

  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)] = phone;
  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(1, CONTACT_INFO, EMAIL)] = email;

  return originalFormData;
};

const getEntityIndexToIdMap = (contactInfoEntities :List, address :Map) :Map => {

  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    map.set(LOCATION, List());
    if (isDefined(address) && !address.isEmpty()) {
      const addressEKID :UUID = getEKID(address);
      map.setIn([LOCATION, 0], addressEKID);
    }
    map.set(CONTACT_INFO, List());
    if (isDefined(contactInfoEntities) && !contactInfoEntities.isEmpty()) {
      const phoneEntity = contactInfoEntities.find((contact :Map) => contact.has(PHONE_NUMBER));
      if (isDefined(phoneEntity)) map.setIn([CONTACT_INFO, 0], getEKID(phoneEntity));

      const emailEntity = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
      if (isDefined(emailEntity)) map.setIn([CONTACT_INFO, 1], getEKID(emailEntity));
    }
  });

  return entityIndexToIdMap;
};

const preprocessContactFormData = (formData :Object, originalFormData :Object) :Map => {
  const updatedFormData = formData;

  const pageSection1 = getPageSectionKey(1, 1);
  const preferredMethodKey = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
  const preferredMethod = updatedFormData[pageSection1][preferredMethodKey];
  const originalPreferredMethod = originalFormData[pageSection1][preferredMethodKey];

  if (originalPreferredMethod !== preferredMethod && isDefined(preferredMethod)) {
    if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[2]) {
      const emailAsPreferredMethodKey :string = getEntityAddressKey(1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
      updatedFormData[pageSection1][emailAsPreferredMethodKey] = preferredMethod;
      updatedFormData[pageSection1][getEntityAddressKey(1, CONTACT_INFO, PREFERRED)] = true;
      updatedFormData[pageSection1][getEntityAddressKey(0, CONTACT_INFO, PREFERRED)] = false;
    }
    else {
      const phoneAsPreferredMethodKey :string = getEntityAddressKey(0, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
      updatedFormData[pageSection1][phoneAsPreferredMethodKey] = preferredMethod;
      updatedFormData[pageSection1][getEntityAddressKey(0, CONTACT_INFO, PREFERRED)] = true;
      updatedFormData[pageSection1][getEntityAddressKey(1, CONTACT_INFO, PREFERRED)] = false;
    }
  }
  delete updatedFormData[pageSection1][preferredMethodKey];

  const preferredTimeKey = getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES);
  const preferredTime = updatedFormData[pageSection1][preferredTimeKey];
  if (isDefined(preferredTime)) {
    updatedFormData[pageSection1][getEntityAddressKey(0, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;
    updatedFormData[pageSection1][getEntityAddressKey(1, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;
  }
  delete updatedFormData[pageSection1][preferredTimeKey];

  return updatedFormData;
};

export {
  getAddress,
  getEntityIndexToIdMap,
  getOriginalFormData,
  getPersonContactData,
  preprocessContactFormData,
};
