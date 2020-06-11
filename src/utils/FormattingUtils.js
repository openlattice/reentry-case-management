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

  if (!city && !streetAddress && !state && !zipCode) return EMPTY_FIELD;
  let formattedAddress :string = typeof streetAddress === 'string' ? streetAddress : streetAddress[0];
  if (typeof city === 'string' && city.length) formattedAddress = `${formattedAddress} ${city}`;
  if (typeof state === 'string' && state.length) formattedAddress = `${formattedAddress}, ${state}`;
  if (typeof zipCode === 'string' && zipCode.length) formattedAddress = `${formattedAddress} ${zipCode}`;
  return formattedAddress;
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
