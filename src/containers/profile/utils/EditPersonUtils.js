// @flow
import { List, Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE, PERSON_DETAILS, STATE_ID } = APP_TYPE_FQNS;
const {
  COUNTY_ID,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  MARITAL_STATUS,
  MIDDLE_NAME,
  OL_ID_FQN,
  PERSON_SEX,
  RACE,
} = PROPERTY_TYPE_FQNS;

const getPersonFormData = (participant :Map) :Object => {
  if (participant.isEmpty()) return {};
  const {
    [COUNTY_ID]: countyID,
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName,
    [PERSON_SEX]: sex,
    [RACE]: race,
  } = getEntityProperties(
    participant,
    [COUNTY_ID, DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PERSON_SEX, RACE],
    ''
  );
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: lastName,
      [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: firstName,
      [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: middleName,
      [getEntityAddressKey(0, PEOPLE, DOB)]: dobISO,
      [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: countyID,
      [getEntityAddressKey(0, PEOPLE, PERSON_SEX)]: sex,
      [getEntityAddressKey(0, PEOPLE, RACE)]: race,
      [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: ethnicity,
    }
  };
  return originalFormData;
};

const getPersonDetailsFormData = (participantNeighborMap :Map) :Object => {
  if (participantNeighborMap.isEmpty()) return {};
  const personDetails = participantNeighborMap.get(PERSON_DETAILS, List());
  if (personDetails.isEmpty()) return {};
  const {
    [MARITAL_STATUS]: maritalStatus,
    [GENDER]: gender
  } = getEntityProperties(personDetails.get(0) || Map(), [MARITAL_STATUS, GENDER]);
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: gender,
      [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: maritalStatus,
    }
  };
  return originalFormData;
};

const getStateIdFormData = (participantNeighborMap :Map) :Object => {
  if (participantNeighborMap.isEmpty()) return {};
  const personId :List = participantNeighborMap.get(STATE_ID, List());
  if (personId.isEmpty()) return {};
  const { [OL_ID_FQN]: opusNumber } = getEntityProperties(personId.get(0) || Map(), [OL_ID_FQN]);
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: opusNumber,
    }
  };
  return originalFormData;
};

export {
  getPersonDetailsFormData,
  getPersonFormData,
  getStateIdFormData,
};
