// @flow
import {
  List,
  Map,
  get,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { LangUtils } from 'lattice-utils';
import { DateTime } from 'luxon';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { isDefined } = LangUtils;
const {
  ATTORNEYS,
  CONTACT_INFO,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  LEVEL,
  PHONE_NUMBER,
  RECOGNIZED_END_DATETIME,
  TYPE,
} = PROPERTY_TYPE_FQNS;

// SupervisionCard

const formatGridData = (participantNeighbors :Map, supervisionNeighbors :Map) :Map => {
  const supervisionList :List = participantNeighbors.get(PROBATION_PAROLE, List());
  const {
    [LEVEL]: level,
    [RECOGNIZED_END_DATETIME]: endDateTime,
    [TYPE]: supervisionType
  } = getEntityProperties(supervisionList.get(0) || Map(), [LEVEL, RECOGNIZED_END_DATETIME, TYPE], EMPTY_FIELD);
  const endDateTimeAsDTObj = DateTime.fromISO(endDateTime);

  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());
  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());

  const contactInfo :Map = supervisionNeighbors.get(CONTACT_INFO, Map());
  const officerContactInfo :List = contactInfo.get(OFFICERS, List());
  const attorneyContactInfo :List = contactInfo.get(ATTORNEYS, List());

  let officerPhone :string = EMPTY_FIELD;
  let officerEmail :string = EMPTY_FIELD;
  officerContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      officerPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      officerEmail = contact.getIn([EMAIL, 0]);
    }
  });

  let attorneyPhone :string = EMPTY_FIELD;
  let attorneyEmail :string = EMPTY_FIELD;
  attorneyContactInfo.forEach((contact :Map) => {
    if (contact.has(PHONE_NUMBER)) {
      attorneyPhone = contact.getIn([PHONE_NUMBER, 0]);
    }
    if (contact.has(EMAIL)) {
      attorneyEmail = contact.getIn([EMAIL, 0]);
    }
  });

  const gridData = Map({
    supervisionType,
    level,
    endDate: endDateTimeAsDTObj.isValid ? endDateTimeAsDTObj.toLocaleString(DateTime.DATE_SHORT) : EMPTY_FIELD,
    officerName: officer.isEmpty() ? EMPTY_FIELD : getPersonFullName(officer),
    officerPhone,
    officerEmail,
    attorneyName: attorney.isEmpty() ? EMPTY_FIELD : getPersonFullName(attorney),
    attorneyPhone,
    attorneyEmail,
  });
  return gridData;
};

// SupervisionForm

const preprocessContactInfoFormData = (formData :Object) :Object => {
  let updatedFormData = formData;
  const pageSection1 :string = getPageSectionKey(1, 1);
  const phoneKey :string = getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER);
  const emailKey :string = getEntityAddressKey(1, CONTACT_INFO, EMAIL);
  const contactsInFormData = get(formData, pageSection1);

  if (!isDefined(get(contactsInFormData, phoneKey))) {
    updatedFormData = setIn(updatedFormData, [pageSection1, phoneKey], ' ');
  }

  if (!isDefined(get(contactsInFormData, emailKey))) {
    updatedFormData = setIn(updatedFormData, [pageSection1, emailKey], ' ');
  }

  return updatedFormData;
};

const getNewContactValueFromEditedData = (formData :Object, officerContactInfo :List) => {
  const existingContactIsPhone = officerContactInfo.hasIn([0, PHONE_NUMBER]);
  const existingContactIsEmail = officerContactInfo.hasIn([0, EMAIL]);

  let newContactValue;
  let propertyFqn = EMAIL;
  if (existingContactIsPhone) {
    newContactValue = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(1, CONTACT_INFO, EMAIL)]) || '';
  }
  if (existingContactIsEmail) {
    newContactValue = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)])
      || '';
    propertyFqn = PHONE_NUMBER;
  }
  return { newContactValue, propertyFqn };
};

const getNonEditableSchema = (uiSchema :Object) :Object => {
  const newUiSchema = setIn(
    uiSchema,
    [
      getPageSectionKey(1, 1),
      'ui:options',
      'editable'
    ],
    false
  );
  return newUiSchema;
};

export {
  formatGridData,
  getNewContactValueFromEditedData,
  getNonEditableSchema,
  preprocessContactInfoFormData,
};
