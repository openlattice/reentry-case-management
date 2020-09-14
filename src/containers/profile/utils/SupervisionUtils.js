// @flow
import { List, Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ATTORNEYS,
  CONTACT_INFO,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  LEVEL,
  PHONE_NUMBER,
  RECOGNIZED_END_DATETIME,
  TYPE,
} = PROPERTY_TYPE_FQNS;

// SupervisionCard

const formatGridData = (participantNeighbors :Map, supervisionNeighbors :Map) :Map => {
  const supervisionList :List = participantNeighbors.get(PROBATION_PAROLE, List());
  const {
    [LEVEL]: level,
    [RECOGNIZED_END_DATETIME]: endDateTime,
    [TYPE]: supervisionType
  } = getEntityProperties(supervisionList.get(0) || Map(), [LEVEL, RECOGNIZED_END_DATETIME, TYPE]);

  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());
  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());

  const contactInfo :Map = supervisionNeighbors.get(CONTACT_INFO, Map());
  const officerContactInfo :List = contactInfo.get(OFFICERS, List());
  const attorneyContactInfo :List = contactInfo.get(ATTORNEYS, List());

  let officerPhone :string = EMPTY_FIELD;
  let officerEmail :string = EMPTY_FIELD;
  officerContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      officerPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      officerEmail = contact.getIn([EMAIL, 0]);
    }
  });

  let attorneyPhone :string = EMPTY_FIELD;
  let attorneyEmail :string = EMPTY_FIELD;
  attorneyContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      attorneyPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      attorneyEmail = contact.getIn([EMAIL, 0]);
    }
  });

  const gridData = Map({
    supervisionType,
    level,
    endDate: DateTime.fromISO(endDateTime).toLocaleString(DateTime.DATE_SHORT),
    officerName: getPersonFullName(officer),
    officerPhone,
    officerEmail,
    attorneyName: getPersonFullName(attorney),
    attorneyPhone,
    attorneyEmail,
  });
  return gridData;
};

// SupervisionForm

const getOriginalFormData = (participantNeighbors :Map, supervisionNeighbors :Map) :Object => {

  const originalFormData = {};

  if (participantNeighbors.isEmpty()) return originalFormData;
  const supervision = participantNeighbors.get(PROBATION_PAROLE, List());
  const {
    [LEVEL]: level,
    [RECOGNIZED_END_DATETIME]: endDateTimeISO,
    [TYPE]: type
  } = getEntityProperties(supervision.get(0) || Map(), [LEVEL, RECOGNIZED_END_DATETIME, TYPE], undefined);
  const endDateTime = DateTime.fromISO(endDateTimeISO);

  originalFormData[getPageSectionKey(1, 1)] = {
    [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: type,
    [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: endDateTime.isValid
      ? endDateTime.toISODate()
      : undefined,
    [getEntityAddressKey(0, PROBATION_PAROLE, LEVEL)]: level,
  };

  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());
  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());

  const { [FIRST_NAME]: officerFirstName, [LAST_NAME]: officerLastName } = getEntityProperties(
    officer,
    [FIRST_NAME, LAST_NAME],
    undefined
  );

  originalFormData[getPageSectionKey(1, 2)] = {
    [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: officerFirstName,
    [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: officerLastName,
  };

  const { [FIRST_NAME]: attorneyFirstName, [LAST_NAME]: attorneyLastName } = getEntityProperties(
    attorney,
    [FIRST_NAME, LAST_NAME],
    undefined
  );

  originalFormData[getPageSectionKey(1, 4)] = {
    [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: attorneyFirstName,
    [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: attorneyLastName,
  };

  const contactInfo :Map = supervisionNeighbors.get(CONTACT_INFO, Map());
  const officerContactInfo :List = contactInfo.get(OFFICERS, List());
  const attorneyContactInfo :List = contactInfo.get(ATTORNEYS, List());

  let officerPhone;
  let officerEmail;
  officerContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      officerPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      officerEmail = contact.getIn([EMAIL, 0]);
    }
  });

  originalFormData[getPageSectionKey(1, 3)] = {
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: officerPhone,
    [getEntityAddressKey(0, CONTACT_INFO, EMAIL)]: officerEmail,
  };

  let attorneyPhone;
  let attorneyEmail;
  attorneyContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      attorneyPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      attorneyEmail = contact.getIn([EMAIL, 0]);
    }
  });

  originalFormData[getPageSectionKey(1, 5)] = {
    [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: attorneyPhone,
    [getEntityAddressKey(0, CONTACT_INFO, EMAIL)]: attorneyEmail,
  };

  return originalFormData;
};

export {
  formatGridData,
  getOriginalFormData,
};
