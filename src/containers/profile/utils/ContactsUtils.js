// @flow
import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  hasIn,
  remove,
  removeIn,
  set,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';
import { preprocessContactsData } from '../../providers/utils/ProvidersUtils';

const { INDEX_MAPPERS, getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  CONTACTED_VIA,
  CONTACT_INFO,
  EMERGENCY_CONTACT,
  EMERGENCY_CONTACT_INFO,
  IS_EMERGENCY_CONTACT_FOR,
  LOCATION,
  MANUAL_LOCATED_AT,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  CITY,
  EMAIL,
  ENTITY_KEY_ID,
  FIRST_NAME,
  GENERAL_NOTES,
  LAST_NAME,
  PHONE_NUMBER,
  PREFERRED,
  PREFERRED_METHOD_OF_CONTACT,
  RELATIONSHIP,
  STREET,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

// Participant Contact Info:

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

const preprocessContactFormData = (
  formData :Object,
  originalFormData :Object,
  address :Map,
  contactInfoEntities :List,
  personEKID :UUID,
) :Map => {

  const pageSection1 = getPageSectionKey(1, 1);
  const pageSection2 = getPageSectionKey(1, 2);

  let updatedFormData = formData;
  let newData = {
    [pageSection1]: {},
    [pageSection2]: {},
  };
  const associations :any[][] = [];

  if (!isDefined(address) || address.isEmpty()) {
    const addressData = get(formData, pageSection2);
    if (isDefined(addressData) && Object.values(addressData).length) {
      newData = set(newData, pageSection2, addressData);
      associations.push([MANUAL_LOCATED_AT, personEKID, PEOPLE, 0, LOCATION, {}]);
      updatedFormData = remove(updatedFormData, pageSection2);
    }
  }

  const preferredMethodKey = getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
  const preferredMethod = updatedFormData[pageSection1][preferredMethodKey];
  const originalPreferredMethod = originalFormData[pageSection1][preferredMethodKey];

  const existingPhone = contactInfoEntities.find((contact :Map) => contact.has(PHONE_NUMBER));
  const phoneKey = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
  if (!isDefined(existingPhone)) {
    const phoneData = getIn(formData, [pageSection1, phoneKey]);
    newData = setIn(newData, [pageSection1, phoneKey], phoneData || '');
    updatedFormData = removeIn(updatedFormData, [pageSection1, phoneKey]);
    associations.push([CONTACTED_VIA, personEKID, PEOPLE, 0, CONTACT_INFO, {}]);

    if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[0]
      || preferredMethod === PREFERRED_COMMUNICATION_METHODS[1]) {
      newData = setIn(
        newData,
        [pageSection1, getEntityAddressKey(0, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)],
        preferredMethod
      );
      newData = setIn(
        newData,
        [pageSection1, getEntityAddressKey(0, CONTACT_INFO, PREFERRED)],
        true
      );
    }
  }

  const existingEmail = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
  const emailKey = getEntityAddressKey(1, CONTACT_INFO, EMAIL);
  if (!isDefined(existingEmail)) {
    const index = isDefined(existingPhone) ? 0 : 1;
    const emailData = getIn(formData, [pageSection1, emailKey]);
    newData = setIn(newData, [pageSection1, getEntityAddressKey(index, CONTACT_INFO, EMAIL)], emailData || '');
    updatedFormData = removeIn(updatedFormData, [pageSection1, emailKey]);
    associations.push([CONTACTED_VIA, personEKID, PEOPLE, index, CONTACT_INFO, {}]);

    if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[2]) {
      newData = setIn(
        newData,
        [pageSection1, getEntityAddressKey(index, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)],
        preferredMethod
      );
      newData = setIn(
        newData,
        [pageSection1, getEntityAddressKey(index, CONTACT_INFO, PREFERRED)],
        true
      );
    }
  }

  if (isDefined(existingPhone) && isDefined(existingEmail)) {
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
  }
  updatedFormData = removeIn(updatedFormData, [pageSection1, preferredMethodKey]);

  const preferredTimeKey = getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES);
  const preferredTime = updatedFormData[pageSection1][preferredTimeKey];
  if (isDefined(preferredTime)) {
    if (Object.values(newData[pageSection1]).length) {
      newData[pageSection1][getEntityAddressKey(0, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;

      if (hasIn(newData, [pageSection1, getEntityAddressKey(1, CONTACT_INFO, EMAIL)])) {
        newData[pageSection1][getEntityAddressKey(1, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;
      }
    }
    else {
      updatedFormData[pageSection1][getEntityAddressKey(0, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;
      updatedFormData[pageSection1][getEntityAddressKey(1, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;
    }
  }
  delete updatedFormData[pageSection1][preferredTimeKey];
  delete newData[pageSection1][preferredTimeKey];

  return { associations, newData, updatedFormData };
};

// Emergency Contacts:

const formatEmergencyContactData = (emergencyContactInfoByContact :Map, participantNeighbors :Map) :List => {
  if (!participantNeighbors.has(EMERGENCY_CONTACT)) return List();

  const emergencyContactData :List = List().withMutations((list :List) => {
    const emergencyContacts :List = participantNeighbors.get(EMERGENCY_CONTACT, List());
    emergencyContacts.forEach((contactPerson :Map) => {
      const contactPersonEKID :UUID = getEKID(contactPerson);
      const relationship :string = participantNeighbors.getIn([
        IS_EMERGENCY_CONTACT_FOR,
        contactPersonEKID,
        RELATIONSHIP,
        0
      ], '');
      const contactPersonName :string = getPersonFullName(contactPerson);
      const contactInfo :List = emergencyContactInfoByContact.get(contactPersonEKID, List());

      const emergencyContactRow :Map = Map().withMutations((map :Map) => {
        map.set('name', contactPersonName);
        map.set('relationship', relationship);

        contactInfo.forEach((contact :Map) => {
          if (contact.has(PHONE_NUMBER)) {
            const { [PHONE_NUMBER]: phone } = getEntityProperties(contact, [PHONE_NUMBER]);
            map.set('phone', phone);
          }
          if (contact.has(EMAIL)) {
            const { [EMAIL]: email } = getEntityProperties(contact, [EMAIL]);
            map.set('email', email);
          }
        });
      });
      list.push(emergencyContactRow);
    });
  });
  return emergencyContactData;
};

const getOriginalEmergencyFormData = (emergencyContactInfoByContact :Map, participantNeighbors :Map) :Object => {

  const pageSection1 = getPageSectionKey(1, 1);
  const originalFormData = {
    [pageSection1]: []
  };
  const emergencyContacts :List = participantNeighbors.get(EMERGENCY_CONTACT, List());
  emergencyContacts.forEach((contactPerson :Map) => {
    const contactObj :Object = {};

    const contactPersonEKID :UUID = getEKID(contactPerson);
    const relationship :string = participantNeighbors.getIn([
      IS_EMERGENCY_CONTACT_FOR,
      contactPersonEKID,
      RELATIONSHIP,
      0
    ], '');
    contactObj[getEntityAddressKey(-1, IS_EMERGENCY_CONTACT_FOR, RELATIONSHIP)] = relationship;

    const {
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(contactPerson, [FIRST_NAME, LAST_NAME]);
    contactObj[getEntityAddressKey(-1, EMERGENCY_CONTACT, FIRST_NAME)] = firstName;
    contactObj[getEntityAddressKey(-1, EMERGENCY_CONTACT, LAST_NAME)] = lastName;

    const contactInfo :List = emergencyContactInfoByContact.get(contactPersonEKID, List());
    contactInfo.forEach((contact :Map) => {
      if (contact.has(PHONE_NUMBER)) {
        const { [PHONE_NUMBER]: phone } = getEntityProperties(contact, [PHONE_NUMBER]);
        contactObj[getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER)] = phone;
      }
      if (contact.has(EMAIL)) {
        const { [EMAIL]: email } = getEntityProperties(contact, [EMAIL]);
        contactObj[getEntityAddressKey(-2, EMERGENCY_CONTACT_INFO, EMAIL)] = email;
      }
    });

    originalFormData[pageSection1].push(contactObj);

  });

  return originalFormData;
};

const getEmergencyEntityIndexToIdMap = (emergencyContactInfoByContact :Map, participantNeighbors :Map) => {
  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    const emergencyContactPeople :List = participantNeighbors.get(EMERGENCY_CONTACT, List());
    emergencyContactPeople.forEach((person :Map, index :number) => {
      const personEKID :UUID = getEKID(person);
      map.setIn([EMERGENCY_CONTACT, -1, index], personEKID);

      const isEmergencyContactForEKID :UUID = participantNeighbors.getIn([
        IS_EMERGENCY_CONTACT_FOR,
        personEKID,
        ENTITY_KEY_ID,
        0], '');
      map.setIn([IS_EMERGENCY_CONTACT_FOR, -1, index], isEmergencyContactForEKID);

      const contactInfo :List = emergencyContactInfoByContact.get(personEKID, List());
      contactInfo.forEach((contact :Map) => {
        if (contact.has(PHONE_NUMBER)) {
          map.setIn([EMERGENCY_CONTACT_INFO, -1, index], getEKID(contact));
        }
        if (contact.has(EMAIL)) {
          map.setIn([EMERGENCY_CONTACT_INFO, -2, index], getEKID(contact));
        }
      });
    });
  });
  return entityIndexToIdMap;
};

const preprocessNewEmergencyContactData = (formData :Object, originalFormData :Object) :Object => {

  const originalNumberOfContacts :number = originalFormData[getPageSectionKey(1, 1)].length;
  const contactsWereAdded :boolean = formData[getPageSectionKey(1, 1)].length
    > originalNumberOfContacts;
  if (!contactsWereAdded) return { formDataWithNewContactsOnly: {}, mappers: Map() };

  const mappers :Map = Map().withMutations((map :Map) => {
    const indexMappers :Map = Map().withMutations((indexMap :Map) => {
      indexMap.set(getEntityAddressKey(-1, EMERGENCY_CONTACT_INFO, PHONE_NUMBER), (i) => i * 2);
      indexMap.set(getEntityAddressKey(-2, EMERGENCY_CONTACT_INFO, EMAIL), (i) => i * 2 + 1);
    });
    map.set(INDEX_MAPPERS, indexMappers);
  });

  const newContactsInFormData = formData[getPageSectionKey(1, 1)].slice(originalNumberOfContacts);
  const formDataWithNewContactsOnly = preprocessContactsData(
    { [getPageSectionKey(1, 1)]: newContactsInFormData },
    EMERGENCY_CONTACT_INFO
  );

  return { formDataWithNewContactsOnly, mappers };
};

const getAssociationsForNewEmergencyContacts = (formData :Object, personEKID :UUID) => {
  const associations :Array<Array<*>> = [];
  const contacts :Object[] = formData[getPageSectionKey(1, 1)];

  if (!isDefined(contacts) || !contacts.length) return associations;

  contacts.forEach((contactObj :Object, index :number) => {
    associations.push([IS_EMERGENCY_CONTACT_FOR, index, EMERGENCY_CONTACT, personEKID, PEOPLE, {
      // $FlowFixMe
      [RELATIONSHIP]: [contactObj[getEntityAddressKey(-1, IS_EMERGENCY_CONTACT_FOR, RELATIONSHIP)]],
    }]);

    associations.push([CONTACTED_VIA, index, EMERGENCY_CONTACT, index * 2, EMERGENCY_CONTACT_INFO]);
    associations.push([CONTACTED_VIA, index, EMERGENCY_CONTACT, index * 2 + 1, EMERGENCY_CONTACT_INFO]);
  });
  return associations;
};

const removeRelationshipFromFormData = (formData :Object) => {
  const updatedFormData = formData;
  const pageSection1 = [getPageSectionKey(1, 1)];
  const contacts = formData[pageSection1];
  if (!isDefined(contacts) || !contacts.length) return updatedFormData;

  contacts.forEach((contactObj :Object, index :number) => {
    delete updatedFormData[pageSection1][index][getEntityAddressKey(-1, IS_EMERGENCY_CONTACT_FOR, RELATIONSHIP)];
  });
  return updatedFormData;
};

const preprocessEditedEmergencyContactData = (
  formData :Object,
  originalFormData :Object,
  formDataWithNewContactsOnly :Object
) :Object => {

  const pageSection1 = getPageSectionKey(1, 1);
  const defaultReturnObject :Object = { editedContactsAsImmutable: Map(), originalFormContactsAsImmutable: Map() };
  if ((!formData[pageSection1].length && !originalFormData[pageSection1].length)) {
    return defaultReturnObject;
  }

  const allContactsInFormData :Object[] = formData[pageSection1];
  const numberOfNewContacts :number = formDataWithNewContactsOnly[pageSection1]
    ? formDataWithNewContactsOnly[pageSection1].length
    : 0;
  const editedContacts :Object[] = numberOfNewContacts
    ? allContactsInFormData.slice(0, allContactsInFormData.length - numberOfNewContacts)
    : allContactsInFormData;

  if (!Object.values(editedContacts).length) {
    return defaultReturnObject;
  }
  const editedContactsAsImmutable :List = fromJS(editedContacts);
  const originalFormContactsAsImmutable :List = fromJS(originalFormData[pageSection1]);

  const contactsHaveChanged :boolean = !originalFormContactsAsImmutable.equals(editedContactsAsImmutable);
  if (!contactsHaveChanged) return { editedContactsAsImmutable: Map(), originalFormContactsAsImmutable: Map() };
  return { editedContactsAsImmutable, originalFormContactsAsImmutable };
};

export {
  formatEmergencyContactData,
  getAddress,
  getAssociationsForNewEmergencyContacts,
  getEmergencyEntityIndexToIdMap,
  getEntityIndexToIdMap,
  getOriginalEmergencyFormData,
  getOriginalFormData,
  getPersonContactData,
  preprocessContactFormData,
  preprocessEditedEmergencyContactData,
  preprocessNewEmergencyContactData,
  removeRelationshipFromFormData,
};
