/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  EDIT_EVENT,
  EDIT_FACILITY_RELEASED_FROM,
  EDIT_REFERRAL_SOURCE,
  EDIT_RELEASE_DATE,
  SUBMIT_REFERRAL_SOURCE,
  SUBMIT_RELEASE_DATE,
  editEvent,
  editFacilityReleasedFrom,
  editReferralSource,
  editReleaseDate,
  submitReferralSource,
  submitReleaseDate,
} from './ProgramHistoryActions';

import Logger from '../../../utils/Logger';
import { createOrReplaceAssociation, submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import {
  createOrReplaceAssociationWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker,
} from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  ASSOCIATION_DETAILS,
  getEKID,
  getESIDFromApp,
  getPTIDFromEDM,
  getPropertyFqnFromEDM,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import {
  APP,
  EDM,
  INTAKE,
  PROFILE,
} from '../../../utils/constants/ReduxStateConstants';
import { getEnrollmentStatusNeighbors } from '../ProfileActions';
import { getEnrollmentStatusNeighborsWorker } from '../ProfileSagas';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ASSIGNED_TO,
  ENROLLMENT_STATUS,
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  MANUAL_LOCATED_AT,
  NEEDS_ASSESSMENT,
  PROVIDER,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, PROJECTED_RELEASE_DATETIME } = PROPERTY_TYPE_FQNS;
const { PARTICIPANT_NEIGHBORS } = PROFILE;
const { INCARCERATION_FACILITIES } = INTAKE;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const getProfileFromState = (state) => state.get(PROFILE.PROFILE, Map());

const LOG = new Logger('ProgramHistorySagas');

/*
 *
 * ProgramHistoryActions.editFacilityReleasedFrom()
 *
 */

function* editFacilityReleasedFromWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editFacilityReleasedFrom.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { associations, jailStayEKID, newFacilityEKID } = value;

    const associationsToDelete = [];

    const app = yield select(getAppFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const facilityESID :UUID = getESIDFromApp(app, MANUAL_JAILS_PRISONS);
    const locatedAtESID :UUID = getESIDFromApp(app, MANUAL_LOCATED_AT);

    const filter = {
      entityKeyIds: [jailStayEKID],
      sourceEntitySetIds: [],
      destinationEntitySetIds: [facilityESID],
    };
    let response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: jailStaysESID, filter })
    );
    if (response.error) throw response.error;
    const enrollmentStatusNeighbors :Map = fromJS(response.data);
    const originalAssociationEKID :UUID = enrollmentStatusNeighbors.getIn([
      jailStayEKID,
      0,
      ASSOCIATION_DETAILS,
      ENTITY_KEY_ID,
      0
    ]);
    if (originalAssociationEKID) {
      associationsToDelete.push({ entitySetId: locatedAtESID, entityKeyIds: [originalAssociationEKID] });
    }

    response = yield call(
      createOrReplaceAssociationWorker,
      createOrReplaceAssociation({ associations, associationsToDelete })
    );
    if (response.error) throw response.error;

    const facilities = yield select((state) => state.getIn([INTAKE.INTAKE, INCARCERATION_FACILITIES], List()));
    const newFacility = facilities.find((facility) => getEKID(facility) === newFacilityEKID);

    yield put(editFacilityReleasedFrom.success(id, newFacility));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editFacilityReleasedFrom.failure(id, error));
  }
  finally {
    yield put(editFacilityReleasedFrom.finally(id));
  }
}

function* editFacilityReleasedFromWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_FACILITY_RELEASED_FROM, editFacilityReleasedFromWorker);
}

/*
 *
 * ProgramHistoryActions.editReferralSource()
 *
 */

function* editReferralSourceWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editReferralSource.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const referralRequestESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);

    let editedReferralRequest :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
      if (response.error) throw response.error;

      if (entityData[referralRequestESID]) {
        const data = Object.values(entityData[referralRequestESID])[0];
        const referralRequestEKID = Object.keys(entityData[referralRequestESID])[0];
        editedReferralRequest = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([referralRequestEKID]));
        });
      }
    }

    yield put(editReferralSource.success(id, editedReferralRequest));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editReferralSource.failure(id, error));
  }
  finally {
    yield put(editReferralSource.finally(id));
  }
}

function* editReferralSourceWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_REFERRAL_SOURCE, editReferralSourceWorker);
}

/*
 *
 * ProgramHistoryActions.editReleaseDate()
 *
 */

function* editReleaseDateWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editReleaseDate.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const projectedReleaseDatetimePTID :UUID = getPTIDFromEDM(edm, PROJECTED_RELEASE_DATETIME);

    const jailStayEKID = Object.keys(entityData[jailStaysESID])[0];
    const releaseDate = entityData[jailStaysESID][jailStayEKID][projectedReleaseDatetimePTID][0];
    if (releaseDate) {
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const releaseDateTime = DateTime.fromSQL(`${releaseDate} ${currentTime}`).toISO();
      entityData[jailStaysESID][jailStayEKID][projectedReleaseDatetimePTID][0] = releaseDateTime;
    }
    let editedJailStay :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData })
      );
      if (response.error) throw response.error;

      if (entityData[jailStaysESID]) {
        const data = Object.values(entityData[jailStaysESID])[0];
        editedJailStay = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([jailStayEKID]));
        });
      }
    }

    yield put(editReleaseDate.success(id, editedJailStay));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editReleaseDate.failure(id, error));
  }
  finally {
    yield put(editReleaseDate.finally(id));
  }
}

function* editReleaseDateWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_RELEASE_DATE, editReleaseDateWorker);
}

/*
 *
 * ProgramHistoryActions.editEvent()
 *
 */

function* editEventWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editEvent.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const {
      enrollmentStatusEKID,
      entityData,
      needsAssessmentEKID,
      newProviderEKID,
    } = value;

    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    const assignedToESID :UUID = getESIDFromApp(app, ASSIGNED_TO);
    let response = {};
    const associationsToDelete = [];

    if (isDefined(newProviderEKID)) {
      const searchFilter = {
        entityKeyIds: [enrollmentStatusEKID],
        sourceEntitySetIds: [providerESID],
        destinationEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const enrollmentStatusNeighbors :Map = fromJS(response.data);
      const associationEKID :UUID = enrollmentStatusNeighbors.getIn([
        enrollmentStatusEKID,
        0,
        ASSOCIATION_DETAILS,
        ENTITY_KEY_ID,
        0
      ]);
      associationsToDelete.push({ entitySetId: assignedToESID, entityKeyIds: [associationEKID] });
    }

    if (associationsToDelete.length) {
      const associations = {
        [assignedToESID]: [
          {
            data: {},
            src: {
              entitySetId: providerESID,
              entityKeyId: newProviderEKID
            },
            dst: {
              entitySetId: enrollmentStatusESID,
              entityKeyId: enrollmentStatusEKID
            }
          }
        ]
      };
      response = yield call(
        createOrReplaceAssociationWorker,
        createOrReplaceAssociation({ associations, associationsToDelete })
      );
      if (response.error) throw response.error;
    }

    response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;
    const edm = yield select(getEdmFromState);

    const newEnrollmentStatusData :Map = Map().withMutations((map :Map) => {
      if (enrollmentStatusEKID) map.set(ENTITY_KEY_ID, List([enrollmentStatusEKID]));
      if (entityData[enrollmentStatusESID] && entityData[enrollmentStatusESID][enrollmentStatusEKID]) {
        fromJS(entityData[enrollmentStatusESID][enrollmentStatusEKID]).forEach((entityValue :List, ptid :UUID) => {
          const propertyFqn = getPropertyFqnFromEDM(edm, ptid);
          map.set(propertyFqn, entityValue);
        });
      }
    });

    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const newNeedsAssessmentData :Map = Map().withMutations((map :Map) => {
      if (needsAssessmentEKID) map.set(ENTITY_KEY_ID, List([needsAssessmentEKID]));
      if (entityData[needsAssessmentESID] && entityData[needsAssessmentESID][needsAssessmentEKID]) {
        fromJS(entityData[needsAssessmentESID][needsAssessmentEKID]).forEach((entityValue :List, ptid :UUID) => {
          const propertyFqn = getPropertyFqnFromEDM(edm, ptid);
          map.set(propertyFqn, entityValue);
        });
      }
    });

    if (isDefined(newProviderEKID)) {
      const profile = yield select(getProfileFromState);
      const existingEnrollmentStatuses :List = profile.getIn([PARTICIPANT_NEIGHBORS, ENROLLMENT_STATUS], List());
      const existingEnrollmentStatusEKIDs :UUID[] = [];
      existingEnrollmentStatuses.forEach((status :Map) => existingEnrollmentStatusEKIDs.push(getEKID(status)));

      yield call(
        getEnrollmentStatusNeighborsWorker,
        getEnrollmentStatusNeighbors({
          enrollmentStatusEKIDs: existingEnrollmentStatusEKIDs
        })
      );
    }

    yield put(editEvent.success(id, { newEnrollmentStatusData, newNeedsAssessmentData }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editEvent.failure(id, error));
  }
  finally {
    yield put(editEvent.finally(id));
  }
}

function* editEventWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_EVENT, editEventWorker);
}

/*
 *
 * ProgramHistoryActions.submitReleaseDate()
 *
 */

function* submitReleaseDateWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitReleaseDate.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newJailStayEKID :UUID = entityKeyIds[jailStaysESID][0];
    const newJailStay :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newJailStayEKID]));
      fromJS(entityData[jailStaysESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitReleaseDate.success(id, newJailStay));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitReleaseDate.failure(id, error));
  }
  finally {
    yield put(submitReleaseDate.finally(id));
  }
}

function* submitReleaseDateWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_RELEASE_DATE, submitReleaseDateWorker);
}

/*
 *
 * ProgramHistoryActions.submitReferralSource()
 *
 */

function* submitReferralSourceWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitReferralSource.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const referralRequestESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newReferralRequestEKID :UUID = entityKeyIds[referralRequestESID][0];
    const newReferralRequest :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newReferralRequestEKID]));
      fromJS(entityData[referralRequestESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitReferralSource.success(id, newReferralRequest));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitReferralSource.failure(id, error));
  }
  finally {
    yield put(submitReferralSource.finally(id));
  }
}

function* submitReferralSourceWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_REFERRAL_SOURCE, submitReferralSourceWorker);
}
export {
  editEventWatcher,
  editEventWorker,
  editFacilityReleasedFromWatcher,
  editFacilityReleasedFromWorker,
  editReferralSourceWatcher,
  editReferralSourceWorker,
  editReleaseDateWatcher,
  editReleaseDateWorker,
  submitReferralSourceWatcher,
  submitReferralSourceWorker,
  submitReleaseDateWatcher,
  submitReleaseDateWorker,
};
