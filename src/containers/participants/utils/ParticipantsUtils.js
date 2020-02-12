// @flow
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const aggregateResultsData = (people :List) :List => {

  let data :List = List();
  people.forEach((person :Map) => {
    // $FlowFixMe
    const { [DOB]: dob, [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(person, [
      DOB,
      FIRST_NAME,
      LAST_NAME
    ]);
    const dateOfBirth :string = DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT);

    const personDataObject :Map = fromJS({
      name: `${firstName} ${lastName}`,
      dob: dateOfBirth,
      idNumber: '',
      jail: '',
      enrollmentDate: '',
    });
    data = data.push(personDataObject);
  });
  return data;
};

/* eslint-disable import/prefer-default-export */
export {
  aggregateResultsData,
};
