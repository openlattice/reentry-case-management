// @flow
import { List, Map } from 'immutable';
import { Models } from 'lattice';

import { getEKID, getFirstNeighborValue } from './DataUtils';

const { FullyQualifiedName } = Models;

const pipeValue = (...fns :Function) => (initial :Object) => fns
  .reduce((pipedValue, currentFn) => currentFn(pipedValue), initial);

const pipeConcat = (dataToProcess :Object, ...fns :Function) => (initial :Array<*>) => fns
  .reduce((pipedValue, currentFunction) => pipedValue.concat(currentFunction(dataToProcess)), initial);

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
    const entityEKID :UUID = getEKID(entity);

    labels.push(label);
    values.push(entityEKID);
  });

  return [values, labels];
};

export {
  getValuesFromEntityList,
  pipeConcat,
  pipeValue,
};
