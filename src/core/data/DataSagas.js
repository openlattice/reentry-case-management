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
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_OR_REPLACE_ASSOCIATION,
  DELETE_ENTITIES,
  SUBMIT_DATA_GRAPH,
  SUBMIT_PARTIAL_REPLACE,
  createOrReplaceAssociation,
  deleteEntities,
  submitDataGraph,
  submitPartialReplace,
} from './DataActions';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';

const LOG = new Logger('DataSagas');
const { DataGraphBuilder } = Models;
const { UpdateTypes } = Types;
const {
  createAssociations,
  createEntityAndAssociationData,
  deleteEntityData,
  updateEntityData,
} = DataApiActions;
const {
  createAssociationsWorker,
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
    deleteResponses.forEach((response) => {
      if (response.error) throw response.error;
    });

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

/*
 *
 * DataActions.createOrReplaceAssociation()
 *
 */

function* createOrReplaceAssociationWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};
  const { id } = action;

  try {
    yield put(createOrReplaceAssociation.request(id));
    const { value } = action;

    if (!isDefined(value)) {
      workerResponse.error = ERR_ACTION_VALUE_NOT_DEFINED;
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }

    const { associations, associationsToDelete } = value;

    if (associationsToDelete && associationsToDelete.length) {
      const deleteResponse = yield call(deleteEntitiesWorker, deleteEntities(associationsToDelete));
      if (deleteResponse.error) throw deleteResponse.error;
    }

    const createAssociationResponse = yield call(
      createAssociationsWorker,
      createAssociations(associations)
    );

    if (createAssociationResponse.error) throw createAssociationResponse.error;
    workerResponse.data = createAssociationResponse.data;
    yield put(createOrReplaceAssociation.success(action.id, createAssociationResponse));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(createOrReplaceAssociation.failure(action.id, error));
  }
  finally {
    yield put(createOrReplaceAssociation.finally(action.id));
  }

  return workerResponse;
}

function* createOrReplaceAssociationWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_OR_REPLACE_ASSOCIATION, createOrReplaceAssociationWorker);
}

export {
  createOrReplaceAssociationWatcher,
  createOrReplaceAssociationWorker,
  deleteEntitiesWatcher,
  deleteEntitiesWorker,
  submitDataGraphWatcher,
  submitDataGraphWorker,
  submitPartialReplaceWatcher,
  submitPartialReplaceWorker,
};
