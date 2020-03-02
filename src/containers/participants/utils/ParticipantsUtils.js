// @flow
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { MANUAL_JAIL_STAYS, NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  PROJECTED_RELEASE_DATETIME
} = PROPERTY_TYPE_FQNS;

const aggregateResultsData = (people :List, personNeighbors :Map, jailNamesByJailStayEKID :Map) :List => {

  let data :List = List();
  people.forEach((person :Map) => {
    const { [DOB]: dob, [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(person, [
      DOB,
      FIRST_NAME,
      LAST_NAME
    ]);
    const personName :string = (typeof firstName === 'string' && typeof lastName === 'string')
      ? `${firstName} ${lastName}`
      : '';
    const dateOfBirth :string = DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT);

    const personEKID :UUID = getEKID(person);
    const jailStays :List = personNeighbors.getIn([personEKID, MANUAL_JAIL_STAYS]);
    const jailStay :Map = sortEntitiesByDateProperty(jailStays, [PROJECTED_RELEASE_DATETIME]).last();
    const jailStayEKID :UUID = getEKID(jailStay);
    const jailName :string = jailNamesByJailStayEKID.get(jailStayEKID);

    const needsAssessment :Map = personNeighbors.getIn([personEKID, NEEDS_ASSESSMENT]).get(0);
    const { [DATETIME_COMPLETED]: enrollmentDateTime } = getEntityProperties(needsAssessment, [DATETIME_COMPLETED]);
    const enrollmentDate :string = DateTime.fromISO(enrollmentDateTime).toLocaleString(DateTime.DATE_SHORT);

    const personDataObject :Map = fromJS({
      name: personName,
      dob: dateOfBirth,
      jail: jailName,
      enrollmentDate,
      id: personEKID,
    });
    data = data.push(personDataObject);
  });
  return data;
};

/* eslint-disable import/prefer-default-export */
export {
  aggregateResultsData,
};
