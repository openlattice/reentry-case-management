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

const RELEASES :Object = {
  JAILS_BY_JAIL_STAY_EKID: 'jailsByJailStayEKID',
  JAIL_STAYS_BY_PERSON_EKID: 'jailStaysByPersonEKID',
  PEOPLE_BY_JAIL_STAY_EKID: 'peopleByJailStayEKID',
  RELEASES: 'releases',
  SEARCHED_JAIL_STAYS: 'searchedJailStays',
  SEARCHED_PEOPLE: 'searchedPeople',
  TOTAL_HITS: 'totalHits',
};

const PERSON_INFORMATION_FORM :Object = {
  INCARCERATION_FACILITIES: 'incarcerationFacilities',
  PERSON_INFORMATION_FORM: 'personInformationForm',
};

export {
  APP,
  EDM,
  PERSON_INFORMATION_FORM,
  RELEASES,
  SHARED,
};
