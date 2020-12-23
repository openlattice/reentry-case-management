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
  STAFF_MEMBERS: 'staffMembers',
};

const CASE_NOTES :Object = {
  CASE_NOTES: 'caseNotes',
  MEETING: 'meeting',
  STAFF_BY_MEETING_EKID: 'staffByMeetingEKID',
  TASK: 'task',
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

const PARTICIPANT_FOLLOW_UPS :Object = {
  FOLLOW_UP_NEIGHBOR_MAP: 'followUpNeighborMap',
  MEETING_NOTES_STAFF_MAP: 'meetingNotesStaffMap',
  PARTICIPANT_FOLLOW_UPS: 'participantFollowUps',
  REENTRY_STAFF_MEMBERS: 'reentryStaffMembers',
};

const PROVIDERS :Object = {
  CONTACT_INFO_BY_CONTACT_PERSON_EKID: 'contactInfoByContactPersonEKID',
  PROVIDERS: 'providers',
  PROVIDERS_LIST: 'providersList',
  PROVIDER_NEIGHBOR_MAP: 'providerNeighborMap',
};

const PROFILE :Object = {
  CONTACT_NAME_BY_PROVIDER_EKID: 'contactNameByProviderEKID',
  EDUCATION_FORM_DATA: 'educationFormData',
  EMERGENCY_CONTACT_INFO_BY_CONTACT: 'emergencyContactInfoByContact',
  PARTICIPANT: 'participant',
  PARTICIPANT_NEIGHBORS: 'participantNeighbors',
  PERSON_DETAILS_FORM_DATA: 'personDetailsFormData',
  PERSON_FORM_DATA: 'personFormData',
  PROFILE: 'profile',
  PROVIDER_BY_STATUS_EKID: 'providerByStatusEKID',
  STATE_ID_FORM_DATA: 'stateIdFormData',
  SUPERVISION_NEIGHBORS: 'supervisionNeighbors',
};

const RELEASES :Object = {
  JAILS_BY_JAIL_STAY_EKID: 'jailsByJailStayEKID',
  JAIL_STAYS_BY_PERSON_EKID: 'jailStaysByPersonEKID',
  PEOPLE_BY_JAIL_STAY_EKID: 'peopleByJailStayEKID',
  RELEASES: 'releases',
  SEARCHED_JAIL_STAYS: 'searchedJailStays',
  SEARCHED_PEOPLE: 'searchedPeople',
  SELECTED_PERSON: 'selectedPerson',
  SELECTED_RELEASE_DATE: 'selectedReleaseDate',
};

const REPORTS :Object = {
  NUMBER_OF_INTAKES_PER_MONTH: 'numberOfIntakesPerMonth',
  NUMBER_OF_INTAKES_THIS_MONTH: 'numberOfIntakesThisMonth',
  NUMBER_OF_RELEASES_THIS_WEEK: 'numberOfReleasesThisWeek',
  REPORTS: 'reports',
  SERVICES_TABLE_DATA: 'servicesTableData',
};

const TASK_MANAGER :Object = {
  FOLLOW_UPS: 'followUps',
  PARTICIPANTS: 'participants',
  TASK_MANAGER: 'taskManager',
};

export {
  APP,
  CASE_NOTES,
  EDM,
  EVENT,
  INTAKE,
  PARTICIPANTS,
  PARTICIPANT_FOLLOW_UPS,
  PROFILE,
  PROVIDERS,
  RELEASES,
  REPORTS,
  SHARED,
  TASK_MANAGER,
};
