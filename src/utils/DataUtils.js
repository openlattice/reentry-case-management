// @flow
import { Map, isImmutable } from 'immutable';
import { Models } from 'lattice';

import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';
import { APP } from './constants/ReduxStateConstants';

const { FullyQualifiedName } = Models;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getEntitySetIdFromApp = (app :Object | Map, fqn :FullyQualifiedName) => {

  const orgId :string = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    APP.ENTITY_SET_IDS_BY_ORG_ID,
    orgId,
    fqn
  ]);
};

const getFirstNeighborValue = (
  neighborObj :Map,
  fqn :FullyQualifiedName | string,
  defaultValue :string = ''
) => neighborObj.getIn(

  ['neighborDetails', fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

const getEntityProperties = (entityObj :Map, propertyList :string[]) => {

  const returnPropertyFields = {};
  if (propertyList.length && isImmutable(entityObj) && entityObj.count() > 0) {
    propertyList.forEach((propertyType) => {
      const backUpValue = entityObj.get(propertyType, '');
      const property = getFirstNeighborValue(entityObj, propertyType, backUpValue);
      returnPropertyFields[propertyType] = property;
    });
  }
  return returnPropertyFields;
};

const getEntityKeyId = (entityObj :Map) :string => {
  if (isImmutable(entityObj)) {
    const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(entityObj, [ENTITY_KEY_ID]);
    return entityKeyId;
  }
  return '';
};

export {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getFirstNeighborValue,
};
