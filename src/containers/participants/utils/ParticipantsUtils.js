// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { TABLE_HEADERS } from '../constants';

const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const aggregateTableData = (people :List) :Object[] => {

  const data :Object[] = [];
  people.forEach((person :Map) => {
    // $FlowFixMe
    const { [DOB]: dob, [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(person, [
      DOB,
      FIRST_NAME,
      LAST_NAME
    ]);
    const dateOfBirth :string = DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT);
    const personEKID :UUID = getEKID(person);

    const personDataObject :Object = {
      [TABLE_HEADERS[0]]: `${firstName} ${lastName}`,
      [TABLE_HEADERS[1]]: dateOfBirth,
      id: personEKID,
    };
    data.push(personDataObject);
  });
  return data;
};

/* eslint-disable import/prefer-default-export */
export {
  aggregateTableData,
};
