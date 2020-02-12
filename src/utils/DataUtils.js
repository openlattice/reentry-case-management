// @flow
import {
  Map,
  getIn,
  isImmutable,
  set
} from 'immutable';
import { Models } from 'lattice';

import { isDefined } from './LangUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';
import { APP, EDM } from './constants/ReduxStateConstants';

const { FullyQualifiedName } = Models;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const NEIGHBOR_DETAILS :string = 'neighborDetails';
const NEIGHBOR_ENTITY_SET :string = 'neighborEntitySet';
const ID :string = 'id';

const getESIDFromApp = (app :Object | Map, fqn :FullyQualifiedName) => {
  const orgId :string = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    APP.ENTITY_SET_IDS_BY_ORG_ID,
    orgId,
    fqn
  ]);
};

const getFqnFromApp = (app :Object | Map, esid :UUID) => {
  const orgId :string = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    APP.APP_TYPES_BY_ORG_ID,
    orgId,
    esid
  ]);
};

const getFirstNeighborValue = (
  neighborObj :Map,
  fqn :FullyQualifiedName | string,
  defaultValue :string = ''
) => neighborObj.getIn(

  [NEIGHBOR_DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

const getEntityProperties = (entityObj :Map, propertyList :FullyQualifiedName[]) => {

  let returnPropertyFields = {};
  if (propertyList.length && isImmutable(entityObj) && entityObj.count() > 0) {
    propertyList.forEach((propertyType :FullyQualifiedName) => {
      const backUpValue = entityObj.get(propertyType, '');
      const property = getFirstNeighborValue(entityObj, propertyType, backUpValue);
      returnPropertyFields = set(returnPropertyFields, propertyType, property);
    });
  }
  return returnPropertyFields;
};

const getEKID = (entityObj :Map | Object) :string => {
  if (isDefined(entityObj)) {
    return getIn(entityObj, [ENTITY_KEY_ID, 0]);
  }
  return '';
};

const getPTIDFromEDM = (
  edm :Map, propertyFqn :FullyQualifiedName
) => edm.getIn([EDM.TYPE_IDS_BY_FQN, EDM.PROPERTY_TYPES, propertyFqn]);

const getNeighborDetails = (neighborObj :Map) :Map => {
  let neighborDetails :Map = Map();
  if (isImmutable(neighborObj)) {
    neighborDetails = neighborObj.get(NEIGHBOR_DETAILS, neighborObj);
  }
  return neighborDetails;
};

const getNeighborESID = (neighbor :Map | Object) :UUID => (getIn(neighbor, [NEIGHBOR_ENTITY_SET, ID]));

export {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getFirstNeighborValue,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPTIDFromEDM,
};
