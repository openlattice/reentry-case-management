// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { isDefined } from '../../../utils/LangUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  COUNTY,
  OL_DATETIME,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  US_STATE,
} = PROPERTY_TYPE_FQNS;

const checkWhetherIsSexOffender = (sexOffender :List) :boolean => {

  if (!isDefined(sexOffender) || sexOffender.isEmpty()) return false;
  const sexOffenderEntity = sexOffender.get(0);
  const { [REGISTERED_FLAG]: flag } = getEntityProperties(sexOffenderEntity, [REGISTERED_FLAG]);
  return flag;
};

const formatSexOffenderData = (sexOffender :List, sexOffenderRegistrationLocation :List) :Map => {

  if (!isDefined(sexOffender) || sexOffender.isEmpty()) return Map();
  const sexOffenderEntity = sexOffender.get(0);
  const sexOffenderLocationEntity = sexOffenderRegistrationLocation.get(0);

  const {
    [OL_DATETIME]: registeredDateTime,
    [RECOGNIZED_END_DATETIME]: recognizedEndDatetime,
    [REGISTERED_FLAG]: flag
  } = getEntityProperties(sexOffenderEntity, [OL_DATETIME, RECOGNIZED_END_DATETIME, REGISTERED_FLAG]);
  const registeredDateAsDateTime :DateTime = DateTime.fromISO(registeredDateTime);
  const endDateAsDateTime :DateTime = DateTime.fromISO(recognizedEndDatetime);
  const registeredDate :string = registeredDateAsDateTime.isValid
    ? registeredDateAsDateTime.toLocaleString(DateTime.DATE_SHORT)
    : EMPTY_FIELD;
  const registryEndDate :string = endDateAsDateTime.isValid
    ? endDateAsDateTime.toLocaleString(DateTime.DATE_SHORT)
    : EMPTY_FIELD;

  const { [COUNTY]: county, [US_STATE]: usState } = getEntityProperties(sexOffenderLocationEntity, [COUNTY, US_STATE]);

  return Map({
    registeredSexOffender: flag ? 'Yes' : 'No',
    registeredDate,
    registryEndDate,
    county,
    state: usState,
  });
};

export {
  checkWhetherIsSexOffender,
  formatSexOffenderData,
};
