// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const addLinkedPersonField = (schema :Object, uiSchema :Object) => {
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

  return { taskSchema, taskUiSchema };
};

/* eslint-disable import/prefer-default-export */
export {
  addLinkedPersonField,
};
