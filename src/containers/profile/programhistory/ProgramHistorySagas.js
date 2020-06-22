// @flow
import isNumber from 'lodash/isNumber';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import {
  List,
  Map,
  Set,
  fromJS,
  get,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  ASSOCIATION_DETAILS,
  getEKID,
  getESIDFromApp,
  getPropertyFqnFromEDM
} from '../../../utils/DataUtils';
import { createOrReplaceAssociation, submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import {
  createOrReplaceAssociationWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker,
} from '../../../core/data/DataSagas';
import { getEnrollmentStatusNeighbors } from '../ProfileActions';
import { getEnrollmentStatusNeighborsWorker } from '../ProfileSagas';
import {
  EDIT_EVENT,
  EDIT_RELEASE_INFO,
  editEvent,
  editReleaseInfo,
} from './ProgramHistoryActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP, EDM, PROFILE } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { processAssociationEntityData } = DataProcessingUtils;
const {
  ASSIGNED_TO,
  ENROLLMENT_STATUS,
  MANUAL_JAIL_STAYS,
  MANUAL_SUBJECT_OF,
  NEEDS_ASSESSMENT,
  PEOPLE,
  PROVIDER,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { PARTICIPANT_NEIGHBORS } = PROFILE;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const getProfileFromState = (state) => state.get(PROFILE.PROFILE, Map());

const LOG = new Logger('ProgramHistorySagas');

/*
 *
 * ProgramHistoryActions.editReleaseInfo()
 *
 */

function* editReleaseInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editReleaseInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData, personEKID } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const referralESID :UUID = getESIDFromApp(app, REFERRAL_REQUEST);

    const entityDataToEdit = {};
    const entityDataForFirstTimeSubmission = {};
    const associations = [];

    const jailStayData = get(entityData, jailStaysESID);
    if (isDefined(jailStayData)) {
      const key = Object.keys(jailStayData)[0];
      if (isValidUUID(key)) {
        entityDataToEdit[jailStaysESID] = jailStayData;
      }
      else if (isNumber(parseInt(key, 10))) {
        entityDataForFirstTimeSubmission[jailStaysESID] = [Object.values(jailStayData)[0]];
        associations.push([MANUAL_SUBJECT_OF, personEKID, PEOPLE, 0, MANUAL_JAIL_STAYS, {}]);
      }
    }

    const referralData = get(entityData, referralESID);
    if (isDefined(referralData)) {
      const key = Object.keys(referralData)[0];
      if (isValidUUID(key)) {
        entityDataToEdit[referralESID] = referralData;
      }
      else if (isNumber(parseInt(key, 10))) {
        entityDataForFirstTimeSubmission[referralESID] = [Object.values(referralData)[0]];
        associations.push([MANUAL_SUBJECT_OF, personEKID, PEOPLE, 0, REFERRAL_REQUEST, {}]);
      }
    }

    let newEntities :Map = Map().asMutable();

    if (Object.values(entityDataForFirstTimeSubmission).length) {
      const selectedOrgId :string = app.get(SELECTED_ORG_ID);
      const entitySetIdsByFqn = app.getIn([ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId]);
      const propertyTypeIdsByFqn = edm.getIn([TYPE_IDS_BY_FQN, PROPERTY_TYPES]);

      const associationEntityData = processAssociationEntityData(
        fromJS(associations),
        entitySetIdsByFqn,
        propertyTypeIdsByFqn
      );

      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData, entityData: entityDataForFirstTimeSubmission })
      );
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;

      if (entityKeyIds[jailStaysESID]) {
        const newJailStayEKID :UUID = entityKeyIds[jailStaysESID][0];
        const newJailStay :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, Set([newJailStayEKID]));
          fromJS(entityDataForFirstTimeSubmission[jailStaysESID][0]).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
        });
        newEntities.set(MANUAL_JAIL_STAYS, newJailStay);
      }
      if (entityKeyIds[referralESID]) {
        const newReferralEKID :UUID = entityKeyIds[referralESID][0];
        const newReferral :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, Set([newReferralEKID]));
          fromJS(entityDataForFirstTimeSubmission[referralESID][0]).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
        });
        newEntities.set(REFERRAL_REQUEST, newReferral);
      }
    }

    if (Object.values(entityDataToEdit).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData: entityDataToEdit })
      );
      if (response.error) throw response.error;

      if (entityDataToEdit[jailStaysESID]) {
        const data = Object.values(entityDataToEdit[jailStaysESID])[0];
        const jailStayEKID :UUID = Object.keys(entityDataToEdit[jailStaysESID])[0];
        const editedJailStay :Map = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, Set([jailStayEKID]));
        });
        newEntities.set(MANUAL_JAIL_STAYS, editedJailStay);
      }
      if (entityDataToEdit[referralESID]) {
        const data = Object.values(entityDataToEdit[referralESID])[0];
        const referralEKID :UUID = Object.keys(entityDataToEdit[referralESID])[0];
        const editedReferral :Map = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, Set([referralEKID]));
        });
        newEntities.set(REFERRAL_REQUEST, editedReferral);
      }
    }

    newEntities = newEntities.asImmutable();

    yield put(editReleaseInfo.success(id, newEntities));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editReleaseInfo.failure(id, error));
  }
  finally {
    yield put(editReleaseInfo.finally(id));
  }
}

function* editReleaseInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_RELEASE_INFO, editReleaseInfoWorker);
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

export {
  editEventWatcher,
  editEventWorker,
  editReleaseInfoWatcher,
  editReleaseInfoWorker,
};
