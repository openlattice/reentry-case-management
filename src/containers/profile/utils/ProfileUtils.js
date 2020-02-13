// @flow
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonAge } from '../../../utils/PeopleUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  RACE,
} = PROPERTY_TYPE_FQNS;

const getFormattedParticipantData = (participant :Map) :Map => {

  const age = getPersonAge(participant);
  const {
    // $FlowFixMe
    [DOB]: dobISO,
    // $FlowFixMe
    [FIRST_NAME]: firstName,
    // $FlowFixMe
    [LAST_NAME]: lastName,
    // $FlowFixMe
    [MIDDLE_NAME]: middleName,
    // $FlowFixMe
    [RACE]: race
  } = getEntityProperties(participant, [DOB, FIRST_NAME, LAST_NAME, MIDDLE_NAME, RACE]);

  const dob :string = DateTime.fromISO(dobISO).toLocaleString(DateTime.DATE_SHORT);

  const participantData = Map({
    lastName,
    middleName,
    firstName,
    phoneNumber: '---',
    dob,
    age,
    gender: '---',
    race,
  });
  return participantData;
};

/* eslint-disable import/prefer-default-export */
export {
  getFormattedParticipantData
};
