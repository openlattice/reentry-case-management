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

const generateReviewSchemas = (schemas :Object[], uiSchemas :Object[]) => {
  const schemasAsImmutable = fromJS(schemas);
  const uiSchemasAsImmutable = fromJS(uiSchemas);
  const reviewSchema = mergeDeep(...schemasAsImmutable).toJS();

  const reviewOrder :Object = {
    'ui:disabled': true,
    'ui:order': getOrder(schemas)
  };

  const reviewUiSchema :Object[] = mergeDeep(...uiSchemasAsImmutable, reviewOrder).toJS();

  return {
    schemas: schemas.concat(reviewSchema),
    uiSchemas: uiSchemas.concat(reviewUiSchema)
  };
};

export {
  deleteKeyFromFormData,
  generateReviewSchemas,
  updateFormData,
};
