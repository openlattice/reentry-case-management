// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../utils/DataUtils';
import {
  GET_CONTACT_INFO,
  GET_PROVIDER_NEIGHBORS,
  getContactInfo,
  getProviderNeighbors,
} from './ProvidersActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('EventSagas');
const { FullyQualifiedName } = Models;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  CONTACT_INFO,
  LOCATION,
  PROVIDER,
  PROVIDER_STAFF
} = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * EventSagas.getContactInfo()
 *
 */

function* getContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getContactInfo.request(id));
    const { pointOfContactPersonEKIDs } = value;
    const app = yield select(getAppFromState);
    const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO); // should add app type for provider contacts

    const searchFilter = {
      entityKeyIds: pointOfContactPersonEKIDs,
      destinationEntitySetIds: [contactInfoESID],
      sourceEntitySetIds: [],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: providerStaffESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const contactInfoByContactPersonEKID :Map = fromJS(response.data)
      .map((neighborList :List) => neighborList.map((neighbor :Map) => getNeighborDetails(neighbor)));

    yield put(getContactInfo.success(id, contactInfoByContactPersonEKID));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getContactInfo.failure(id, error));
  }
  finally {
    yield put(getContactInfo.finally(id));
  }
}

function* getContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CONTACT_INFO, getContactInfoWorker);
}

/*
 *
 * EventSagas.getProviderNeighbors()
 *
 */

function* getProviderNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getProviderNeighbors.request(id));
    const { providerEKIDs } = value;

    const app = yield select(getAppFromState);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
    const locationESID :UUID = getESIDFromApp(app, LOCATION); // should add app type for provider addresses

    const searchFilter = {
      entityKeyIds: providerEKIDs,
      destinationEntitySetIds: [locationESID],
      sourceEntitySetIds: [providerStaffESID],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let providerNeighborMap :Map = Map();
    const pointOfContactPersonEKIDs :UUID[] = [];
    const providerNeighbors :List = fromJS(response.data);
    providerNeighbors.forEach((neighborList :Map, providerEKID :UUID) => {
      neighborList.forEach((neighbor :Map) => {
        const neighborESID :UUID = getNeighborESID(neighbor);
        const neighborEntityFqn :FullyQualifiedName = getFqnFromApp(app, neighborESID);
        const entity :Map = getNeighborDetails(neighbor);
        if (neighborEntityFqn.toString() === PROVIDER_STAFF.toString()) {
          pointOfContactPersonEKIDs.push(getEKID(entity));
        }
        let neighborsByProviderEKID :Map = providerNeighborMap.get(providerEKID, Map());
        let entityList :List = neighborsByProviderEKID.get(neighborEntityFqn, List());
        entityList = entityList.push(entity);
        neighborsByProviderEKID = neighborsByProviderEKID.set(neighborEntityFqn, entityList);
        providerNeighborMap = providerNeighborMap.set(providerEKID, neighborsByProviderEKID);
      });
    });

    if (pointOfContactPersonEKIDs.length) {
      yield call(getContactInfoWorker, getContactInfo({ pointOfContactPersonEKIDs }));
    }

    yield put(getProviderNeighbors.success(id, providerNeighborMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getProviderNeighbors.failure(id, error));
  }
  finally {
    yield put(getProviderNeighbors.finally(id));
  }
}

function* getProviderNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PROVIDER_NEIGHBORS, getProviderNeighborsWorker);
}

export {
  getContactInfoWatcher,
  getContactInfoWorker,
  getProviderNeighborsWatcher,
  getProviderNeighborsWorker,
};