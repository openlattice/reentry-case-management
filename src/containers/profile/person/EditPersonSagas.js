// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import {
  EDIT_PERSON,
  EDIT_PERSON_DETAILS,
  EDIT_STATE_ID,
  SUBMIT_PERSON_DETAILS,
  SUBMIT_STATE_ID,
  editPerson,
  editPersonDetails,
  editStateId,
  submitPersonDetails,
  submitStateId,
} from './EditPersonActions';

import Logger from '../../../utils/Logger';
import { submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { PEOPLE, PERSON_DETAILS, STATE_ID } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
const LOG = new Logger('EditPersonSagas');

/*
 *
 * EditPersonActions.editPerson()
 *
 */

function* editPersonWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(editPerson.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    const data = fromJS(entityData[peopleESID]);
    const personEKID :UUID = data.keySeq().toList().get(0);
    const updatedPersonData :Map = Map().withMutations((map :Map) => {
      data.get(personEKID).forEach((propertyValue :any, ptid :UUID) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(editPerson.success(id, updatedPersonData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editPerson.failure(id, error));
  }
  finally {
    yield put(editPerson.finally(id));
  }
}

function* editPersonWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON, editPersonWorker);
}

/*
 *
 * EditPersonActions.editPersonDetails()
 *
 */

function* editPersonDetailsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(editPersonDetails.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const data = fromJS(entityData[personDetailsESID]);
    const personDetailsEKID :UUID = data.keySeq().toList().get(0);
    const updatedPersonDetailsData :Map = Map().withMutations((map :Map) => {
      data.get(personDetailsEKID).forEach((propertyValue :any, ptid :UUID) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(editPersonDetails.success(id, updatedPersonDetailsData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editPersonDetails.failure(id, error));
  }
  finally {
    yield put(editPersonDetails.finally(id));
  }
}

function* editPersonDetailsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_DETAILS, editPersonDetailsWorker);
}

/*
 *
 * EditPersonActions.submitPersonDetails()
 *
 */

function* submitPersonDetailsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(submitPersonDetails.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const { entityData } = value;
    const personDetailsESID :UUID = getESIDFromApp(app, PERSON_DETAILS);
    const data = fromJS(entityData[personDetailsESID][0]);
    const personDetailsEKID :UUID = entityKeyIds[personDetailsESID][0];

    const personDetails :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([personDetailsEKID]));
      data.forEach((propertyValue :any, ptid :UUID) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitPersonDetails.success(id, personDetails));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitPersonDetails.failure(id, error));
  }
  finally {
    yield put(submitPersonDetails.finally(id));
  }
}

function* submitPersonDetailsWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_PERSON_DETAILS, submitPersonDetailsWorker);
}

/*
 *
 * EditPersonActions.editStateId()
 *
 */

function* editStateIdWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(editStateId.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);
    const data = fromJS(entityData[stateIdESID]);
    const stateIdEKID :UUID = data.keySeq().toList().get(0);
    const updatedStateIdData :Map = Map().withMutations((map :Map) => {
      data.get(stateIdEKID).forEach((propertyValue :any, ptid :UUID) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(editStateId.success(id, updatedStateIdData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editStateId.failure(id, error));
  }
  finally {
    yield put(editStateId.finally(id));
  }
}

function* editStateIdWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_STATE_ID, editStateIdWorker);
}

/*
 *
 * EditPersonActions.submitStateId()
 *
 */

function* submitStateIdWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;

  try {
    yield put(submitStateId.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const { entityData } = value;
    const stateIdESID :UUID = getESIDFromApp(app, STATE_ID);
    const data = fromJS(entityData[stateIdESID][0]);
    const stateIdEKID :UUID = entityKeyIds[stateIdESID][0];

    const stateId :Map = Map().withMutations((map :Map) => {
      map.set(ENTITY_KEY_ID, List([stateIdEKID]));
      data.forEach((propertyValue :any, ptid :UUID) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
    });

    yield put(submitStateId.success(id, stateId));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitStateId.failure(id, error));
  }
  finally {
    yield put(submitStateId.finally(id));
  }
}

function* submitStateIdWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_STATE_ID, submitStateIdWorker);
}

export {
  editPersonDetailsWatcher,
  editPersonDetailsWorker,
  editPersonWatcher,
  editPersonWorker,
  editStateIdWatcher,
  editStateIdWorker,
  submitPersonDetailsWatcher,
  submitPersonDetailsWorker,
  submitStateIdWatcher,
  submitStateIdWorker,
};
