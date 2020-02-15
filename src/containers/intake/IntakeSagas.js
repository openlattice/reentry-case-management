// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { List, Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';

import {
  GET_INCARCERATION_FACILITIES,
  SUBMIT_INTAKE_FORM,
  getIncarcerationFacilities,
  submitIntakeForm,
} from './IntakeActions';
import { submitDataGraph } from '../../core/data/DataActions';
import { submitDataGraphWorker } from '../../core/data/DataSagas';
import { isDefined } from '../../utils/LangUtils';
import { getESIDFromApp } from '../../utils/DataUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';

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

  try {
    yield put(getIncarcerationFacilities.request(id));
    const app = yield select(getAppFromState);
    const jailsPrisonsESID :UUID = getESIDFromApp(app, MANUAL_JAILS_PRISONS);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: jailsPrisonsESID }));
    if (response.error) {
      throw response.error;
    }
    const incarcerationFacilities :List = fromJS(response.data);

    yield put(getIncarcerationFacilities.success(id, incarcerationFacilities));
  }
  catch (error) {
    LOG.error('caught exception in getIncarcerationFacilitiesWorker()', error);
    yield put(getIncarcerationFacilities.failure(id, error));
  }
  finally {
    yield put(getIncarcerationFacilities.finally(id));
  }
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
