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

import { getEntitySetIdFromApp } from '../../utils/DataUtils';
import {
  GET_INCARCERATION_FACILITIES,
  getIncarcerationFacilities,
} from './PersonInformationActions';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

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

export {
  getIncarcerationFacilitiesWatcher,
  getIncarcerationFacilitiesWorker,
};
