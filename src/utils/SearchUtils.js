// @flow
import { DateTime } from 'luxon';

const SEARCH_PREFIX = 'entity';

const getSearchTerm = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

const getSearchTermNotExact = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:${searchString}`;

const getUTCDateRangeSearchString = (PTID :UUID, timeUnits :any, startDate :DateTime, endDate :?DateTime) => {
  let start = startDate.toUTC().toISO();
  let end;
  if (!endDate) {
    start = startDate.startOf(timeUnits).toUTC().toISO();
    end = startDate.endOf(timeUnits).toUTC().toISO();
  }
  else {
    end = endDate.toUTC().toISO();
  }
  const dateRangeString = `[${start} TO ${end}]`;
  return getSearchTermNotExact(PTID, dateRangeString);
};

export {
  getSearchTerm,
  getSearchTermNotExact,
  getUTCDateRangeSearchString,
};
