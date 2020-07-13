// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { dataSchema, uiSchema } from './FollowUpSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const data = JSON.parse(JSON.stringify(dataSchema));

data
  .properties[getPageSectionKey(1, 1)]
  .properties[getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
    type: 'string',
    title: 'Linked Person',
    enum: [],
    enumNames: []
  };
data
  .properties[getPageSectionKey(1, 1)]
  .required.push(getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID));

const ui = JSON.parse(JSON.stringify(uiSchema));

ui[getPageSectionKey(1, 1)][getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
  classNames: 'column-span-12',
};

export {
  data as schema,
  ui as uiSchema,
};
