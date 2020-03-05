/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  DELETE_ENTITIES,
  SUBMIT_DATA_GRAPH,
  SUBMIT_PARTIAL_REPLACE,
  deleteEntities,
  submitDataGraph,
  submitPartialReplace,
} from './DataActions';

import Logger from '../../utils/Logger';

const LOG = new Logger('DataSagas');
const { DataGraphBuilder } = Models;
const { UpdateTypes } = Types;
const {
  createEntityAndAssociationData,
  deleteEntityData,
  updateEntityData,
} = DataApiActions;
const {
  createEntityAndAssociationDataWorker,
  deleteEntityDataWorker,
  updateEntityDataWorker,
} = DataApiSagas;

/*
 *
 * DataActions.submitDataGraph()
 *
 */

function* submitDataGraphWorker(action :SequenceAction) :Generator<*, *, *> {

  const sagaResponse :Object = {};

  try {
    yield put(submitDataGraph.request(action.id, action.value));

    const dataGraph = (new DataGraphBuilder())
      .setAssociations(action.value.associationEntityData)
      .setEntities(action.value.entityData)
      .build();

    const response = yield call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(dataGraph));
    if (response.error) throw response.error;
    sagaResponse.data = response.data;
    yield put(submitDataGraph.success(action.id, response.data));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(submitDataGraph.failure(action.id, error));
  }
  finally {
    yield put(submitDataGraph.finally(action.id));
  }

  return sagaResponse;
}

function* submitDataGraphWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_DATA_GRAPH, submitDataGraphWorker);
}

/*
 *
 * DataActions.submitPartialReplace()
 *
 */

function* submitPartialReplaceWorker(action :SequenceAction) :Generator<*, *, *> {

  const sagaResponse :Object = {};

  try {
    yield put(submitPartialReplace.request(action.id, action.value));

    const calls = [];
    const { entityData } = action.value;
    Object.keys(entityData).forEach((entitySetId :UUID) => {
      calls.push(
        call(
          updateEntityDataWorker,
          updateEntityData({
            entitySetId,
            entities: entityData[entitySetId],
            updateType: UpdateTypes.PartialReplace,
          }),
        )
      );
    });

    const updateResponses = yield all(calls);
    const responseErrors = updateResponses.reduce((acc, response) => {
      if (response.error) {
        acc.push(response.error);
      }
      return acc;
    }, []);
    const errors = {
      errors: responseErrors
    };

    if (responseErrors.length) throw errors;

    yield put(submitPartialReplace.success(action.id));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(submitPartialReplace.failure(action.id, error));
  }
  finally {
    yield put(submitPartialReplace.finally(action.id));
  }

  return sagaResponse;
}

function* submitPartialReplaceWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_PARTIAL_REPLACE, submitPartialReplaceWorker);
}

/*
 *
 * DataActions.deleteEntities()
 *
 */

function* deleteEntitiesWorker(action :SequenceAction) :Generator<*, *, *> {

  const sagaResponse :Object = {};

  try {
    yield put(deleteEntities.request(action.id, action.value));
    const dataForDelete :Object[] = action.value;

    const calls = [];
    dataForDelete.forEach((data :Object) => {
      const { entitySetId, entityKeyIds } = data;
      calls.push(call(deleteEntityDataWorker, deleteEntityData({ entitySetId, entityKeyIds })));
    });
    const deleteResponses = yield all(calls);
    const responseErrors = deleteResponses.reduce((acc, response) => {
      if (response.error) {
        acc.push(response.error);
      }
      return acc;
    }, []);
    const errors = {
      errors: responseErrors
    };
    if (responseErrors.length) throw errors;

    yield put(deleteEntities.success(action.id));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(deleteEntities.failure(action.id, error));
  }
  finally {
    yield put(deleteEntities.finally(action.id));
  }

  return sagaResponse;
}

function* deleteEntitiesWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_ENTITIES, deleteEntitiesWorker);
}

export {
  deleteEntitiesWatcher,
  deleteEntitiesWorker,
  submitDataGraphWatcher,
  submitDataGraphWorker,
  submitPartialReplaceWatcher,
  submitPartialReplaceWorker,
};
