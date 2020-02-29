//  @flow
import { DateTime } from 'luxon';

const formatAsDate = (value :string = '') :string => {
  const date = DateTime.fromISO(value);
  if (date.isValid) {
    return date.toLocaleString(DateTime.DATE_SHORT);
  }
  return '';
};

const checkIfDatesAreEqual = (isoDate1 :string, isoDate2 :string) => {
  const dateObj1 :DateTime = DateTime.fromISO(isoDate1);
  const dateObj2 :DateTime = DateTime.fromISO(isoDate2);
  if (!dateObj1.isValid || !dateObj2.isValid) {
    return false;
  }
  return dateObj1.hasSame(dateObj2, 'millisecond');
};

// created for getting rid of flow errors elsewhere
const createDateTime = (date :any) :DateTime => (DateTime.fromISO(date));

export {
  checkIfDatesAreEqual,
  createDateTime,
  formatAsDate,
};
