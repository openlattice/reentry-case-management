// @flow
import {
  List,
  get,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../utils/Utils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { REENTRY_STAFF } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const hydrateCaseNotesForm = (schema :Object, reentryStaff :List) :Object => {

  let newSchema :Object = schema;
  const pageSection :string = getPageSectionKey(1, 2);

  const [values, labels] = getValuesFromEntityList(reentryStaff, [FIRST_NAME, LAST_NAME]);
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID), 'enum'],
    values
  );
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID), 'enumNames'],
    labels
  );

  return newSchema;
};

const preprocessCaseNotesFormData = (formData :Object) :Object => {
  const meetingData = {
    [getPageSectionKey(1, 1)]: get(formData, getPageSectionKey(1, 1))
  };
  const taskData = {
    [getPageSectionKey(1, 3)]: get(formData, getPageSectionKey(1, 3))
  };
  const staffMemberEKID = getIn(
    formData,
    [getPageSectionKey(1, 2), getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]
  );

  return { meetingData, staffMemberEKID, taskData };
};

export {
  hydrateCaseNotesForm,
  preprocessCaseNotesFormData,
};
