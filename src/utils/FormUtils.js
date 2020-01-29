// @flow
import {
  List,
  Map,
  removeIn,
  setIn,
} from 'immutable';
import { Models } from 'lattice';

import { isDefined } from './LangUtils';
import { getEntityKeyId, getFirstNeighborValue } from './DataUtils';

const { FullyQualifiedName } = Models;

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

const getValuesFromEntityList = (entities :List, propertyList :FullyQualifiedName[]) => {

  const values = [];
  const labels = [];
  entities.forEach((entity :Map) => {

    let label :string = '';
    propertyList.forEach((propertyType) => {
      const backUpValue = entity.get(propertyType, '');
      const property = getFirstNeighborValue(entity, propertyType, backUpValue);
      label = label.concat(' ', property);
    });
    const entityEKID :UUID = getEntityKeyId(entity);

    labels.push(label);
    values.push(entityEKID);
  });

  return [values, labels];
};

export {
  deleteKeyFromFormData,
  getValuesFromEntityList,
  updateFormData,
};
