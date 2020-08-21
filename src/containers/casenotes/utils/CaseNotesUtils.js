// @flow
import { List, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../utils/Utils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { REENTRY_STAFF } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const hydrateCaseNotesForm = (
  schema :Object,
  reentryStaff :List,
) :Object => {

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

/* eslint-disable import/prefer-default-export */
export {
  hydrateCaseNotesForm,
};
