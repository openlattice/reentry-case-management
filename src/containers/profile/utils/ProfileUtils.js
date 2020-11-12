/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { getPersonAge } from '../../../utils/PeopleUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  COUNTY_ID,
  EDUCATION,
  NEEDS_ASSESSMENT,
  PERSON_DETAILS,
  STATE_ID,
} = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  HIGHEST_EDUCATION_LEVEL,
  LAST_NAME,
  MARITAL_STATUS,
  MIDDLE_NAME,
  OL_ID_FQN,
  PROJECTED_RELEASE_DATETIME,
  RACE,
  STRING_NUMBER,
} = PROPERTY_TYPE_FQNS;

const getFormattedParticipantData = (participant :Map, participantNeighbors :Map) :Map => {

  const age = getPersonAge(participant);
  const {
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [MIDDLE_NAME]: middleName,
    [RACE]: race,
  } = getEntityProperties(
    participant,
    [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MIDDLE_NAME, RACE],
    EMPTY_FIELD
  );
  const dobAsDateTime :DateTime = DateTime.fromISO(dobISO);
  const dob :string = dobAsDateTime.toLocaleString(DateTime.DATE_SHORT);
  const personDetails :List = participantNeighbors.get(PERSON_DETAILS, List());
  let gender :string = EMPTY_FIELD;
  let maritalStatus :string = EMPTY_FIELD;
  if (!personDetails.isEmpty()) {
    const { [GENDER]: personGender, [MARITAL_STATUS]: personMaritalStatus } = getEntityProperties(
      personDetails.get(0),
      [GENDER, MARITAL_STATUS],
      EMPTY_FIELD
    );
    gender = personGender;
    maritalStatus = personMaritalStatus;
  }
  const stateIDEntity :List = participantNeighbors.get(STATE_ID, List());
  const opusNumber :string = !stateIDEntity.isEmpty() ? stateIDEntity.getIn([0, OL_ID_FQN, 0]) : EMPTY_FIELD;
  const countyIDEntity :List = participantNeighbors.get(COUNTY_ID, List());
  const countyID :string = !countyIDEntity.isEmpty() ? countyIDEntity.getIn([0, STRING_NUMBER, 0]) : EMPTY_FIELD;
  const educationList :List = participantNeighbors.get(EDUCATION, List());
  let education :string = EMPTY_FIELD;
  if (!educationList.isEmpty()) {
    education = educationList.getIn([0, HIGHEST_EDUCATION_LEVEL, 0], EMPTY_FIELD);
  }

  const participantData = Map({
    lastName,
    firstName,
    middleName,
    dob,
    age,
    gender,
    race,
    ethnicity,
    countyID,
    opusNumber,
    maritalStatus,
    education,
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
  return { jailStayEKID, releaseDate: releaseDateTime.isValid ? releaseDateTime.toISODate() : undefined };
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
