// @flow
import { Map } from 'immutable';

import { getEntityProperties } from './DataUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const {
  CITY,
  STREET,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getAddress = (address :Map) :string => {
  if (!Map.isMap(address)) return '----';
  const {
    [CITY]: city,
    [STREET]: streetAddress,
    [US_STATE]: state,
    [ZIP]: zipCode,
  } = getEntityProperties(address, [CITY, STREET, US_STATE, ZIP]);

  if (!streetAddress) return '----';
  if (!city || !state || !zipCode) return streetAddress;
  return `${streetAddress} ${city}, ${state} ${zipCode}`;
};

export {
  getAddress,
};
