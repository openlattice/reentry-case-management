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
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataUtils,
  LangUtils,
  Logger,
  ValidationUtils,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  EDIT_ATTORNEY,
  EDIT_ATTORNEY_CONTACT_INFO,
  EDIT_OFFICER,
  EDIT_OFFICER_CONTACT_INFO,
  EDIT_SUPERVISION,
  SUBMIT_ATTORNEY,
  SUBMIT_ATTORNEY_CONTACT_INFO,
  SUBMIT_OFFICER,
  SUBMIT_OFFICER_CONTACT_INFO,
  SUBMIT_SUPERVISION,
  editAttorney,
  editAttorneyContactInfo,
  editOfficer,
  editOfficerContactInfo,
  editSupervision,
  submitAttorney,
  submitAttorneyContactInfo,
  submitOfficer,
  submitOfficerContactInfo,
  submitSupervision,
} from './SupervisionActions';

import { submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getESIDFromApp,
  getPTIDFromEDM,
  getPropertyFqnFromEDM,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';
import { getNewContactValueFromEditedData } from '../utils/SupervisionUtils';

const { getEntityKeyId } = DataUtils;
const { processAssociationEntityData } = DataProcessingUtils;
const { isDefined } = LangUtils;
const { isValidUUID } = ValidationUtils;
const {
  ATTORNEYS,
  CONTACTED_VIA,
  CONTACT_INFO,
  EMPLOYEE,
  EMPLOYMENT,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, RECOGNIZED_END_DATETIME } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('SupervisionSagas');

/*
 *
 * SupervisionActions.editAttorney()
 *
 */

function* editAttorneyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editAttorney.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const attorneysESID :UUID = getESIDFromApp(app, ATTORNEYS);

    const attorneyEKID = Object.keys(entityData[attorneysESID])[0];

    let editedAttorney :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData })
      );
      if (response.error) throw response.error;

      if (entityData[attorneysESID]) {
        const data = Object.values(entityData[attorneysESID])[0];
        editedAttorney = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([attorneyEKID]));
        });
      }
    }

    yield put(editAttorney.success(id, editedAttorney));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editAttorney.failure(id, error));
  }
  finally {
    yield put(editAttorney.finally(id));
  }
}

function* editAttorneyWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_ATTORNEY, editAttorneyWorker);
}

/*
 *
 * SupervisionActions.editAttorneyContactInfo()
 *
 */

function* editAttorneyContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editAttorneyContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const {
      attorneyContactInfo,
      attorneyEKID,
      entityData,
      formData,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const selectedOrgId = app.get(SELECTED_ORG_ID);
    const entitySetIds = app.getIn([ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map());
    const propertyTypeIds = edm.getIn([TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map());
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);

    let editedContacts :List = List();
    let newContact :Map = Map();

    // case where only 1 contact info entity was created in the Intake
    if (attorneyContactInfo.count() === 1) {
      const { newContactValue, propertyFqn } = getNewContactValueFromEditedData(formData, attorneyContactInfo);
      const newContactPTID = getPTIDFromEDM(edm, propertyFqn);
      const newEntityData = {
        [contactInfoESID]: [{
          [newContactPTID]: [newContactValue]
        }]
      };
      const associations = [
        [CONTACTED_VIA, attorneyEKID, ATTORNEYS, 0, CONTACT_INFO, {}],
      ];
      const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData, entityData: newEntityData })
      );
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;
      const newContactEKID = entityKeyIds[contactInfoESID][0];

      newContact = Map().withMutations((map :Map) => {
        map.set(ENTITY_KEY_ID, List([newContactEKID]));
        map.set(getPropertyFqnFromEDM(edm, newContactPTID), List([newContactValue]));
      });
    }

    if (Object.values(entityData).length) {
      const updatedEntityData = Map().withMutations((mutator :Map) => {
        mutator.set(contactInfoESID, Map());
        fromJS(entityData).get(contactInfoESID).forEach((entityMap :Map, key :string) => {
          if (isValidUUID(key)) {
            mutator.setIn([contactInfoESID, key], entityMap);
          }
        });
      });

      if (!updatedEntityData.isEmpty()) {
        const response :Object = yield call(
          submitPartialReplaceWorker,
          submitPartialReplace({ entityData: updatedEntityData.toJS() })
        );
        if (response.error) throw response.error;

        attorneyContactInfo.forEach((existingContact :Map, index :number) => {
          const existingContactEKID = getEntityKeyId(existingContact);
          const editedData = entityData[contactInfoESID][existingContactEKID];
          let editedContact = existingContact;
          if (isDefined(editedData)) {
            fromJS(editedData).forEach((propertyValue :any, ptid :string) => {
              const fqn = getPropertyFqnFromEDM(edm, ptid);
              editedContact = editedContact.set(fqn, propertyValue);
            });
          }
          editedContacts = editedContacts.set(index, editedContact);
        });
      }
    }
    if (!newContact.isEmpty()) editedContacts = editedContacts.push(newContact);

    yield put(editAttorneyContactInfo.success(id, editedContacts));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editAttorneyContactInfo.failure(id, error));
  }
  finally {
    yield put(editAttorneyContactInfo.finally(id));
  }
}

function* editAttorneyContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_ATTORNEY_CONTACT_INFO, editAttorneyContactInfoWorker);
}

/*
 *
 * SupervisionActions.editOfficer()
 *
 */

function* editOfficerWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editOfficer.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const officerESID :UUID = getESIDFromApp(app, OFFICERS);

    const officerEKID = Object.keys(entityData[officerESID])[0];

    let editedOfficer :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData })
      );
      if (response.error) throw response.error;

      if (entityData[officerESID]) {
        const data = Object.values(entityData[officerESID])[0];
        editedOfficer = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([officerEKID]));
        });
      }
    }

    yield put(editOfficer.success(id, editedOfficer));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editOfficer.failure(id, error));
  }
  finally {
    yield put(editOfficer.finally(id));
  }
}

function* editOfficerWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_OFFICER, editOfficerWorker);
}

/*
 *
 * SupervisionActions.editOfficerContactInfo()
 *
 */

function* editOfficerContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editOfficerContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const {
      employeeEKID,
      entityData,
      formData,
      officerContactInfo,
      officerEKID,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const selectedOrgId = app.get(SELECTED_ORG_ID);
    const entitySetIds = app.getIn([ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map());
    const propertyTypeIds = edm.getIn([TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map());
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);

    let editedContacts :List = List();
    let newContact :Map = Map();

    // case where only 1 contact info entity was created in the Intake
    if (officerContactInfo.count() === 1) {
      const { newContactValue, propertyFqn } = getNewContactValueFromEditedData(formData, officerContactInfo);
      const newContactPTID = getPTIDFromEDM(edm, propertyFqn);
      const newEntityData = {
        [contactInfoESID]: [{
          [newContactPTID]: [newContactValue]
        }]
      };
      const associations = [
        [CONTACTED_VIA, officerEKID, OFFICERS, 0, CONTACT_INFO, {}],
        [CONTACTED_VIA, employeeEKID, EMPLOYEE, 0, CONTACT_INFO, {}],
      ];
      const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData, entityData: newEntityData })
      );
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;
      const newContactEKID = entityKeyIds[contactInfoESID][0];

      newContact = Map().withMutations((map :Map) => {
        map.set(ENTITY_KEY_ID, List([newContactEKID]));
        map.set(getPropertyFqnFromEDM(edm, newContactPTID), List([newContactValue]));
      });
    }

    if (Object.values(entityData).length) {
      const updatedEntityData = Map().withMutations((mutator :Map) => {
        mutator.set(contactInfoESID, Map());
        fromJS(entityData).get(contactInfoESID).forEach((entityMap :Map, key :string) => {
          if (isValidUUID(key)) {
            mutator.setIn([contactInfoESID, key], entityMap);
          }
        });
      });

      if (!updatedEntityData.isEmpty()) {
        const response :Object = yield call(
          submitPartialReplaceWorker,
          submitPartialReplace({ entityData: updatedEntityData.toJS() })
        );
        if (response.error) throw response.error;

        officerContactInfo.forEach((existingContact :Map, index :number) => {
          const existingContactEKID = getEntityKeyId(existingContact);
          const editedData = entityData[contactInfoESID][existingContactEKID];
          let editedContact = existingContact;
          if (isDefined(editedData)) {
            fromJS(editedData).forEach((propertyValue :any, ptid :string) => {
              const fqn = getPropertyFqnFromEDM(edm, ptid);
              editedContact = editedContact.set(fqn, propertyValue);
            });
          }
          editedContacts = editedContacts.set(index, editedContact);
        });
      }
    }
    if (!newContact.isEmpty()) editedContacts = editedContacts.push(newContact);

    yield put(editOfficerContactInfo.success(id, editedContacts));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editOfficerContactInfo.failure(id, error));
  }
  finally {
    yield put(editOfficerContactInfo.finally(id));
  }
}

function* editOfficerContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_OFFICER_CONTACT_INFO, editOfficerContactInfoWorker);
}

/*
 *
 * SupervisionActions.editSupervision()
 *
 */

function* editSupervisionWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editSupervision.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const probationParoleESID :UUID = getESIDFromApp(app, PROBATION_PAROLE);
    const recognizedEndDatetimePTID :UUID = getPTIDFromEDM(edm, RECOGNIZED_END_DATETIME);

    const probationParoleEKID = Object.keys(entityData[probationParoleESID])[0];
    const releaseDateList = entityData[probationParoleESID][probationParoleEKID][recognizedEndDatetimePTID];
    if (releaseDateList) {
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const releaseDateTime = DateTime.fromSQL(`${releaseDateList[0]} ${currentTime}`).toISO();
      entityData[probationParoleESID][probationParoleEKID][recognizedEndDatetimePTID][0] = releaseDateTime;
    }
    let editedSupervision :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData })
      );
      if (response.error) throw response.error;

      if (entityData[probationParoleESID]) {
        const data = Object.values(entityData[probationParoleESID])[0];
        editedSupervision = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([probationParoleEKID]));
        });
      }
    }

    yield put(editSupervision.success(id, editedSupervision));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editSupervision.failure(id, error));
  }
  finally {
    yield put(editSupervision.finally(id));
  }
}

function* editSupervisionWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_SUPERVISION, editSupervisionWorker);
}

/*
 *
 * SupervisionActions.submitAttorney()
 *
 */

function* submitAttorneyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitAttorney.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const attorneysESID :UUID = getESIDFromApp(app, ATTORNEYS);
    const employmentESID :UUID = getESIDFromApp(app, EMPLOYMENT);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newAttorneyEKID :UUID = entityKeyIds[attorneysESID][0];
    const newAttorney :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newAttorneyEKID]));
      fromJS(entityData[attorneysESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    const newEmploymentEKID :UUID = entityKeyIds[employmentESID][0];
    const newEmployment :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newEmploymentEKID]));
      fromJS(entityData[employmentESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitAttorney.success(id, { newAttorney, newEmployment }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitAttorney.failure(id, error));
  }
  finally {
    yield put(submitAttorney.finally(id));
  }
}

function* submitAttorneyWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_ATTORNEY, submitAttorneyWorker);
}

/*
 *
 * SupervisionActions.submitAttorneyContactInfo()
 *
 */

function* submitAttorneyContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitAttorneyContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newContactEKIDs = entityKeyIds[contactInfoESID];
    const phoneEKID = newContactEKIDs[0];
    const emailEKID = newContactEKIDs[1];

    const newPhone = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([phoneEKID]));
      fromJS(entityData[contactInfoESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    const newEmail :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([emailEKID]));
      fromJS(entityData[contactInfoESID][1]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitAttorneyContactInfo.success(id, { newEmail, newPhone }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitAttorneyContactInfo.failure(id, error));
  }
  finally {
    yield put(submitAttorneyContactInfo.finally(id));
  }
}

function* submitAttorneyContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_ATTORNEY_CONTACT_INFO, submitAttorneyContactInfoWorker);
}

/*
 *
 * SupervisionActions.submitOfficer()
 *
 */

function* submitOfficerWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitOfficer.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const officersESID :UUID = getESIDFromApp(app, OFFICERS);
    const employeeESID :UUID = getESIDFromApp(app, EMPLOYEE);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newOfficerEKID :UUID = entityKeyIds[officersESID][0];
    const newOfficer :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newOfficerEKID]));
      fromJS(entityData[officersESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    const newEmployeeEKID :UUID = entityKeyIds[employeeESID][0];
    const newEmployee :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newEmployeeEKID]));
      fromJS(entityData[employeeESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitOfficer.success(id, { newEmployee, newOfficer }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitOfficer.failure(id, error));
  }
  finally {
    yield put(submitOfficer.finally(id));
  }
}

function* submitOfficerWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_OFFICER, submitOfficerWorker);
}

/*
 *
 * SupervisionActions.submitOfficerContactInfo()
 *
 */

function* submitOfficerContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitOfficerContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newContactEKIDs = entityKeyIds[contactInfoESID];
    const phoneEKID = newContactEKIDs[0];
    const emailEKID = newContactEKIDs[1];

    const newPhone = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([phoneEKID]));
      fromJS(entityData[contactInfoESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    const newEmail :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([emailEKID]));
      fromJS(entityData[contactInfoESID][1]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitOfficerContactInfo.success(id, { newEmail, newPhone }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitOfficerContactInfo.failure(id, error));
  }
  finally {
    yield put(submitOfficerContactInfo.finally(id));
  }
}

function* submitOfficerContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_OFFICER_CONTACT_INFO, submitOfficerContactInfoWorker);
}

/*
 *
 * SupervisionActions.submitSupervision()
 *
 */

function* submitSupervisionWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(submitSupervision.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const probationParoleESID :UUID = getESIDFromApp(app, PROBATION_PAROLE);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;
    const { entityData } = value;

    const newSupervisionEKID :UUID = entityKeyIds[probationParoleESID][0];
    const newSupervision :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([newSupervisionEKID]));
      fromJS(entityData[probationParoleESID][0]).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitSupervision.success(id, newSupervision));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitSupervision.failure(id, error));
  }
  finally {
    yield put(submitSupervision.finally(id));
  }
}

function* submitSupervisionWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_SUPERVISION, submitSupervisionWorker);
}

export {
  editAttorneyWatcher,
  editAttorneyWorker,
  editAttorneyContactInfoWatcher,
  editAttorneyContactInfoWorker,
  editOfficerContactInfoWatcher,
  editOfficerContactInfoWorker,
  editOfficerWatcher,
  editOfficerWorker,
  editSupervisionWatcher,
  editSupervisionWorker,
  submitAttorneyContactInfoWatcher,
  submitAttorneyContactInfoWorker,
  submitAttorneyWatcher,
  submitAttorneyWorker,
  submitOfficerContactInfoWatcher,
  submitOfficerContactInfoWorker,
  submitOfficerWatcher,
  submitOfficerWorker,
  submitSupervisionWatcher,
  submitSupervisionWorker,
};
