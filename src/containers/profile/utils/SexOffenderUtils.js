// @flow
import {
  List,
  Map,
  get,
  getIn,
  removeIn,
  setIn,
} from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';

import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  IS_REGISTERED_SEX_OFFENDER_IN,
  PEOPLE,
  REGISTERED_FOR,
  SEX_OFFENDER,
  SEX_OFFENDER_REGISTRATION_LOCATION,
} = APP_TYPE_FQNS;
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

const changeDateToDateTimeInForm = (formData :Object, keyPath :string[], time :string) => {
  const dateInFormData = getIn(formData, keyPath);
  let updatedFormData = formData;

  if (DateTime.fromISO(dateInFormData).isValid) {
    updatedFormData = setIn(updatedFormData, keyPath, DateTime.fromSQL(`${dateInFormData} ${time}`).toISO());
  }
  return updatedFormData;
};

const preprocessSexOffenderData = (
  formData :Object,
  originalFormData :Object,
  participantNeighbors :Map,
  personEKID :UUID
) => {

  const pageSection1 = getPageSectionKey(1, 1);
  const sexOffenderData = formData[pageSection1];
  const now = DateTime.local();

  let newData = {
    [pageSection1]: {}
  };
  const associations :Array<Array<*>> = [];
  let editedData = formData;
  let updatedOriginalData = originalFormData;
  let locationEKIDToDelete :string = '';

  const countyKey :string = getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, COUNTY);
  const usStateKey :string = getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE);
  const sexOffenderRegistrationLocation = participantNeighbors.get(SEX_OFFENDER_REGISTRATION_LOCATION);
  const sexOffenderEKID :UUID = getEKID(participantNeighbors.getIn([SEX_OFFENDER, 0], Map()));

  if (!isDefined(sexOffenderRegistrationLocation)) {
    const county = get(sexOffenderData, countyKey);
    if (isDefined(county) && county.length) {
      newData = setIn(newData, [pageSection1, countyKey], county);
    }
    const usState = get(sexOffenderData, usStateKey);
    if (isDefined(usState) && usState.length) {
      newData = setIn(newData, [pageSection1, usStateKey], usState);
    }

    if (Object.values(newData[pageSection1]).length) {
      associations.push([REGISTERED_FOR, sexOffenderEKID, SEX_OFFENDER, 0, SEX_OFFENDER_REGISTRATION_LOCATION, {}]);
      associations.push([
        IS_REGISTERED_SEX_OFFENDER_IN,
        personEKID,
        PEOPLE,
        0,
        SEX_OFFENDER_REGISTRATION_LOCATION,
        {}
      ]);
    }
    editedData = removeIn(editedData, [pageSection1, countyKey], county);
    editedData = removeIn(editedData, [pageSection1, usStateKey], usState);
  }

  const flagKey :string = getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG);
  const originalFlag = getIn(originalFormData, [pageSection1, flagKey]);
  const newFlag = get(sexOffenderData, flagKey);
  if ((!newFlag && originalFlag) && isDefined(sexOffenderRegistrationLocation)) {
    const location :Map = sexOffenderRegistrationLocation.get(0, Map());
    locationEKIDToDelete = getEKID(location);
    editedData = removeIn(editedData, [pageSection1, usStateKey]);
  }

  const registeredDateKey = getEntityAddressKey(0, SEX_OFFENDER, OL_DATETIME);
  const registryEndDateKey = getEntityAddressKey(0, SEX_OFFENDER, RECOGNIZED_END_DATETIME);
  const timeNow :string = now.toLocaleString(DateTime.TIME_24_SIMPLE);
  editedData = changeDateToDateTimeInForm(editedData, [pageSection1, registeredDateKey], timeNow);
  editedData = changeDateToDateTimeInForm(editedData, [pageSection1, registryEndDateKey], timeNow);
  updatedOriginalData = changeDateToDateTimeInForm(updatedOriginalData, [pageSection1, registeredDateKey], timeNow);
  updatedOriginalData = changeDateToDateTimeInForm(updatedOriginalData, [pageSection1, registryEndDateKey], timeNow);

  return {
    associations,
    editedData,
    locationEKIDToDelete,
    newData,
    updatedOriginalData,
  };
};

export {
  changeDateToDateTimeInForm,
  checkWhetherIsSexOffender,
  formatSexOffenderData,
  getOriginalFormData,
  preprocessSexOffenderData,
};
