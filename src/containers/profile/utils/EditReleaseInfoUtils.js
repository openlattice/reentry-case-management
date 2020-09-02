// @flow
import {
  List,
  getIn,
  removeIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../utils/Utils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { MANUAL_JAILS_PRISONS } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPE_FQNS;

const hydrateSchema = (schema :Object, facilities :List) :Object => {
  const [values, labels] = getValuesFromEntityList(facilities, [NAME]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
      'enum'
    ],
    values
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID),
      'enumNames'
    ],
    labels
  );

  return newSchema;
};

const getDataForAssociationUpdate = (formData :Object, facilityEKID :UUID) => {
  const facilityEKIDPath :string[] = [
    getPageSectionKey(1, 1),
    getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)
  ];
  const facilityEKIDInForm = getIn(formData, facilityEKIDPath);
  const editedFormData = removeIn(formData, facilityEKIDPath);
  if (facilityEKID === facilityEKIDInForm) {
    return { editedFormData, newFacilityEKID: '' };
  }
  return { editedFormData, newFacilityEKID: facilityEKIDInForm };
};

export {
  getDataForAssociationUpdate,
  hydrateSchema,
};
