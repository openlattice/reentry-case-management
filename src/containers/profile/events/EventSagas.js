// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getESIDFromApp } from '../../../utils/DataUtils';
import { GET_PROVIDERS, getProviders } from './EventActions';
import { getProviderNeighbors } from '../../providers/ProvidersActions';
import { getProviderNeighborsWorker } from '../../providers/ProvidersSagas';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('EventSagas');
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { PROVIDER } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * EventSagas.getProviders()
 *
 */

function* getProvidersWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getProviders.request(id));
    const { fetchNeighbors } = value;

    const app = yield select(getAppFromState);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: providersESID }));
    if (response.error) {
      throw response.error;
    }
    const providers :List = fromJS(response.data);

    if (fetchNeighbors) {
      const providerEKIDs :UUID[] = [];
      providers.forEach((provider :Map) => {
        providerEKIDs.push(getEKID(provider));
      });
      yield call(getProviderNeighborsWorker, getProviderNeighbors({ providerEKIDs }));
    }

    yield put(getProviders.success(id, providers));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getProviders.failure(id, error));
  }
  finally {
    yield put(getProviders.finally(id));
  }
}

function* getProvidersWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PROVIDERS, getProvidersWorker);
}

export {
  getProvidersWatcher,
  getProvidersWorker,
};
