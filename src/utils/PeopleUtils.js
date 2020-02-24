// @flow
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import { isDefined } from './LangUtils';
import { getEntityProperties } from './DataUtils';
import { createDateTime } from './DateTimeUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const getPersonFullName = (personEntity :Map) :string => {
  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(personEntity, [FIRST_NAME, LAST_NAME]);
  if (!isDefined(firstName) || !isDefined(lastName)) return '';
  const fullName = `${firstName} ${lastName}`;
  return fullName;
};

const getPersonAge = (personEntity :Map) => {
  const { [DOB]: dob } = getEntityProperties(personEntity, [DOB]);
  const dobAsDateTime :DateTime = createDateTime(dob);
  if (!dobAsDateTime.isValid) return '';
  const age = dobAsDateTime
    .until(DateTime.local())
    .toDuration(['years', 'months', 'days', 'hours']);
  return age.years;
};

export {
  getPersonFullName,
  getPersonAge,
};
