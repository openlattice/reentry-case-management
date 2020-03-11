// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models } from 'lattice';
import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  has,
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
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
  getPropertyFqnFromEDM,
} from '../../utils/DataUtils';
import { constructNewEntityFromSubmittedData } from '../../utils/FormUtils';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../core/data/DataActions';
import { deleteEntitiesWorker, submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/data/DataSagas';
import {
  ADD_NEW_PROVIDER_CONTACTS,
  CREATE_NEW_PROVIDER,
  DELETE_PROVIDER_STAFF_AND_CONTACTS,
  EDIT_PROVIDER,
  EDIT_PROVIDER_CONTACTS,
  GET_CONTACT_INFO,
  GET_PROVIDERS,
  GET_PROVIDER_NEIGHBORS,
  addNewProviderContacts,
  createNewProvider,
  deleteProviderStaffAndContacts,
  editProvider,
  editProviderContacts,
  getContactInfo,
  getProviderNeighbors,
  getProviders,
} from './ProvidersActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('EventSagas');
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  CONTACTED_VIA,
  EMPLOYED_BY,
  PROVIDER,
  PROVIDER_ADDRESS,
  PROVIDER_CONTACT_INFO,
  PROVIDER_EMPLOYEES,
  PROVIDER_STAFF,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

/*
 *
 * ProvidersActions.getContactInfo()
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
    const contactInfoESID :UUID = getESIDFromApp(app, PROVIDER_CONTACT_INFO);

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
 * ProvidersActions.getProviderNeighbors()
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
    const providerAddressESID :UUID = getESIDFromApp(app, PROVIDER_ADDRESS);

    const searchFilter = {
      entityKeyIds: providerEKIDs,
      destinationEntitySetIds: [providerAddressESID],
      sourceEntitySetIds: [providerStaffESID],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const pointOfContactPersonEKIDs :UUID[] = [];
    const providerNeighbors :List = fromJS(response.data);

    const providerNeighborMap :Map = Map().withMutations((map :Map) => {
      providerNeighbors.forEach((neighborList :List, providerEKID :UUID) => {
        neighborList.forEach((neighbor :Map) => {

          const neighborESID :UUID = getNeighborESID(neighbor);
          const neighborEntityFqn :FullyQualifiedName = getFqnFromApp(app, neighborESID);
          const entity :Map = getNeighborDetails(neighbor);
          if (neighborESID === providerStaffESID) {
            pointOfContactPersonEKIDs.push(getEKID(entity));
          }
          map.updateIn([providerEKID, neighborEntityFqn], List(), (entityList) => entityList.push(entity));
        });
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

/*
 *
 * ProvidersActions.getProviders()
 *
 */

function* getProvidersWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const sagaResponse :Object = {};

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
      if (providerEKIDs.length) yield call(getProviderNeighborsWorker, getProviderNeighbors({ providerEKIDs }));
    }

    sagaResponse.data = providers;
    yield put(getProviders.success(id, providers));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getProviders.failure(id, error));
  }
  finally {
    yield put(getProviders.finally(id));
  }
  return sagaResponse;
}

function* getProvidersWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PROVIDERS, getProvidersWorker);
}

/*
 *
 * ProvidersActions.createNewProvider()
 *
 */

function* createNewProviderWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(createNewProvider.request(id, value));
    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    const providerAddressESID :UUID = getESIDFromApp(app, PROVIDER_ADDRESS);

    const { data } = response;
    const { entityKeyIds } = data;
    const newProviderEKID :UUID = entityKeyIds[providerESID][0];
    const newProviderAddressEKID :UUID = entityKeyIds[providerAddressESID][0];
    const { entityData } = value;
    const providerData :Object = entityData[providerESID][0];

    let newProvider :Map = fromJS({
      [ENTITY_KEY_ID]: [newProviderEKID]
    });
    fromJS(providerData).forEach((entityValue :List, ptid :UUID) => {
      const propertyFqn :FullyQualifiedName = getPropertyFqnFromEDM(edm, ptid);
      newProvider = newProvider.set(propertyFqn, entityValue);
    });
    const newProviderAddress :Map = fromJS({
      [ENTITY_KEY_ID]: [newProviderAddressEKID]
    });

    yield put(createNewProvider.success(id, { newProvider, newProviderAddress, newProviderEKID }));
  }
  catch (error) {
    LOG.error('caught exception in createNewProviderWorker()', error);
    yield put(createNewProvider.failure(id, error));
  }
  finally {
    yield put(createNewProvider.finally(id));
  }
}

function* createNewProviderWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_NEW_PROVIDER, createNewProviderWorker);
}

/*
 *
 * ProvidersActions.addNewProviderContacts()
 *
 */

function* addNewProviderContactsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(addNewProviderContacts.request(id, value));
    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const providerContactInfoESID :UUID = getESIDFromApp(app, PROVIDER_CONTACT_INFO);
    const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
    const contactedViaESID :UUID = getESIDFromApp(app, CONTACTED_VIA);
    const employedByESID :UUID = getESIDFromApp(app, EMPLOYED_BY);

    const { entityKeyIds } = response.data;
    const newProviderContactInfoEKIDs :UUID[] = entityKeyIds[providerContactInfoESID];
    const newProviderStaffEKIDs :UUID[] = entityKeyIds[providerStaffESID];

    const { associationEntityData, entityData } = value;
    const providerStaffData :Object[] = entityData[providerStaffESID];
    const providerContactInfoData :Object[] = entityData[providerContactInfoESID];
    const contactInfoAssociations :Object[] = associationEntityData[contactedViaESID];
    const providerEKID :UUID = associationEntityData[employedByESID][0].dstEntityKeyId;

    let newProviderStaffMembers :List = List();
    let newProviderContactInfo :Map = Map();

    newProviderStaffEKIDs.forEach((staffEKID :UUID, index :number) => {

      const staffPerson :Object = providerStaffData[index];
      const staffEntity :Map = constructNewEntityFromSubmittedData(fromJS(staffPerson), staffEKID, edm);
      newProviderStaffMembers = newProviderStaffMembers.push(staffEntity);

      const staffPersonContactAssociations :Object[] = contactInfoAssociations
        .filter((association :Object) => (association.srcEntityIndex === index));
      if (staffPersonContactAssociations.length) {
        let newPersonContacts :List = newProviderContactInfo.get(staffEKID, List());
        staffPersonContactAssociations.forEach((association :Object) => {
          const contactEKID :UUID = newProviderContactInfoEKIDs[association.dstEntityIndex];
          const contactData :Object = providerContactInfoData[association.dstEntityIndex];
          const contactEntity :Map = constructNewEntityFromSubmittedData(fromJS(contactData), contactEKID, edm);
          newPersonContacts = newPersonContacts.push(contactEntity);
        });
        newProviderContactInfo = newProviderContactInfo.set(staffEKID, newPersonContacts);
      }
    });

    yield put(addNewProviderContacts.success(id, { newProviderContactInfo, newProviderStaffMembers, providerEKID }));
  }
  catch (error) {
    LOG.error('caught exception in addNewProviderContactsWorker()', error);
    yield put(addNewProviderContacts.failure(id, error));
  }
  finally {
    yield put(addNewProviderContacts.finally(id));
  }
}

function* addNewProviderContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_NEW_PROVIDER_CONTACTS, addNewProviderContactsWorker);
}

/*
 *
 * ProvidersActions.editProvider()
 *
 */

function* editProviderWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(editProvider.request(id, value));
    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const providerESID :UUID = getESIDFromApp(app, PROVIDER);
    const providerAddressESID :UUID = getESIDFromApp(app, PROVIDER_ADDRESS);

    let newProvider :Map = Map();
    let newProviderAddress :Map = Map();
    const { addressEKID, entityData, providerEKID } = value;
    if (has(entityData, providerESID)) {
      const newProviderData :Map = fromJS(getIn(entityData, [providerESID, providerEKID]));
      newProvider = constructNewEntityFromSubmittedData(newProviderData, providerEKID, edm);
    }
    if (has(entityData, providerAddressESID)) {
      const newAddressData :Map = fromJS(getIn(entityData, [providerAddressESID, addressEKID]));
      newProviderAddress = constructNewEntityFromSubmittedData(newAddressData, providerEKID, edm);
    }

    yield put(editProvider.success(id, { newProvider, newProviderAddress, providerEKID }));
  }
  catch (error) {
    LOG.error('caught exception in editProviderWorker()', error);
    yield put(editProvider.failure(id, error));
  }
  finally {
    yield put(editProvider.finally(id));
  }
}

function* editProviderWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PROVIDER, editProviderWorker);
}

/*
 *
 * ProvidersActions.editProviderContacts()
 *
 */

function* editProviderContactsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(editProviderContacts.request(id, value));
    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const providerContactInfoESID :UUID = getESIDFromApp(app, PROVIDER_CONTACT_INFO);
    const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);

    let newProviderContactPeople :List = List();
    const { contactEKIDToPersonEKID, entityData, providerEKID } = value;
    if (has(entityData, providerStaffESID)) {
      const newContactPeopleData :Map = fromJS(get(entityData, providerStaffESID));
      newContactPeopleData.forEach((propertyMap :Map, personEKID :UUID) => {
        const updatedPerson :Map = constructNewEntityFromSubmittedData(propertyMap, personEKID, edm);
        newProviderContactPeople = newProviderContactPeople.push(updatedPerson);
      });
    }

    let newProviderContactInfo :Map = Map();
    if (has(entityData, providerContactInfoESID)) {
      const newContactInfoData :Map = fromJS(get(entityData, providerContactInfoESID));
      newContactInfoData.forEach((propertyMap :Map, contactEKID :UUID) => {
        const updatedContactInfo :Map = constructNewEntityFromSubmittedData(propertyMap, contactEKID, edm);
        const personEKID :UUID = contactEKIDToPersonEKID.get(contactEKID);
        const personContacts :List = newProviderContactInfo.get(personEKID, List()).push(updatedContactInfo);
        newProviderContactInfo = newProviderContactInfo.set(personEKID, personContacts);
      });
    }

    yield put(editProviderContacts.success(id, { newProviderContactInfo, newProviderContactPeople, providerEKID }));
  }
  catch (error) {
    LOG.error('caught exception in editProviderContactsWorker()', error);
    yield put(editProviderContacts.failure(id, error));
  }
  finally {
    yield put(editProviderContacts.finally(id));
  }
}

function* editProviderContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PROVIDER_CONTACTS, editProviderContactsWorker);
}

/*
 *
 * ProvidersActions.deleteProviderStaffAndContacts()
 *
 */

function* deleteProviderStaffAndContactsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(deleteProviderStaffAndContacts.request(id, value));
    const { deleteValue, providerEKID } = value;
    const { entityData, path } = deleteValue;

    const app = yield select(getAppFromState);
    const providerStaffESID :UUID = getESIDFromApp(app, PROVIDER_STAFF);
    const providerContactInfoESID :UUID = getESIDFromApp(app, PROVIDER_CONTACT_INFO);
    const providerEmployeeESID :UUID = getESIDFromApp(app, PROVIDER_EMPLOYEES);
    const staffEKIDs :UUID[] = Array.from(entityData[providerStaffESID]);
    const contactsEKIDs :UUID[] = Array.from(entityData[providerContactInfoESID]);
    const arrayItemIndex :number = path[1];

    // also delete employee neighbors of staff
    let response :Object = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter({
      entitySetId: providerStaffESID,
      filter: {
        entityKeyIds: staffEKIDs,
        destinationEntitySetIds: [providerEmployeeESID],
        sourceEntitySetIds: [],
      }
    }));
    if (response.error) throw response.error;
    const employeeEKIDs :UUID[] = [];
    fromJS(response.data).map((employeeNeighborList :List) => employeeNeighborList.get(0))
      .forEach((employeeNeighbor :Map) => {
        const employeeEntity :Map = getNeighborDetails(employeeNeighbor);
        employeeEKIDs.push(getEKID(employeeEntity));
      });
    const deleteCalls :Object[] = [
      { entitySetId: providerStaffESID, entityKeyIds: staffEKIDs },
      { entitySetId: providerEmployeeESID, entityKeyIds: employeeEKIDs },
      { entitySetId: providerContactInfoESID, entityKeyIds: contactsEKIDs }
    ];

    response = yield call(deleteEntitiesWorker, deleteEntities(deleteCalls));
    if (response.error) {
      throw response.error;
    }

    yield put(deleteProviderStaffAndContacts.success(id, { arrayItemIndex, providerEKID }));
  }
  catch (error) {
    LOG.error('caught exception in deleteProviderStaffAndContactsWorker()', error);
    yield put(deleteProviderStaffAndContacts.failure(id, error));
  }
  finally {
    yield put(deleteProviderStaffAndContacts.finally(id));
  }
}

function* deleteProviderStaffAndContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_PROVIDER_STAFF_AND_CONTACTS, deleteProviderStaffAndContactsWorker);
}

export {
  addNewProviderContactsWatcher,
  addNewProviderContactsWorker,
  createNewProviderWatcher,
  createNewProviderWorker,
  deleteProviderStaffAndContactsWatcher,
  deleteProviderStaffAndContactsWorker,
  editProviderContactsWatcher,
  editProviderContactsWorker,
  editProviderWatcher,
  editProviderWorker,
  getContactInfoWatcher,
  getContactInfoWorker,
  getProvidersWatcher,
  getProvidersWorker,
  getProviderNeighborsWatcher,
  getProviderNeighborsWorker,
};
