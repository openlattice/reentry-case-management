// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  ATTORNEYS,
  CONTACT_INFO,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  LEVEL,
  PHONE_NUMBER,
  RECOGNIZED_END_DATETIME,
  TYPE,
} = PROPERTY_TYPE_FQNS;

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

/* eslint-disable import/prefer-default-export */
export {
  formatGridData,
};
