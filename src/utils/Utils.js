// @flow
import { List, Map } from 'immutable';
import { Models } from 'lattice';

import { getEKID, getFirstNeighborValue } from './DataUtils';
import { COLORS } from '../core/style/Colors';

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

const generateTableHeaders = (headers :string[]) :Object[] => {

  const tableHeaders = [];
  headers.forEach((header :string) => {
    tableHeaders.push({
      cellStyle: {
        backgroundColor: 'white',
        color: COLORS.GRAY_01,
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '16px',
        textAlign: 'left',
      },
      key: header,
      label: header,
      sortable: (header && header !== ' ') || false,
    });
  });
  return tableHeaders;
};

export {
  generateTableHeaders,
  getValuesFromEntityList,
  pipeConcat,
  pipeValue,
};
