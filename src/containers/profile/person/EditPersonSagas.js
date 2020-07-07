// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import {
  EDIT_PERSON,
  editPerson,
} from './EditPersonActions';

import Logger from '../../../utils/Logger';
import { submitPartialReplace } from '../../../core/data/DataActions';
import { submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { PEOPLE } = APP_TYPE_FQNS;
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

export {
  editPersonWatcher,
  editPersonWorker,
};
