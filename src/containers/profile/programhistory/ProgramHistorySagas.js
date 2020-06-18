// @flow
import isNumber from 'lodash/isNumber';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
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
import { getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import {
  EDIT_RELEASE_INFO,
  editReleaseInfo,
} from './ProgramHistoryActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { processAssociationEntityData } = DataProcessingUtils;
const {
  MANUAL_JAIL_STAYS,
  MANUAL_SUBJECT_OF,
  PEOPLE,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

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

export {
  editReleaseInfoWatcher,
  editReleaseInfoWorker,
};
