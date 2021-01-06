/*
 * @flow
 */

import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

const SEARCH_PREFIX = 'entity';

const getSearchTerm = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

const getSearchTermNotExact = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:${searchString}`;

const getUTCDateRangeSearchString = (
  propertyTypeId :UUID,
  timeUnits :any,
  startDate ? :DateTime,
  endDate ? :DateTime
) => {

  let start :string = '*';
  if (startDate && startDate.isValid) start = startDate.startOf(timeUnits).toUTC().toISO();
  let end :string = '*';
  if (endDate && endDate.isValid) end = endDate.endOf(timeUnits).toUTC().toISO();

  const dateRangeString = `[${start} TO ${end}]`;
  return getSearchTermNotExact(propertyTypeId, dateRangeString);
};

export {
  getSearchTerm,
  getSearchTermNotExact,
  getUTCDateRangeSearchString,
};
