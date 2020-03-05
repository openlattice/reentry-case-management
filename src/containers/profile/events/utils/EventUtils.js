// @flow
import { List, getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { getValuesFromEntityList } from '../../../../utils/Utils';
import { deleteKeyFromFormData } from '../../../../utils/FormUtils';
import { isDefined } from '../../../../utils/LangUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ASSIGNED_TO,
  ENROLLMENT_STATUS,
  HAS,
  PEOPLE,
  PROVIDER,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, ENTITY_KEY_ID, NAME } = PROPERTY_TYPE_FQNS;

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
  let entityDataToProcess :Object = deleteKeyFromFormData(formData, providerPath);
  const datePath :string[] = [getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)];
  const eventDate :string = getIn(entityDataToProcess, datePath);
  const now :DateTime = DateTime.local();
  if (!isDefined(eventDate)) entityDataToProcess = setIn(entityDataToProcess, datePath, now.toISO());
  else {
    entityDataToProcess = setIn(
      entityDataToProcess,
      datePath,
      DateTime.fromSQL(eventDate.concat(' ', now.toISOTime())).toISO()
    );
  }

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
