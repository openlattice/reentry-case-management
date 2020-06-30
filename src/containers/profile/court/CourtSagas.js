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
  DELETE_COURT_HEARING,
  EDIT_COURT_HEARINGS,
  deleteCourtHearing,
  editCourtHearings,
} from './CourtActions';

import Logger from '../../../utils/Logger';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { deleteEntitiesWorker, submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEKID,
  getESIDFromApp,
  getPropertyFqnFromEDM,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { HEARINGS } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('CourtSagas');

/*
 *
 * CourtActions.editCourtHearings()
 *
 */

function* editCourtHearingsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editCourtHearings.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const {
      hearingsAssociations,
      hearingsDataToEdit,
      hearingsDataToSubmit,
      participantNeighbors,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const hearingsESID :UUID = getESIDFromApp(app, HEARINGS);

    let editedHearings :List = participantNeighbors.get(HEARINGS, List());

    if (Object.values(hearingsDataToEdit).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData: hearingsDataToEdit })
      );
      if (response.error) throw response.error;

      const editedHearingsData = hearingsDataToEdit[hearingsESID];

      if (isDefined(editedHearingsData)) {
        fromJS(editedHearingsData).forEach((editedValueMap :Map, hearingEKID :UUID) => {
          const hearingEntityIndex :number = editedHearings
            .findIndex((hearing :Map) => getEKID(hearing) === hearingEKID);

          if (hearingEntityIndex !== -1) {
            editedValueMap.forEach((propertyValue :any, ptid :UUID) => {
              const fqn = getPropertyFqnFromEDM(edm, ptid);
              editedHearings = editedHearings
                .updateIn([hearingEntityIndex, fqn], Map(), () => propertyValue);
            });
          }
        });
      }
    }

    let newHearings :List = List().asMutable();

    if (Object.values(hearingsDataToSubmit).length) {
      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData: hearingsAssociations, entityData: hearingsDataToSubmit })
      );
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;

      entityKeyIds[hearingsESID].forEach((hearingEKID :UUID, index :number) => {
        const hearingData = hearingsDataToSubmit[hearingsESID][index];

        const newHearingEntity :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([hearingEKID]));
          fromJS(hearingData).forEach((propertyValue :any, ptid :UUID) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
        });
        newHearings.push(newHearingEntity);
      });
    }

    newHearings = newHearings.asImmutable();
    editedHearings = editedHearings.concat(newHearings);

    yield put(editCourtHearings.success(id, editedHearings));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editCourtHearings.failure(id, error));
  }
  finally {
    yield put(editCourtHearings.finally(id));
  }
}

function* editCourtHearingsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_COURT_HEARINGS, editCourtHearingsWorker);
}

/*
 *
 * CourtActions.deleteCourtHearing()
 *
 */

function* deleteCourtHearingWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(deleteCourtHearing.request(id, value));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { deleteValue } = value;
    const { entityData } = deleteValue;

    const app = yield select(getAppFromState);
    const hearingsESID :UUID = getESIDFromApp(app, HEARINGS);
    const hearingEKID :UUID = entityData[hearingsESID].values().first();

    const dataToDelete = [
      { entitySetId: hearingsESID, entityKeyIds: [hearingEKID] },
    ];

    const response = yield call(deleteEntitiesWorker, deleteEntities(dataToDelete));
    if (response.error) throw response.error;

    yield put(deleteCourtHearing.success(id, hearingEKID));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(deleteCourtHearing.failure(id, error));
  }
  finally {
    yield put(deleteCourtHearing.finally(id));
  }
}

function* deleteCourtHearingWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_COURT_HEARING, deleteCourtHearingWorker);
}

export {
  deleteCourtHearingWatcher,
  deleteCourtHearingWorker,
  editCourtHearingsWatcher,
  editCourtHearingsWorker,
};
