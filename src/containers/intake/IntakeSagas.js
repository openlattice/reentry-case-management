// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_INTAKE_FORM,
  getIncarcerationFacilities,
  submitIntakeForm,
} from './IntakeActions';

import Logger from '../../utils/Logger';
import { submitDataGraph } from '../../core/data/DataActions';
import { submitDataGraphWorker } from '../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp } from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { MANUAL_JAILS_PRISONS, PEOPLE } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('PersonInformationSagas');

/*
 *
 * PersonInformationActions.getIncarcerationFacilities()
 *
 */

function* getIncarcerationFacilitiesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const sagaResponse = {};

  try {
    yield put(getIncarcerationFacilities.request(id));
    const app = yield select(getAppFromState);
    const jailsPrisonsESID :UUID = getESIDFromApp(app, MANUAL_JAILS_PRISONS);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: jailsPrisonsESID }));
    if (response.error) {
      throw response.error;
    }
    const incarcerationFacilities :List = fromJS(response.data);
    sagaResponse.data = incarcerationFacilities;
    yield put(getIncarcerationFacilities.success(id, incarcerationFacilities));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error('caught exception in getIncarcerationFacilitiesWorker()', error);
    yield put(getIncarcerationFacilities.failure(id, error));
  }
  finally {
    yield put(getIncarcerationFacilities.finally(id));
  }
  return sagaResponse;
}

function* getIncarcerationFacilitiesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INCARCERATION_FACILITIES, getIncarcerationFacilitiesWorker);
}

/*
 *
 * PersonInformationActions.submitIntakeForm()
 *
 */

function* submitIntakeFormWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(submitIntakeForm.request(id, value));
    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } = response;
    const { entityKeyIds } = data;
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    const newParticipantEKID :UUID = entityKeyIds[peopleESID][0];

    yield put(submitIntakeForm.success(id, newParticipantEKID));
  }
  catch (error) {
    LOG.error('caught exception in submitIntakeFormWorker()', error);
    yield put(submitIntakeForm.failure(id, error));
  }
  finally {
    yield put(submitIntakeForm.finally(id));
  }
}

function* submitIntakeFormWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_INTAKE_FORM, submitIntakeFormWorker);
}

export {
  getIncarcerationFacilitiesWatcher,
  getIncarcerationFacilitiesWorker,
  submitIntakeFormWatcher,
  submitIntakeFormWorker,
};
