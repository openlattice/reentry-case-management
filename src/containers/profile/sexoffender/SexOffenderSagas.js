// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import {
  deleteEntitiesWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker,
} from '../../../core/data/DataSagas';
import { EDIT_SEX_OFFENDER, editSexOffender } from './SexOffenderActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('SexOffenderSagas');

/*
 *
 * SexOffenderActions.editSexOffender()
 *
 */

function* editSexOffenderWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(editSexOffender.request(id));
    const {
      editedSexOffenderData,
      locationEKIDToDelete,
      newAssociations,
      newRegistrationLocationData,
      sexOffender,
      sexOffenderRegistrationLocation,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const sexOffenderESID :UUID = getESIDFromApp(app, SEX_OFFENDER);
    const sexOffenderRegistrationLocationESID :UUID = getESIDFromApp(app, SEX_OFFENDER_REGISTRATION_LOCATION);

    let updatedSexOffenderList :List = sexOffender || List();
    let updatedLocationList :List = sexOffenderRegistrationLocation || List();

    if (Object.values(editedSexOffenderData).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData: editedSexOffenderData })
      );
      if (response.error) throw response.error;

      const editedSexOffender = editedSexOffenderData[sexOffenderESID];
      if (isDefined(editedSexOffender)) {
        const sexOffenderEKID :UUID = getEKID(sexOffender.get(0));
        fromJS(editedSexOffender[sexOffenderEKID]).forEach((propertyValue :any, ptid :string) => {
          const fqn = getPropertyFqnFromEDM(edm, ptid);
          updatedSexOffenderList = updatedSexOffenderList.setIn([0, fqn], propertyValue);
        });
      }

      const editedLocation = editedSexOffenderData[sexOffenderRegistrationLocationESID];
      if (isDefined(editedLocation)) {
        const locationEKID :UUID = getEKID(sexOffenderRegistrationLocation.get(0));
        fromJS(editedLocation[locationEKID]).forEach((propertyValue :any, ptid :string) => {
          const fqn = getPropertyFqnFromEDM(edm, ptid);
          updatedLocationList = updatedLocationList.setIn([0, fqn], propertyValue);
        });
      }
    }

    if (Object.values(newAssociations).length) {
      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData: newAssociations, entityData: newRegistrationLocationData })
      );
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;

      if (entityKeyIds[sexOffenderRegistrationLocationESID]) {
        const newRegistrationLocationEKID :UUID = entityKeyIds[sexOffenderRegistrationLocationESID][0];

        const newLocation :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([newRegistrationLocationEKID]));
          fromJS(newRegistrationLocationData[sexOffenderRegistrationLocationESID][0])
            .forEach((propertyValue :any, ptid :string) => {
              const fqn = getPropertyFqnFromEDM(edm, ptid);
              map.set(fqn, propertyValue);
            });
        });
        updatedLocationList = updatedLocationList.push(newLocation);
      }
    }

    if (locationEKIDToDelete.length) {
      const response :Object = yield call(
        deleteEntitiesWorker,
        deleteEntities([{ entitySetId: sexOffenderRegistrationLocationESID, entityKeyIds: [locationEKIDToDelete] }])
      );
      if (response.error) throw response.error;
      updatedLocationList = List();
    }

    yield put(editSexOffender.success(id, { updatedSexOffenderList, updatedLocationList }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editSexOffender.failure(id, error));
  }
  finally {
    yield put(editSexOffender.finally(id));
  }
}

function* editSexOffenderWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_SEX_OFFENDER, editSexOffenderWorker);
}

export {
  editSexOffenderWatcher,
  editSexOffenderWorker,
};
