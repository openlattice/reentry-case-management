// @flow
import { List, Map, setIn } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';

import { isDefined } from '../../../utils/LangUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;
const {
  COUNTY,
  OL_DATETIME,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  US_STATE,
} = PROPERTY_TYPE_FQNS;

// Profile Card:

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

// Edit Form:

const getOriginalFormData = (participantNeighbors :Map) => {

  const pageSection1 = getPageSectionKey(1, 1);
  let originalFormData = {
    [pageSection1]: {},
  };

  const sexOffender :List = participantNeighbors.get(SEX_OFFENDER, List());
  const isSexOffender :boolean = checkWhetherIsSexOffender(sexOffender);
  console.log('isSexOffender ', isSexOffender);

  if (!isSexOffender) {
    originalFormData = setIn(
      originalFormData,
      [pageSection1, getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)],
      false
    );
    return originalFormData;
  }

  const sexOffenderEntity = sexOffender.get(0);
  const {
    [OL_DATETIME]: registeredDateTime,
    [RECOGNIZED_END_DATETIME]: recognizedEndDatetime,
    [REGISTERED_FLAG]: flag
  } = getEntityProperties(sexOffenderEntity, [OL_DATETIME, RECOGNIZED_END_DATETIME, REGISTERED_FLAG]);
  const registeredDateAsDateTime :DateTime = DateTime.fromISO(registeredDateTime);
  const endDateAsDateTime :DateTime = DateTime.fromISO(recognizedEndDatetime);

  originalFormData = setIn(
    originalFormData,
    [pageSection1, getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)],
    flag
  );
  if (registeredDateAsDateTime.isValid) {
    originalFormData = setIn(
      originalFormData,
      [pageSection1, getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME)],
      registeredDateAsDateTime.toISODate()
    );
  }
  if (endDateAsDateTime.isValid) {
    originalFormData = setIn(
      originalFormData,
      [pageSection1, getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME)],
      endDateAsDateTime.toISODate()
    );
  }

  const sexOffenderRegistrationLocation :List = participantNeighbors.get(SEX_OFFENDER_REGISTRATION_LOCATION, List());
  const sexOffenderLocationEntity = sexOffenderRegistrationLocation.get(0);
  const { [COUNTY]: county, [US_STATE]: usState } = getEntityProperties(sexOffenderLocationEntity, [COUNTY, US_STATE]);
  originalFormData = setIn(
    originalFormData,
    [pageSection1, getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY)],
    county
  );
  originalFormData = setIn(
    originalFormData,
    [pageSection1, getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)],
    usState
  );
  return originalFormData;
};

export {
  checkWhetherIsSexOffender,
  formatSexOffenderData,
  getOriginalFormData,
};
