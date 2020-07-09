// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties, getEKID } from '../../../utils/DataUtils';
import { getPersonAge } from '../../../utils/PeopleUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  NEEDS_ASSESSMENT,
  PERSON_DETAILS,
  STATE_ID,
} = APP_TYPE_FQNS;
const {
  COUNTY_ID,
  DATETIME_COMPLETED,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  OL_ID_FQN,
  LAST_NAME,
  PROJECTED_RELEASE_DATETIME,
  RACE,
} = PROPERTY_TYPE_FQNS;

const getFormattedParticipantData = (participant :Map, participantNeighbors :Map) :Map => {

  const age = getPersonAge(participant);
  const {
    [COUNTY_ID]: countyID,
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [RACE]: race,
  } = getEntityProperties(participant, [COUNTY_ID, DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE], EMPTY_FIELD);
  const dobAsDateTime :DateTime = DateTime.fromISO(dobISO);
  const dob :string = dobAsDateTime.toLocaleString(DateTime.DATE_SHORT);
  const personDetails :List = participantNeighbors.get(PERSON_DETAILS, List());
  let gender :string = '';
  if (!personDetails.isEmpty()) gender = personDetails.getIn([0, GENDER]);
  const stateIDEntity :List = participantNeighbors.get(STATE_ID, List());
  const opusNumber :string = !stateIDEntity.isEmpty() ? stateIDEntity.getIn([0, OL_ID_FQN, 0]) : EMPTY_FIELD;

  const participantData = Map({
    lastName,
    firstName,
    dob,
    age,
    gender,
    race,
    ethnicity,
    countyID,
    opusNumber,
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

const getReleaseDateAndEKIDForForm = (jailStays :List) :Object => {
  const releaseDateTime = getMostRecentReleaseDateFromNeighbors(jailStays);
  const sortedJailStays :List = sortEntitiesByDateProperty(jailStays, [PROJECTED_RELEASE_DATETIME]);
  const jailStayEKID :UUID = getEKID(sortedJailStays.last());
  if (!releaseDateTime.isValid) return {};
  return { jailStayEKID, releaseDate: releaseDateTime.toISODate() };
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
  getReleaseDateAndEKIDForForm,
};
