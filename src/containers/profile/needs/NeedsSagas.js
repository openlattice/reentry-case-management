// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { submitPartialReplace } from '../../../core/data/DataActions';
import { submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { EDIT_NEEDS, editNeeds } from './NeedsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('NeedsSagas');

/*
 *
 * NeedsActions.editNeeds()
 *
 */

function* editNeedsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editNeeds.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const { entityData, needsAssessmentEKID } = value;
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const data = entityData[needsAssessmentESID][needsAssessmentEKID];

    const newNeedsData :Map = Map().withMutations((map :Map) => {
      fromJS(data).forEach((propertyValue :any, ptid :string) => {
        const fqn = getPropertyFqnFromEDM(edm, ptid);
        map.set(fqn, propertyValue);
      });
      map.set(ENTITY_KEY_ID, List([needsAssessmentEKID]));
    }).asImmutable();

    yield put(editNeeds.success(id, newNeedsData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editNeeds.failure(id, error));
  }
  finally {
    yield put(editNeeds.finally(id));
  }
}

function* editNeedsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_NEEDS, editNeedsWorker);
}

export {
  editNeedsWatcher,
  editNeedsWorker,
};
