// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import { getESIDFromApp } from '../../utils/DataUtils';
import {
  GET_PARTICIPANT,
  getParticipant,
} from './ProfileActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('ProfileSagas');
const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { PEOPLE } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());

/*
 *
 * ProfileSagas.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getParticipant.request(id));
    const { participantEKID } = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);

    const response :Object = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: peopleESID, entityKeyId: participantEKID })
    );
    if (response.error) {
      throw response.error;
    }
    const participant :Map = fromJS(response.data);

    yield put(getParticipant.success(id, participant));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
}

function* getParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT, getParticipantWorker);
}

export {
  getParticipantWatcher,
  getParticipantWorker,
};
