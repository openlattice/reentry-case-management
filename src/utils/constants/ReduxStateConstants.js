// @flow

const SHARED :Object = {
  ACTIONS: 'actions',
  REQUEST_STATE: 'requestState',
};

const APP :Object = {
  APP: 'app',
  ENTITY_SET_IDS_BY_ORG_ID: 'entitySetIdsByOrgId',
  INITIALIZE_APPLICATION: 'initializeApplication',
  ORGS: 'organizations',
  SELECTED_ORG_ID: 'selectedOrgId',
};

const EDM :Object = {
  ASSOCIATION_TYPES: 'associationTypes',
  EDM: 'edm',
  ENTITY_TYPES: 'entityTypes',
  PROPERTY_TYPES: 'propertyTypes',
  TYPES_BY_ID: 'typesById',
  TYPE_IDS_BY_FQN: 'typeIdsByFqn',
};

const PEOPLE :Object = {
  PEOPLE: 'people',
  PEOPLE_BY_JAIL_STAY: 'peopleByJailStay',
};

const RELEASES :Object = {
  JAILS_BY_JAIL_STAY_EKID: 'jailsByJailStayEKID',
};

export {
  APP,
  EDM,
  PEOPLE,
  RELEASES,
  SHARED,
};
