// @flow
import {
  OrderedSet,
  fromJS,
  mergeDeep,
  removeIn,
  setIn
} from 'immutable';

import { isDefined } from './LangUtils';

const deleteKeyFromFormData = (formData :Object, path :string[]) :Object => {

  let updatedFormData :Object = formData;
  if (isDefined(formData) && path) {
    updatedFormData = removeIn(updatedFormData, path);
  }
  return updatedFormData;
};

const updateFormData = (
  formData :Object,
  path :string[],
  value :any
) :Object => {

  let updatedFormData :Object = formData;
  if (isDefined(formData) && path && isDefined(value)) {
    updatedFormData = setIn(
      updatedFormData,
      path,
      value
    );
  }
  return updatedFormData;
};

const getOrder = (schemas :Object[]) => schemas.reduce(
  (keySet, schema) => keySet.union(Object.keys(schema.properties)),
  OrderedSet(),
).toJS();

// NOTE: set these params flowtypes to be :any to get rid of flow errors down below
const generateReviewSchemas = (schemas :any, uiSchemas :any) => {
  const schemasAsImmutable = fromJS(schemas);
  const uiSchemasAsImmutable = fromJS(uiSchemas);
  const reviewSchema :Object[] = mergeDeep(...schemasAsImmutable).toJS();

  const reviewOrder :Object = {
    'ui:disabled': true,
    'ui:order': getOrder(schemas)
  };

  const reviewUiSchema :Object = mergeDeep(...uiSchemasAsImmutable, reviewOrder).toJS();
  const newSchemas = schemas.concat(reviewSchema);
  const newUiSchemas = uiSchemas.concat(reviewUiSchema);

  return {
    schemas: newSchemas,
    uiSchemas: newUiSchemas
  };
};

export {
  deleteKeyFromFormData,
  generateReviewSchemas,
  updateFormData,
};
