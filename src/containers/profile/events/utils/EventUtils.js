// @flow
import { List, getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getValuesFromEntityList } from '../../../../utils/Utils';
import { deleteKeyFromFormData } from '../../../../utils/FormUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ASSIGNED_TO,
  ENROLLMENT_STATUS,
  HAS,
  PEOPLE,
  PROVIDER,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPE_FQNS;

const hydrateEventSchema = (schema :Object, providers :List) :Object => {
  if (providers.isEmpty()) return schema;
  const [values, labels] = getValuesFromEntityList(providers, [NAME]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID),
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
      getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID),
      'enumNames'
    ],
    labels
  );

  return newSchema;
};

const prepareFormDataForProcessing = (formData :Object, personEKID :UUID) :Object => {

  const providerPath :string[] = [getPageSectionKey(1, 1), getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)];
  const providerEKID :UUID = getIn(formData, providerPath);
  const entityDataToProcess :Object = deleteKeyFromFormData(formData, providerPath);

  const associations :Array<Array<*>> = [
    [HAS, personEKID, PEOPLE, 0, ENROLLMENT_STATUS, {}],
    [ASSIGNED_TO, providerEKID, PROVIDER, 0, ENROLLMENT_STATUS, {}],
  ];
  return { entityDataToProcess, associations };
};

export {
  hydrateEventSchema,
  prepareFormDataForProcessing,
};
