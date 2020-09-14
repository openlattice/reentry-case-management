// @flow
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
import { LangUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import {
  EDIT_OFFICER,
  EDIT_SUPERVISION,
  SUBMIT_OFFICER,
  SUBMIT_SUPERVISION,
  editOfficer,
  editSupervision,
  submitOfficer,
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

const { isDefined } = LangUtils;
const {
  EMPLOYEE,
  OFFICERS,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, RECOGNIZED_END_DATETIME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('SupervisionSagas');

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
  editOfficerWatcher,
  editOfficerWorker,
  editSupervisionWatcher,
  editSupervisionWorker,
  submitOfficerWatcher,
  submitOfficerWorker,
  submitSupervisionWatcher,
  submitSupervisionWorker,
};
