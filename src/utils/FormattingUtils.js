// @flow
import { Map } from 'immutable';

import { isDefined } from './LangUtils';
import { getEntityProperties } from './DataUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const {
  CITY,
  FIRST_NAME,
  LAST_NAME,
  STREET,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const EMPTY_FIELD :string = '----';

const getAddress = (address :Map) :string => {
  if (!Map.isMap(address)) return '----';
  const {
    [CITY]: city,
    [STREET]: streetAddress,
    [US_STATE]: state,
    [ZIP]: zipCode,
  } = getEntityProperties(address, [CITY, STREET, US_STATE, ZIP]);

  if (!city || !streetAddress || !state || !zipCode) return EMPTY_FIELD;
  // $FlowFixMe
  return `${streetAddress} ${city}, ${state} ${zipCode}`;
};

const getPersonFullName = (personEntity :Map) :string => {
  let fullName :string = EMPTY_FIELD;
  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(personEntity, [FIRST_NAME, LAST_NAME]);
  if (!isDefined(firstName) || !isDefined(lastName)) return fullName;
  fullName = `${firstName} ${lastName}`;
  return fullName;
};

export {
  EMPTY_FIELD,
  getAddress,
  getPersonFullName,
};
