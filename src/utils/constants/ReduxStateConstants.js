// @flow

const SHARED :Object = {
  ACTIONS: 'actions',
  REQUEST_STATE: 'requestState',
  TOTAL_HITS: 'totalHits',
};

const APP :Object = {
  APP: 'app',
  APP_TYPES_BY_ORG_ID: 'appTypesByOrgId',
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

const EVENT :Object = {
  EVENT: 'event',
  PROVIDERS: 'providers',
};

const RELEASES :Object = {
  JAILS_BY_JAIL_STAY_EKID: 'jailsByJailStayEKID',
  JAIL_STAYS_BY_PERSON_EKID: 'jailStaysByPersonEKID',
  PEOPLE_BY_JAIL_STAY_EKID: 'peopleByJailStayEKID',
  RELEASES: 'releases',
  SEARCHED_JAIL_STAYS: 'searchedJailStays',
  SEARCHED_PEOPLE: 'searchedPeople',
};

const INTAKE :Object = {
  INCARCERATION_FACILITIES: 'incarcerationFacilities',
  INTAKE: 'intake',
  NEW_PARTICIPANT_EKID: 'newParticipantEKID',
};

const PARTICIPANTS :Object = {
  JAIL_NAMES_BY_JAIL_STAY_EKID: 'jailNamesByJailStayEKID',
  NEIGHBORS: 'neighbors',
  PARTICIPANTS: 'participants',
  SEARCHED_PARTICIPANTS: 'searchedParticipants',
};

export {
  APP,
  EDM,
  EVENT,
  INTAKE,
  PARTICIPANTS,
  RELEASES,
  SHARED,
};
