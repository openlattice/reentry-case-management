// @flow
import { List, Map } from 'immutable';
import { Models } from 'lattice';
import { DateTime } from 'luxon';

import COLORS from '../core/style/Colors';
import { getEKID, getFirstEntityValue } from './DataUtils';

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
      const property = getFirstEntityValue(entity, propertyType, '');
      label = label.concat(' ', property);
    });
    const entityEKID :UUID = getEKID(entity);

    labels.push(label);
    values.push(entityEKID);
  });

  return [values, labels];
};

const sortEntitiesByDateProperty = (
  entityCollection :List | Map,
  datePropertyPath :FullyQualifiedName[]
) :List | Map => entityCollection

  .sortBy((entityObj :Map) => {
    const date = DateTime.fromISO(entityObj.getIn(datePropertyPath.concat([0])));
    return date.valueOf();
  });

const generateTableHeaders = (headers :string[]) :Object[] => {

  const tableHeaders = [];
  headers.forEach((header :string) => {
    tableHeaders.push({
      cellStyle: {
        backgroundColor: 'white',
        color: COLORS.GRAY_01,
        fontSize: '10px',
        fontWeight: '600',
        padding: '15px',
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
  sortEntitiesByDateProperty,
};
