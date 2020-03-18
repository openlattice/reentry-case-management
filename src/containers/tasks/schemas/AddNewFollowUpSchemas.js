// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { schema, uiSchema } from '../../profile/tasks/schemas/AddNewFollowUpSchemas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const taskSchema = schema;
const taskUiSchema = uiSchema;

taskSchema
  .properties[getPageSectionKey(1, 1)]
  .properties[getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
    type: 'string',
    title: 'Linked Person',
    enum: [],
    enumNames: []
  };
taskSchema
  .properties[getPageSectionKey(1, 1)]
  .required.push(getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID));

taskUiSchema[getPageSectionKey(1, 1)][getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)] = {
  classNames: 'column-span-12',
};

export {
  taskSchema as schema,
  taskUiSchema as uiSchema,
};
