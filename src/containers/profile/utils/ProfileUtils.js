// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonAge } from '../../../utils/PeopleUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { CONTACT_INFO, NEEDS_ASSESSMENT, PERSON_DETAILS } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  PHONE_NUMBER,
  PREFERRED,
  PROJECTED_RELEASE_DATETIME,
  RACE,
} = PROPERTY_TYPE_FQNS;

const getFormattedParticipantData = (participant :Map, participantNeighbors :Map) :Map => {

  const age = getPersonAge(participant);
  const {
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [RACE]: race
  } = getEntityProperties(participant, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE]);
  const dobAsDateTime :DateTime = DateTime.fromISO(dobISO);
  const dob :string = dobAsDateTime.toLocaleString(DateTime.DATE_SHORT);
  const personDetails :List = participantNeighbors.get(PERSON_DETAILS, List());
  let gender :string = '';
  if (!personDetails.isEmpty()) gender = personDetails.getIn([0, GENDER]);
  const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());
  let preferredContact :string = '';
  const preferredContactEntity :Map = contactInfoEntities.find((contact :Map) => contact.has(PREFERRED));
  if (preferredContactEntity && preferredContactEntity.has(EMAIL)) {
    preferredContact = preferredContactEntity.getIn([EMAIL, 0]);
  }
  if (preferredContactEntity && preferredContactEntity.has(PHONE_NUMBER)) {
    preferredContact = preferredContactEntity.getIn([PHONE_NUMBER, 0]);
  }

  const participantData = Map({
    lastName,
    firstName,
    dob,
    age,
    gender,
    race,
    ethnicity,
    preferredContact,
  });
  return participantData;
};

const getMostRecentReleaseDateFromNeighbors = (jailStays :List) :DateTime => {
  const sortedJailStays :List = sortEntitiesByDateProperty(jailStays, [PROJECTED_RELEASE_DATETIME]);
  const { [PROJECTED_RELEASE_DATETIME]: releaseDateTime } = getEntityProperties(
    sortedJailStays.last(), [PROJECTED_RELEASE_DATETIME]
  );
  return DateTime.fromISO(releaseDateTime);
};

const getMostRecentReleaseDate = (jailStays :List) :string => {
  const releaseDateTime = getMostRecentReleaseDateFromNeighbors(jailStays);
  if (!releaseDateTime.isValid) return '';
  return releaseDateTime.toLocaleString(DateTime.DATE_SHORT);
};

const getReleaseDateForFormData = (jailStays :List) :string => {
  const releaseDateTime = getMostRecentReleaseDateFromNeighbors(jailStays);
  if (!releaseDateTime.isValid) return '';
  return releaseDateTime.toISODate();
};

const getReentryEnrollmentDate = (participantNeighbors :Map) :string => {
  const enrollmentDateTimeObj :DateTime = DateTime.fromISO(
    participantNeighbors.getIn([NEEDS_ASSESSMENT, 0, DATETIME_COMPLETED, 0], '')
  );
  const enrollmentDate = enrollmentDateTimeObj.isValid
    ? enrollmentDateTimeObj.toLocaleString(DateTime.DATE_SHORT)
    : EMPTY_FIELD;
  return enrollmentDate;
};

export {
  getFormattedParticipantData,
  getMostRecentReleaseDate,
  getReentryEnrollmentDate,
  getReleaseDateForFormData,
};
