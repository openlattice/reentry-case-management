/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
  get,
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  DELETE_PARTICIPANT_AND_NEIGHBORS,
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  GET_SUPERVISION_NEIGHBORS,
  LOAD_PERSON_INFO_FOR_EDIT,
  LOAD_PROFILE,
  deleteParticipantAndNeighbors,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  getSupervisionNeighbors,
  loadPersonInfoForEdit,
  loadProfile,
} from './ProfileActions';
import { getEmergencyContactInfo } from './contacts/ContactInfoActions';
import { getEmergencyContactInfoWorker } from './contacts/ContactInfoSagas';
import {
  getEducationFormData,
  getPersonDetailsFormData,
  getPersonFormData,
  getStateIdFormData,
} from './utils/EditPersonUtils';
import { addContactInfoToDataToDelete } from './utils/ProfileUtils';

import Logger from '../../utils/Logger';
import { deleteEntities } from '../../core/data/DataActions';
import { deleteEntitiesWorker } from '../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getAssociationDetails,
  getAssociationESID,
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { DST, SRC } from '../../utils/constants/GeneralConstants';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { getStaffWhoRecordedNotes } from '../casenotes/CaseNotesActions';
import { getStaffWhoRecordedNotesWorker } from '../casenotes/CaseNotesSagas';
import { getIncarcerationFacilities } from '../intake/IntakeActions';
import { getIncarcerationFacilitiesWorker } from '../intake/IntakeSagas';

const LOG = new Logger('ProfileSagas');

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ATTORNEYS,
  CONTACT_INFO,
  COUNTY_ID,
  EDUCATION,
  EMERGENCY_CONTACT,
  EMERGENCY_CONTACT_INFO,
  EMPLOYEE,
  EMPLOYMENT,
  ENROLLMENT_STATUS,
  FOLLOW_UPS,
  HEARINGS,
  IS_EMERGENCY_CONTACT_FOR,
  LOCATION,
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  MEETINGS,
  NEEDS_ASSESSMENT,
  OFFICERS,
  PEOPLE,
  PERSON_DETAILS,
  PROBATION_PAROLE,
  PROVIDER,
  PROVIDER_STAFF,
  REFERRAL_REQUEST,
  SEX_OFFENDER,
  SEX_OFFENDER_REGISTRATION_LOCATION,
  STATE_ID,
} = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * ProfileActions.deleteParticipantAndNeighbors()
 *
 */

function* deleteParticipantAndNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(deleteParticipantAndNeighbors.request(id, value));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const personEKID :UUID = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);

    let dataToDelete = [
      { entitySetId: peopleESID, entityKeyIds: [personEKID] },
    ];

    const addressESID :UUID = getESIDFromApp(app, LOCATION);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);
    const countyIdESID :UUID = getESIDFromApp(app, COUNTY_ID);
    const educationESID :UUID = getESIDFromApp(app, EDUCATION);
    const emergencyContactESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT);
    const employeeESID :UUID = getESIDFromApp(app, EMPLOYEE);
    const employmentESID :UUID = getESIDFromApp(app, EMPLOYMENT);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const followUpsESID :UUID = getESIDFromApp(app, FOLLOW_UPS);
    const hearingsESID :UUID = getESIDFromApp(app, HEARINGS);
    const manualJailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const probationParoleESID :UUID = getESIDFromApp(app, PROBATION_PAROLE);
    const referralToReentryESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);
    const sexOffenderESID :UUID = getESIDFromApp(app, SEX_OFFENDER);
    const sexOffenderRegistrationLocationESID :UUID = getESIDFromApp(app, SEX_OFFENDER_REGISTRATION_LOCATION);
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);

    let filter = {
      entityKeyIds: [personEKID],
      sourceEntitySetIds: [emergencyContactESID, employeeESID],
      destinationEntitySetIds: [
        addressESID,
        contactInfoESID,
        countyIdESID,
        educationESID,
        employmentESID,
        enrollmentStatusESID,
        followUpsESID,
        hearingsESID,
        manualJailStaysESID,
        meetingsESID,
        needsAssessmentESID,
        personDetailsESID,
        probationParoleESID,
        referralToReentryESID,
        sexOffenderESID,
        sexOffenderRegistrationLocationESID,
        stateIdESID,
      ],
    };
    let response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter })
    );
    if (response.error) throw response.error;
    const neighbors = fromJS(response.data);
    const emergencyContactEKIDs :UUID[] = [];
    const employeeEKIDs :UUID[] = [];
    const employmentEKIDs :UUID[] = [];

    const neighborEKIDsByESID = Map().withMutations((mutator :Map) => {
      neighbors.forEach((neighborList :List) => {
        neighborList.forEach((neighbor :Map) => {
          const neighborESID :UUID = getNeighborESID(neighbor);
          const neighborEKID :UUID = getEKID(getNeighborDetails(neighbor));

          if (neighborESID === emergencyContactESID) emergencyContactEKIDs.push(neighborEKID);
          if (neighborESID === employeeESID) employeeEKIDs.push(neighborEKID);
          if (neighborESID === employmentESID) employmentEKIDs.push(neighborEKID);

          let ekidList :List = mutator.get(neighborESID, List());
          ekidList = ekidList.push(neighborEKID);
          mutator.set(neighborESID, ekidList);
        });
      });
    });

    neighborEKIDsByESID.forEach((ekidList :List, neighborESID :UUID) => {
      dataToDelete.push({ entitySetId: neighborESID, entityKeyIds: ekidList.toJS() });
    });

    const emergencyContactInfoESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT_INFO);
    if (emergencyContactEKIDs.length) {
      filter = {
        entityKeyIds: emergencyContactEKIDs,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [emergencyContactInfoESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: emergencyContactESID, filter })
      );
      if (response.error) throw response.error;
      const emergencyContactInfoEKIDs :UUID[] = [];
      fromJS(response.data).forEach((neighborList :List) => {
        neighborList.forEach((neighbor :Map) => {
          emergencyContactInfoEKIDs.push(getEKID(getNeighborDetails(neighbor)));
        });
      });
      dataToDelete.push({ entitySetId: emergencyContactInfoESID, entityKeyIds: emergencyContactInfoEKIDs });
    }

    if (employeeEKIDs.length) {
      const officersESID = getESIDFromApp(app, OFFICERS);
      filter = { entityKeyIds: employeeEKIDs, destinationEntitySetIds: [], sourceEntitySetIds: [officersESID] };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: employeeESID, filter })
      );
      if (response.error) throw response.error;
      const officerEKIDs :UUID[] = [];
      fromJS(response.data).forEach((neighborList) => {
        const officerEKID = getEKID(getNeighborDetails(neighborList.get(0, Map())));
        dataToDelete.push({ entitySetId: officersESID, entityKeyIds: [officerEKID] });
        officerEKIDs.push(officerEKID);
      });
      filter = { entityKeyIds: officerEKIDs, destinationEntitySetIds: [contactInfoESID], sourceEntitySetIds: [] };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: officersESID, filter })
      );
      if (response.error) throw response.error;
      dataToDelete = addContactInfoToDataToDelete(response.data, dataToDelete, contactInfoESID);
    }

    if (employmentEKIDs.length) {
      const attorneysESID = getESIDFromApp(app, ATTORNEYS);
      filter = { entityKeyIds: employmentEKIDs, destinationEntitySetIds: [], sourceEntitySetIds: [attorneysESID] };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: employmentESID, filter })
      );
      if (response.error) throw response.error;
      const attorneyEKIDs :UUID[] = [];
      fromJS(response.data).forEach((neighborList) => {
        const attorneyEKID = getEKID(getNeighborDetails(neighborList.get(0, Map())));
        dataToDelete.push({ entitySetId: attorneysESID, entityKeyIds: [attorneyEKID] });
        attorneyEKIDs.push(attorneyEKID);
      });
      filter = { entityKeyIds: attorneyEKIDs, destinationEntitySetIds: [contactInfoESID], sourceEntitySetIds: [] };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: attorneysESID, filter })
      );
      if (response.error) throw response.error;
      dataToDelete = addContactInfoToDataToDelete(response.data, dataToDelete, contactInfoESID);
    }

    response = yield call(deleteEntitiesWorker, deleteEntities(dataToDelete));
    if (response.error) throw response.error;

    yield put(deleteParticipantAndNeighbors.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(deleteParticipantAndNeighbors.failure(id, error));
  }
  finally {
    yield put(deleteParticipantAndNeighbors.finally(id));
  }
}

function* deleteParticipantAndNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_PARTICIPANT_AND_NEIGHBORS, deleteParticipantAndNeighborsWorker);
}

/*
 *
 * ProfileActions.getEnrollmentStatusNeighbors()
 *
 */

function* getEnrollmentStatusNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getEnrollmentStatusNeighbors.request(id, value));
    const { enrollmentStatusEKIDs } = value;

    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    let searchFilter :Object = {
      entityKeyIds: enrollmentStatusEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [providersESID],
    };
    let response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    let providerByStatusEKID :Map = Map();
    const providerEKIDs :UUID[] = [];
    fromJS(response.data).forEach((neighborList :List, enrollmentStatusEKID :UUID) => {
      const entity :Map = getNeighborDetails(neighborList.first());
      providerByStatusEKID = providerByStatusEKID.set(enrollmentStatusEKID, entity);
      providerEKIDs.push(getEKID(entity));
    });

    let contactNameByProviderEKID :Map = Map();
    if (providerEKIDs.length) {
      const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
      searchFilter = {
        entityKeyIds: providerEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [providerStaffESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      fromJS(response.data).forEach((neighborList :List, providerEKID :UUID) => {
        const firstContactPerson :Map = getNeighborDetails(neighborList.first());
        const contactName :string = getPersonFullName(firstContactPerson);
        contactNameByProviderEKID = contactNameByProviderEKID.set(providerEKID, contactName);
      });
    }

    yield put(getEnrollmentStatusNeighbors.success(id, { contactNameByProviderEKID, providerByStatusEKID }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEnrollmentStatusNeighbors.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatusNeighbors.finally(id));
  }
}

function* getEnrollmentStatusNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUS_NEIGHBORS, getEnrollmentStatusNeighborsWorker);
}

/*
 *
 * ProfileActions.getSupervisionNeighbors()
 *
 */

function* getSupervisionNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getSupervisionNeighbors.request(id, value));
    const personNeighborMap :Map = value;

    const app = yield select(getAppFromState);
    const attorneysESID :UUID = getESIDFromApp(app, ATTORNEYS);
    const officersESID :UUID = getESIDFromApp(app, OFFICERS);

    let attorney :Map = Map();
    const attorneyEmploymentEntityList = get(personNeighborMap, EMPLOYMENT);
    if (isDefined(attorneyEmploymentEntityList) && !attorneyEmploymentEntityList.isEmpty()) {
      const attorneyEmploymentEKID :UUID = getEKID(attorneyEmploymentEntityList.get(0));
      const employmentESID :UUID = getESIDFromApp(app, EMPLOYMENT);
      const filter = {
        entityKeyIds: [attorneyEmploymentEKID],
        destinationEntitySetIds: [],
        sourceEntitySetIds: [attorneysESID],
      };
      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: employmentESID, filter })
      );
      if (response.error) throw response.error;
      const neighbors = fromJS(response.data);
      if (!neighbors.isEmpty()) {
        attorney = getNeighborDetails(neighbors.getIn([attorneyEmploymentEKID, 0]));
      }
    }

    let officer :Map = Map();
    const officerEmployeeEntityList = get(personNeighborMap, EMPLOYEE);
    if (isDefined(officerEmployeeEntityList) && !officerEmployeeEntityList.isEmpty()) {
      const officerEmployeeEKID :UUID = getEKID(officerEmployeeEntityList.get(0));
      const employeeESID :UUID = getESIDFromApp(app, EMPLOYEE);
      const filter = {
        entityKeyIds: [officerEmployeeEKID],
        destinationEntitySetIds: [],
        sourceEntitySetIds: [officersESID],
      };
      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: employeeESID, filter })
      );
      if (response.error) throw response.error;
      const neighbors = fromJS(response.data);
      if (!neighbors.isEmpty()) {
        officer = getNeighborDetails(neighbors.getIn([officerEmployeeEKID, 0]));
      }
    }

    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);
    let contactInfo :Map = Map().asMutable();

    if (!attorney.isEmpty()) {
      const attorneyEKID :UUID = getEKID(attorney);
      const filter = {
        entityKeyIds: [attorneyEKID],
        destinationEntitySetIds: [contactInfoESID],
        sourceEntitySetIds: [],
      };
      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: attorneysESID, filter })
      );
      if (response.error) throw response.error;
      const neighbors = fromJS(response.data);
      const attorneyContactInfo :List = neighbors
        .get(attorneyEKID, List())
        .map((neighbor :Map) => getNeighborDetails(neighbor));
      contactInfo.set(ATTORNEYS, attorneyContactInfo);
    }

    if (!officer.isEmpty()) {
      const officerEKID :UUID = getEKID(officer);
      const filter = {
        entityKeyIds: [officerEKID],
        destinationEntitySetIds: [contactInfoESID],
        sourceEntitySetIds: [],
      };
      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: officersESID, filter })
      );
      if (response.error) throw response.error;
      const neighbors = fromJS(response.data);
      const officerContactInfo :List = neighbors
        .get(officerEKID, List())
        .map((neighbor :Map) => getNeighborDetails(neighbor));
      contactInfo.set(OFFICERS, officerContactInfo);
    }
    contactInfo = contactInfo.asImmutable();

    const supervisionNeighbors = Map().withMutations((mutator :Map) => {
      if (!attorney.isEmpty()) mutator.set(ATTORNEYS, attorney);
      if (!officer.isEmpty()) mutator.set(OFFICERS, officer);
      if (!contactInfo.isEmpty()) mutator.set(CONTACT_INFO, contactInfo);
    });

    yield put(getSupervisionNeighbors.success(id, supervisionNeighbors));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getSupervisionNeighbors.failure(id, error));
  }
  finally {
    yield put(getSupervisionNeighbors.finally(id));
  }
}

function* getSupervisionNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_SUPERVISION_NEIGHBORS, getSupervisionNeighborsWorker);
}

/*
 *
 * ProfileActions.getParticipantNeighbors()
 *
 */

function* getParticipantNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};

  try {
    yield put(getParticipantNeighbors.request(id, value));
    const { neighborsToGet, participantEKID } = value;

    const app = yield select(getAppFromState);
    const participantsESID :UUID = getESIDFromApp(app, PEOPLE);

    const searchFilter = {
      entityKeyIds: [participantEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [],
    };
    neighborsToGet.forEach((neighborMap :Object) => {
      const { direction, neighborESID } = neighborMap;
      if (direction === DST) searchFilter.destinationEntitySetIds.push(neighborESID);
      if (direction === SRC) searchFilter.sourceEntitySetIds.push(neighborESID);
    });

    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: participantsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;

    let personNeighborMap :Map = Map();
    const neighbors :Map = fromJS(response.data);
    if (!neighbors.isEmpty()) {
      neighbors.forEach((neighborList :List) => {
        neighborList.forEach((neighbor :Map) => {
          const associationESID :UUID = getAssociationESID(neighbor);
          if (associationESID === getESIDFromApp(app, IS_EMERGENCY_CONTACT_FOR)) {
            personNeighborMap = personNeighborMap.setIn(
              [IS_EMERGENCY_CONTACT_FOR, getEKID(getNeighborDetails(neighbor))],
              getAssociationDetails(neighbor)
            );
          }

          const neighborESID :UUID = getNeighborESID(neighbor);
          const neighborEntityFqn :FQN = getFqnFromApp(app, neighborESID);
          const entity :Map = getNeighborDetails(neighbor);
          let entityList :List = personNeighborMap.get(neighborEntityFqn, List());
          entityList = entityList.push(entity);
          personNeighborMap = personNeighborMap.set(neighborEntityFqn, entityList);
        });
        return personNeighborMap;
      });
    }
    if (isDefined(get(personNeighborMap, ENROLLMENT_STATUS))) {
      const enrollmentStatusEKIDs :UUID[] = personNeighborMap.get(ENROLLMENT_STATUS)
        .map((statusEntity :Map) => getEKID(statusEntity))
        .toJS();
      yield call(getEnrollmentStatusNeighborsWorker, getEnrollmentStatusNeighbors({ enrollmentStatusEKIDs }));
    }
    if (isDefined(get(personNeighborMap, EMERGENCY_CONTACT))) {
      const emergencyContactEKIDs :UUID[] = personNeighborMap.get(EMERGENCY_CONTACT)
        .map((emergencyContact :Map) => getEKID(emergencyContact))
        .toJS();
      yield call(getEmergencyContactInfoWorker, getEmergencyContactInfo({ emergencyContactEKIDs }));
    }
    if (isDefined(get(personNeighborMap, MANUAL_JAIL_STAYS))) {
      const manualJailStaysEKID :UUID = getEKID(personNeighborMap.getIn([MANUAL_JAIL_STAYS, 0]));
      const manualJailStayESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
      const manualJailsPrisonsESID :UUID = getESIDFromApp(app, MANUAL_JAILS_PRISONS);
      const jailStayFilter = {
        entityKeyIds: [manualJailStaysEKID],
        destinationEntitySetIds: [manualJailsPrisonsESID],
        sourceEntitySetIds: [],
      };
      const jailStayResponse :Object = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: manualJailStayESID, filter: jailStayFilter })
      );
      if (jailStayResponse.error) throw jailStayResponse.error;
      const jailStayNeighbors :Map = fromJS(jailStayResponse.data);
      const facility :Map = getNeighborDetails(jailStayNeighbors.getIn([manualJailStaysEKID, 0]));
      personNeighborMap = personNeighborMap.set(MANUAL_JAILS_PRISONS, List([facility]));
    }
    if (isDefined(get(personNeighborMap, MEETINGS))) {
      const meetingEKIDs :UUID[] = personNeighborMap.get(MEETINGS)
        .map((meeting :Map) => getEKID(meeting))
        .toJS();
      yield call(getStaffWhoRecordedNotesWorker, getStaffWhoRecordedNotes({ meetingEKIDs }));
    }
    if (isDefined(get(personNeighborMap, EMPLOYMENT)) || isDefined(get(personNeighborMap, EMPLOYEE))) {
      yield call(getSupervisionNeighborsWorker, getSupervisionNeighbors(personNeighborMap));
    }

    workerResponse.data = personNeighborMap;
    yield put(getParticipantNeighbors.success(id, personNeighborMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipantNeighbors.failure(id, error));
  }
  finally {
    yield put(getParticipantNeighbors.finally(id));
  }
  return workerResponse;
}

function* getParticipantNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_NEIGHBORS, getParticipantNeighborsWorker);
}

/*
 *
 * ProfileActions.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};

  try {
    yield put(getParticipant.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);

    const response :Object = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: peopleESID, entityKeyId: participantEKID })
    );
    if (response.error) {
      throw response.error;
    }
    const participant :Map = fromJS(response.data);

    workerResponse.data = response.data;
    yield put(getParticipant.success(id, participant));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
  return workerResponse;
}

function* getParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT, getParticipantWorker);
}

/*
 *
 * ProfileActions.loadPersonInfoForEdit()
 *
 */

function* loadPersonInfoForEditWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(loadPersonInfoForEdit.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);
    const educationESID :UUID = getESIDFromApp(app, EDUCATION);
    const neighborsToGet = [
      { direction: DST, neighborESID: personDetailsESID },
      { direction: DST, neighborESID: stateIdESID },
      { direction: DST, neighborESID: educationESID },
    ];
    const workerResponses :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) throw responseError;

    const getParticipantNeighborsResponse = workerResponses[0];
    const participantNeighborMap :Map = getParticipantNeighborsResponse.data;
    const personDetailsFormData :Object = getPersonDetailsFormData(participantNeighborMap);
    const stateIdFormData :Object = getStateIdFormData(participantNeighborMap);
    const educationFormData :Object = getEducationFormData(participantNeighborMap);

    const getParticipantResponse = workerResponses[1];
    const participant :Map = fromJS(getParticipantResponse.data);
    const personFormData :Object = getPersonFormData(participant);

    yield put(loadPersonInfoForEdit.success(id, {
      educationFormData,
      personDetailsFormData,
      personFormData,
      stateIdFormData,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadPersonInfoForEdit.failure(id, error));
  }
  finally {
    yield put(loadPersonInfoForEdit.finally(id));
  }
}

function* loadPersonInfoForEditWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_PERSON_INFO_FOR_EDIT, loadPersonInfoForEditWorker);
}

/*
 *
 * ProfileActions.loadProfile()
 *
 */

function* loadProfileWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(loadProfile.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const addressESID :UUID = getESIDFromApp(app, LOCATION);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);
    const countyIdESID :UUID = getESIDFromApp(app, COUNTY_ID);
    const educationESID :UUID = getESIDFromApp(app, EDUCATION);
    const emergencyContactESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT);
    const employeeESID :UUID = getESIDFromApp(app, EMPLOYEE);
    const employmentESID :UUID = getESIDFromApp(app, EMPLOYMENT);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const hearingsESID :UUID = getESIDFromApp(app, HEARINGS);
    const manualJailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const meetingsESID :UUID = getESIDFromApp(app, MEETINGS);
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const probationParoleESID :UUID = getESIDFromApp(app, PROBATION_PAROLE);
    const referralToReentryESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);
    const sexOffenderESID :UUID = getESIDFromApp(app, SEX_OFFENDER);
    const sexOffenderRegistrationLocationESID :UUID = getESIDFromApp(app, SEX_OFFENDER_REGISTRATION_LOCATION);
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);
    const neighborsToGet = [
      { direction: DST, neighborESID: addressESID },
      { direction: DST, neighborESID: contactInfoESID },
      { direction: DST, neighborESID: countyIdESID },
      { direction: DST, neighborESID: educationESID },
      { direction: DST, neighborESID: enrollmentStatusESID },
      { direction: DST, neighborESID: hearingsESID },
      { direction: DST, neighborESID: manualJailStaysESID },
      { direction: DST, neighborESID: needsAssessmentESID },
      { direction: DST, neighborESID: personDetailsESID },
      { direction: DST, neighborESID: referralToReentryESID },
      { direction: DST, neighborESID: sexOffenderESID },
      { direction: DST, neighborESID: sexOffenderRegistrationLocationESID },
      { direction: DST, neighborESID: stateIdESID },
      { direction: SRC, neighborESID: emergencyContactESID },
      { direction: DST, neighborESID: meetingsESID },
      { direction: DST, neighborESID: probationParoleESID },
      { direction: DST, neighborESID: employmentESID }, // attorney
      { direction: SRC, neighborESID: employeeESID }, // probation/parole officer
    ];
    const workerResponses :Object[] = yield all([
      call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKID })),
      call(getParticipantWorker, getParticipant({ participantEKID })),
      call(getIncarcerationFacilitiesWorker, getIncarcerationFacilities()),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }

    yield put(loadProfile.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadProfile.failure(id, error));
  }
  finally {
    yield put(loadProfile.finally(id));
  }
}

function* loadProfileWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_PROFILE, loadProfileWorker);
}

export {
  deleteParticipantAndNeighborsWatcher,
  deleteParticipantAndNeighborsWorker,
  getEnrollmentStatusNeighborsWatcher,
  getEnrollmentStatusNeighborsWorker,
  getParticipantNeighborsWatcher,
  getParticipantNeighborsWorker,
  getParticipantWatcher,
  getParticipantWorker,
  getSupervisionNeighborsWatcher,
  getSupervisionNeighborsWorker,
  loadPersonInfoForEditWatcher,
  loadPersonInfoForEditWorker,
  loadProfileWatcher,
  loadProfileWorker,
};
