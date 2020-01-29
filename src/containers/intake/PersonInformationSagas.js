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
  SUBMIT_PERSON_INFORMATION_FORM,
  getIncarcerationFacilities,
  submitPersonInformationForm,
} from './PersonInformationActions';
import { submitDataGraph } from '../../core/data/DataActions';
import { submitDataGraphWorker } from '../../core/data/DataSagas';
import { isDefined } from '../../utils/LangUtils';
import { getEntitySetIdFromApp } from '../../utils/DataUtils';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { JAILS_PRISONS } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

const LOG = new Logger('PersonInformationSagas');

/*
 *
 * PersonInformationActions.getIncarcerationFacilities()
 *
 */

function* getIncarcerationFacilitiesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let incarcerationFacilities :List = List();

  try {
    yield put(getIncarcerationFacilities.request(id));
    const app = yield select(getAppFromState);
    const jailsPrisonsESID :UUID = getEntitySetIdFromApp(app, JAILS_PRISONS);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: jailsPrisonsESID }));
    if (response.error) {
      throw response.error;
    }
    incarcerationFacilities = fromJS(response.data);

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
 * PersonInformationActions.submitPersonInformationForm()
 *
 */

function* submitPersonInformationFormWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};

  try {
    yield put(submitPersonInformationForm.request(id, value));
    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    yield put(submitPersonInformationForm.success(id));
  }
  catch (error) {
    LOG.error('caught exception in submitPersonInformationFormWorker()', error);
    yield put(submitPersonInformationForm.failure(id, error));
  }
  finally {
    yield put(submitPersonInformationForm.finally(id));
  }
}

function* submitPersonInformationFormWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_PERSON_INFORMATION_FORM, submitPersonInformationFormWorker);
}

export {
  getIncarcerationFacilitiesWatcher,
  getIncarcerationFacilitiesWorker,
  submitPersonInformationFormWatcher,
  submitPersonInformationFormWorker,
};
