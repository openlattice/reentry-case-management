// @flow
import { DateTime } from 'luxon';

import { isDefined } from './LangUtils';

const SEARCH_PREFIX = 'entity';

const getSearchTerm = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

const getSearchTermNotExact = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:${searchString}`;

const getUTCDateRangeSearchString = (propertyTypeId :UUID, timeUnits :any, startDate :DateTime, endDate :?DateTime) => {
  const start :string = startDate.startOf(timeUnits).toUTC().toISO();
  let end :string = '*';
  if (isDefined(endDate)) end = endDate.endOf(timeUnits).toUTC().toISO();
  const dateRangeString = `[${start} TO ${end}]`;
  return getSearchTermNotExact(propertyTypeId, dateRangeString);
};

export {
  getSearchTerm,
  getSearchTermNotExact,
  getUTCDateRangeSearchString,
};
