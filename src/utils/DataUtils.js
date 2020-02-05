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

const getEKID = (entityObj :Map) :string => {
  if (isImmutable(entityObj)) {
    const entityKeyId :UUID = entityObj.getIn([ENTITY_KEY_ID, 0]);
    return entityKeyId;
  }
  return '';
};

export {
  getEKID,
  getEntitySetIdFromApp,
  getFirstNeighborValue,
};
