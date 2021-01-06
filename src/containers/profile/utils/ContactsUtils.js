/*
 * @flow
 */

import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  remove,
  removeIn,
  set,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { format } from 'libphonenumber-js';
import type { UUID } from 'lattice';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { PREFERRED_COMMUNICATION_METHODS } from '../../../utils/constants/DataConstants';
import { EMPTY_FIELD, SPACED_STRING } from '../../../utils/constants/GeneralConstants';
import { preprocessContactsData } from '../../providers/utils/ProvidersUtils';

const {
  INDEX_MAPPERS,
  getEntityAddressKey,
  getPageSectionKey,
  parseEntityAddressKey,
} = DataProcessingUtils;
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
  IS_CELL_PHONE,
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

const getEmail = (contactInfoEntities :List) :string => {
  const email = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
  if (isDefined(email)) {
    const { [EMAIL]: emailAddress } = getEntityProperties(email, [EMAIL]);
    return emailAddress;
  }
  return SPACED_STRING;
};

const getCellPhone = (contactInfoEntities :List) :string => {
  const cellPhone = contactInfoEntities.find((contact :Map) => contact.has(IS_CELL_PHONE));
  if (isDefined(cellPhone)) {
    const { [PHONE_NUMBER]: cellPhoneNumber } = getEntityProperties(cellPhone, [PHONE_NUMBER]);
    return cellPhoneNumber;
  }
  return SPACED_STRING;
};

const getHomePhone = (contactInfoEntities :List) :string => {
  const homePhone = contactInfoEntities
    .find((contact :Map) => contact.has(PHONE_NUMBER) && !contact.has(IS_CELL_PHONE));
  if (isDefined(homePhone)) {
    const { [PHONE_NUMBER]: homePhoneNumber } = getEntityProperties(homePhone, [PHONE_NUMBER]);
    return homePhoneNumber;
  }
  return SPACED_STRING;
};

const getPreferredTimeOfContact = (contactInfoEntities :List) :?string => {
  const contactWithPreferredTime = contactInfoEntities.find((contact :Map) => contact.has(GENERAL_NOTES));
  if (isDefined(contactWithPreferredTime)) {
    const { [GENERAL_NOTES]: preferredTime } = getEntityProperties(contactWithPreferredTime, [GENERAL_NOTES]);
    return preferredTime;
  }
  return undefined;
};

const getPreferredMethodOfContact = (contactInfoEntities :List) :?string => {
  const preferredContact = contactInfoEntities.find((contact :Map) => contact.has(PREFERRED)
    && contact.getIn([PREFERRED, 0]) === true);
  if (isDefined(preferredContact)) {
    const { [PREFERRED_METHOD_OF_CONTACT]: preferredMethod } = getEntityProperties(
      preferredContact,
      [PREFERRED_METHOD_OF_CONTACT]
    );
    return preferredMethod;
  }
  return undefined;
};

const getPersonContactData = (participantNeighbors :Map) :Map => {
  const contactData :Map = Map().withMutations((map :Map) => {
    const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());
    const preferredMethodOfContact = getPreferredMethodOfContact(contactInfoEntities);
    map.set('preferredMethod', preferredMethodOfContact);

    const email = getEmail(contactInfoEntities);
    map.set('email', email === SPACED_STRING ? EMPTY_FIELD : email);

    const cellPhoneNumber = getCellPhone(contactInfoEntities);
    map.set('cellPhone', cellPhoneNumber === SPACED_STRING ? EMPTY_FIELD : format(cellPhoneNumber, 'US', 'NATIONAL'));

    const homePhoneNumber = getHomePhone(contactInfoEntities);
    map.set('homePhone', homePhoneNumber === SPACED_STRING ? EMPTY_FIELD : format(homePhoneNumber, 'US', 'NATIONAL'));

    const preferredTimeOfContact = getPreferredTimeOfContact(contactInfoEntities);
    map.set('preferredTime', preferredTimeOfContact);
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
    if (street && street.length) addressString = street;
    if (city && city.length) addressString = `${addressString} ${city}`;
    if (usState && usState.length) addressString = `${addressString}${city.length ? ',' : ''} ${usState}`;
    if (zip && zip.length) addressString = `${addressString} ${zip}`;
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

  const preferredMethodOfContact = getPreferredMethodOfContact(contactInfoEntities);
  originalFormData[getPageSectionKey(1, 1)] = {
    [getEntityAddressKey(-1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)]: preferredMethodOfContact,
  };
  const preferredTime = getPreferredTimeOfContact(contactInfoEntities);
  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES)] = preferredTime;

  const email = getEmail(contactInfoEntities);
  const cellPhoneNumber = getCellPhone(contactInfoEntities);
  const homePhoneNumber = getHomePhone(contactInfoEntities);
  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)] = format(
    homePhoneNumber,
    'US',
    'NATIONAL'
  );
  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)] = format(
    cellPhoneNumber,
    'US',
    'NATIONAL'
  );
  originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(2, CONTACT_INFO, EMAIL)] = email;

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
      const homePhoneEntity = contactInfoEntities
        .find((contact :Map) => contact.has(PHONE_NUMBER) && !contact.has(IS_CELL_PHONE));
      if (isDefined(homePhoneEntity)) map.setIn([CONTACT_INFO, 0], getEKID(homePhoneEntity));

      const cellPhoneEntity = contactInfoEntities.find((contact :Map) => contact.has(IS_CELL_PHONE));
      if (isDefined(cellPhoneEntity)) map.setIn([CONTACT_INFO, 1], getEKID(cellPhoneEntity));

      const emailEntity = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
      if (isDefined(emailEntity)) map.setIn([CONTACT_INFO, 2], getEKID(emailEntity));
    }
  });

  return entityIndexToIdMap;
};

const updateDataForNewSubmission = (
  initialFormData :Object,
  formDataForEdit :Object,
  formDataForNewSubmission :Object,
  originalPath :string[],
  newPath :string[],
  isPreferredMethod :boolean,
  preferredMethod ? :string,
  entityIndex ? :number = 0,
) => {

  let updatedDataForNewSubmission = formDataForNewSubmission;
  let updatedDataForEdit = formDataForEdit;

  const value = getIn(initialFormData, originalPath);
  updatedDataForNewSubmission = setIn(updatedDataForNewSubmission, newPath, value || SPACED_STRING);
  updatedDataForEdit = removeIn(updatedDataForEdit, originalPath);

  if (isPreferredMethod) {
    updatedDataForNewSubmission = setIn(
      updatedDataForNewSubmission,
      [getPageSectionKey(1, 1), getEntityAddressKey(entityIndex, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT)],
      preferredMethod
    );
    updatedDataForNewSubmission = setIn(
      updatedDataForNewSubmission,
      [getPageSectionKey(1, 1), getEntityAddressKey(entityIndex, CONTACT_INFO, PREFERRED)],
      true
    );
  }

  return { updatedDataForEdit, updatedDataForNewSubmission };
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

  const existingHomePhone = contactInfoEntities
    .find((contact :Map) => contact.has(PHONE_NUMBER) && !contact.has(IS_CELL_PHONE));
  const homePhoneKey = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
  if (!isDefined(existingHomePhone)) {
    const { updatedDataForEdit, updatedDataForNewSubmission } = updateDataForNewSubmission(
      formData,
      updatedFormData,
      newData,
      [pageSection1, homePhoneKey],
      [pageSection1, homePhoneKey],
      preferredMethod === PREFERRED_COMMUNICATION_METHODS[0],
      preferredMethod,
      0,
    );
    newData = updatedDataForNewSubmission;
    updatedFormData = updatedDataForEdit;
    associations.push([CONTACTED_VIA, personEKID, PEOPLE, 0, CONTACT_INFO, {}]);
  }

  const existingCellPhone = contactInfoEntities.find((contact :Map) => contact.has(IS_CELL_PHONE));
  const cellPhoneKey = getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER);
  if (!isDefined(existingCellPhone)) {
    const index = isDefined(existingHomePhone) ? 0 : 1;
    const { updatedDataForEdit, updatedDataForNewSubmission } = updateDataForNewSubmission(
      formData,
      updatedFormData,
      newData,
      [pageSection1, cellPhoneKey],
      [pageSection1, getEntityAddressKey(index, CONTACT_INFO, PHONE_NUMBER)],
      preferredMethod === PREFERRED_COMMUNICATION_METHODS[1] || preferredMethod === PREFERRED_COMMUNICATION_METHODS[2],
      preferredMethod,
      index,
    );
    newData = updatedDataForNewSubmission;
    newData = setIn(newData, [pageSection1, getEntityAddressKey(index, CONTACT_INFO, IS_CELL_PHONE)], true);
    updatedFormData = updatedDataForEdit;
    associations.push([CONTACTED_VIA, personEKID, PEOPLE, index, CONTACT_INFO, {}]);
  }

  const existingEmail = contactInfoEntities.find((contact :Map) => contact.has(EMAIL));
  const emailKey = getEntityAddressKey(2, CONTACT_INFO, EMAIL);
  if (!isDefined(existingEmail)) {
    let index = 0;
    if (isDefined(existingHomePhone) || isDefined(existingCellPhone)) index = 1;
    if (isDefined(existingHomePhone) && isDefined(existingCellPhone)) index = 2;

    const { updatedDataForEdit, updatedDataForNewSubmission } = updateDataForNewSubmission(
      formData,
      updatedFormData,
      newData,
      [pageSection1, emailKey],
      [pageSection1, getEntityAddressKey(index, CONTACT_INFO, EMAIL)],
      preferredMethod === PREFERRED_COMMUNICATION_METHODS[3],
      preferredMethod,
      index,
    );
    newData = updatedDataForNewSubmission;
    updatedFormData = updatedDataForEdit;
    associations.push([CONTACTED_VIA, personEKID, PEOPLE, index, CONTACT_INFO, {}]);
  }

  const originalPreferredMethod = getIn(originalFormData, [pageSection1, preferredMethodKey]);

  // if (isDefined(existingPhone) && isDefined(existingEmail)) {
  if (originalPreferredMethod !== preferredMethod && isDefined(preferredMethod)) {
    const originalPreferredMethodOptionsIndex :number = PREFERRED_COMMUNICATION_METHODS
      .findIndex((option :string) => option === originalPreferredMethod);

    if (originalPreferredMethodOptionsIndex === 0) {
      updatedFormData = setIn(
        updatedFormData,
        [pageSection1, getEntityAddressKey(0, CONTACT_INFO, PREFERRED)],
        false
      );
    }
    if (originalPreferredMethodOptionsIndex === 1 || originalPreferredMethodOptionsIndex === 2) {
      updatedFormData = setIn(
        updatedFormData,
        [pageSection1, getEntityAddressKey(1, CONTACT_INFO, PREFERRED)],
        false
      );
    }
    if (originalPreferredMethodOptionsIndex === 3) {
      updatedFormData = setIn(
        updatedFormData,
        [pageSection1, getEntityAddressKey(2, CONTACT_INFO, PREFERRED)],
        false
      );
    }

    if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[3] && isDefined(existingEmail)) {
      const emailAsPreferredMethodKey :string = getEntityAddressKey(2, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
      updatedFormData = setIn(updatedFormData, [pageSection1, emailAsPreferredMethodKey], preferredMethod);
      updatedFormData = setIn(updatedFormData, [pageSection1, getEntityAddressKey(2, CONTACT_INFO, PREFERRED)], true);
    }
    else if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[0] && isDefined(existingHomePhone)) {
      const homePhoneAsPreferredMethodKey :string = getEntityAddressKey(0, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
      updatedFormData = setIn(updatedFormData, [pageSection1, homePhoneAsPreferredMethodKey], preferredMethod);
      updatedFormData = setIn(updatedFormData, [pageSection1, getEntityAddressKey(0, CONTACT_INFO, PREFERRED)], true);
    }
    else if (preferredMethod === PREFERRED_COMMUNICATION_METHODS[1]
        && preferredMethod === PREFERRED_COMMUNICATION_METHODS[2]
        && isDefined(existingCellPhone)) {
      const cellPhoneAsPreferredMethodKey :string = getEntityAddressKey(1, CONTACT_INFO, PREFERRED_METHOD_OF_CONTACT);
      updatedFormData = setIn(updatedFormData, [pageSection1, cellPhoneAsPreferredMethodKey], preferredMethod);
      updatedFormData = setIn(updatedFormData, [pageSection1, getEntityAddressKey(1, CONTACT_INFO, PREFERRED)], true);
    }
  }
  // }
  updatedFormData = removeIn(updatedFormData, [pageSection1, preferredMethodKey]);

  const preferredTimeKey = getEntityAddressKey(-1, CONTACT_INFO, GENERAL_NOTES);
  const preferredTime = getIn(updatedFormData, [pageSection1, preferredTimeKey]);
  const originalPreferredTime = getIn(originalFormData, [pageSection1, preferredTimeKey]);
  if (originalPreferredTime !== preferredTime && isDefined(preferredTime)) {
    const newDataKeys = Object.keys(newData[pageSection1]);
    newDataKeys.forEach((entityAddressKey) => {
      const { entityIndex, propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      const propertyType = propertyTypeFQN.toString();
      if (propertyType !== PREFERRED.toString()
        || !propertyType !== PREFERRED_METHOD_OF_CONTACT.toString()
        || !propertyType !== IS_CELL_PHONE.toString()) {
        newData = setIn(
          newData,
          [pageSection1, getEntityAddressKey(entityIndex, CONTACT_INFO, GENERAL_NOTES)],
          preferredTime
        );
      }
    });

    const existingDataKeys = Object.keys(updatedFormData[pageSection1]);
    existingDataKeys.forEach((entityAddressKey) => {
      const { entityIndex, propertyTypeFQN } = parseEntityAddressKey(entityAddressKey);
      const propertyType = propertyTypeFQN.toString();
      if (propertyType !== PREFERRED.toString()
        || !propertyType !== PREFERRED_METHOD_OF_CONTACT.toString()
        || !propertyType !== IS_CELL_PHONE.toString()) {
        updatedFormData = setIn(
          updatedFormData,
          [pageSection1, getEntityAddressKey(entityIndex, CONTACT_INFO, GENERAL_NOTES)],
          preferredTime
        );
      }
    });
  }
  updatedFormData = removeIn(updatedFormData, [pageSection1, preferredTimeKey]);
  newData = removeIn(newData, [pageSection1, preferredTimeKey]);

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
            map.set('phone', phone === SPACED_STRING ? EMPTY_FIELD : format(phone, 'US', 'NATIONAL'));
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
