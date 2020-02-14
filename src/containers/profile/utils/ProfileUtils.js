// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonAge } from '../../../utils/PeopleUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { CONTACT_INFO, PERSON_DETAILS } = APP_TYPE_FQNS;
const {
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  MIDDLE_NAME,
  PHONE_NUMBER,
  PREFERRED,
  PROJECTED_RELEASE_DATETIME,
  RACE,
} = PROPERTY_TYPE_FQNS;

const getFormattedParticipantData = (participant :Map, participantNeighbors :Map) :Map => {

  const age = getPersonAge(participant);
  const {
    // $FlowFixMe
    [DOB]: dobISO,
    // $FlowFixMe
    [ETHNICITY]: ethnicity,
    // $FlowFixMe
    [FIRST_NAME]: firstName,
    // $FlowFixMe
    [LAST_NAME]: lastName,
    // $FlowFixMe
    [RACE]: race
  } = getEntityProperties(participant, [DOB, FIRST_NAME, LAST_NAME, MIDDLE_NAME, RACE]);
  const dob :string = DateTime.fromISO(dobISO).toLocaleString(DateTime.DATE_SHORT);
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

const getMostRecentReleaseDate = (jailStays :List) :string => {

  if (jailStays.isEmpty()) return '';
  const sortedJailStays :List = sortEntitiesByDateProperty(jailStays, [PROJECTED_RELEASE_DATETIME]);
  // $FlowFixMe
  const { [PROJECTED_RELEASE_DATETIME]: releaseDateTime } = getEntityProperties(
    sortedJailStays.last(), [PROJECTED_RELEASE_DATETIME]
  );
  return DateTime.fromISO(releaseDateTime).toLocaleString(DateTime.DATE_SHORT);
};

export {
  getFormattedParticipantData,
  getMostRecentReleaseDate,
};
