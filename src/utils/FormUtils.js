// @flow
import {
  List,
  Map,
  OrderedSet,
  fromJS,
  mergeDeep,
  removeIn,
  setIn
} from 'immutable';
import { Models } from 'lattice';

import { isDefined } from './LangUtils';
import { getPropertyFqnFromEDM } from './DataUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { FullyQualifiedName } = Models;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

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
  const reviewSchema = mergeDeep(...schemasAsImmutable).toJS();

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

const constructNewEntityFromSubmittedData = (data :Map, ekid :UUID, edm :Map) :Map => (
  Map().withMutations((map :Map) => {
    map.set(ENTITY_KEY_ID, List([ekid]));
    data.forEach((entityValue :List, ptid :UUID) => {
      const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
      map.set(propertyFqn, entityValue);
    });
  })
);

export {
  constructNewEntityFromSubmittedData,
  deleteKeyFromFormData,
  generateReviewSchemas,
  updateFormData,
};
