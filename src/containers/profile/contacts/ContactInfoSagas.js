// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { List, Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import Logger from '../../../utils/Logger';
import { isDefined } from '../../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getNeighborDetails,
  getPTIDFromEDM,
  getPropertyFqnFromEDM,
} from '../../../utils/DataUtils';
import { submitDataGraph, submitPartialReplace } from '../../../core/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import {
  EDIT_CONTACT_INFO,
  EDIT_EMERGENCY_CONTACTS,
  GET_EMERGENCY_CONTACT_INFO,
  editContactInfo,
  editEmergencyContacts,
  getEmergencyContactInfo,
} from './ContactInfoActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  CONTACT_INFO,
  EMERGENCY_CONTACT,
  EMERGENCY_CONTACT_INFO,
  IS_EMERGENCY_CONTACT_FOR,
  LOCATION,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  ENTITY_KEY_ID,
  PHONE_NUMBER,
  RELATIONSHIP,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

const LOG = new Logger('ContactInfoSagas');

/*
 *
 * ContactInfoActions.editContactInfo()
 *
 */

function* editContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const { address, contactInfoEntities } = value;
    const addressESID :UUID = getESIDFromApp(app, LOCATION);
    const contactInfoESID :UUID = getESIDFromApp(app, CONTACT_INFO);

    const addressEKID :UUID = getEKID(address);
    const addressData = entityData[addressESID];

    let newAddress :Map = address;

    if (isDefined(addressData)) {
      const addressValues = addressData[addressEKID];
      const newAddressData :Map = Map().withMutations((map :Map) => {
        fromJS(addressValues).forEach((propertyValue :any, ptid :UUID) => {
          const fqn = getPropertyFqnFromEDM(edm, ptid);
          map.set(fqn, propertyValue);
        });
      });

      newAddress = newAddress.mergeWith((oldVal, newVal) => newVal, newAddressData);
    }

    let newContacts :List = contactInfoEntities;
    const contactData = entityData[contactInfoESID];

    if (isDefined(contactData)) {
      fromJS(contactData).forEach((contactValues :Map, contactEKID :UUID) => {
        const contactIndex :number = newContacts.findIndex((contact :Map) => getEKID(contact) === contactEKID);
        if (contactIndex !== -1) {
          contactValues.forEach((propertyValue :any, ptid :UUID) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            newContacts = newContacts.updateIn([contactIndex, fqn], List(), () => propertyValue);
          });
        }
      });
    }

    yield put(editContactInfo.success(id, { newAddress, newContacts }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editContactInfo.failure(id, error));
  }
  finally {
    yield put(editContactInfo.finally(id));
  }
}

function* editContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_CONTACT_INFO, editContactInfoWorker);
}

/*
 *
 * ContactInfoActions.editEmergencyContacts()
 *
 */

function* editEmergencyContactsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(editEmergencyContacts.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const {
      contactsAssociations,
      contactsDataToEdit,
      contactsDataToSubmit,
      emergencyContactInfoByContact,
      participantNeighbors,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const emergencyContactESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT);
    const emergencyContactInfoESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT_INFO);
    const isEmergencyContactForESID :UUID = getESIDFromApp(app, IS_EMERGENCY_CONTACT_FOR);
    const relationshipPTID :UUID = getPTIDFromEDM(edm, RELATIONSHIP);
    const phonePTID :UUID = getPTIDFromEDM(edm, PHONE_NUMBER);
    const emailPTID :UUID = getPTIDFromEDM(edm, EMAIL);

    let editedContactPeople :List = participantNeighbors.get(EMERGENCY_CONTACT, List());
    let editedAssociationMap :Map = participantNeighbors.get(IS_EMERGENCY_CONTACT_FOR, Map());
    let editedContactInfo :Map = emergencyContactInfoByContact;

    if (Object.values(contactsDataToEdit).length) {
      const response :Object = yield call(
        submitPartialReplaceWorker,
        submitPartialReplace({ entityData: contactsDataToEdit })
      );
      if (response.error) throw response.error;

      const editedPeopleData = contactsDataToEdit[emergencyContactESID];
      if (isDefined(editedPeopleData)) {
        fromJS(editedPeopleData).forEach((editedValueMap :Map, personEKID :UUID) => {
          const personEntityIndex :number = editedContactPeople
            .findIndex((person :Map) => getEKID(person) === personEKID);
          if (personEntityIndex !== -1) {
            editedValueMap.forEach((propertyValue :any, ptid :UUID) => {
              const fqn = getPropertyFqnFromEDM(edm, ptid);
              editedContactPeople = editedContactPeople
                .updateIn([personEntityIndex, fqn], Map(), () => propertyValue);
            });
          }
        });
      }

      const editedAssociationData = contactsDataToEdit[isEmergencyContactForESID];
      if (isDefined(editedAssociationData)) {
        fromJS(editedAssociationData).forEach((editedValueMap :Map, associationEKID :UUID) => {
          const contactPersonEKID :UUID = editedAssociationMap
            .findKey((association :Map) => getEKID(association) === associationEKID);
          if (isDefined(contactPersonEKID)) {
            editedAssociationMap = editedAssociationMap
              .updateIn(
                [contactPersonEKID, RELATIONSHIP],
                List(),
                () => List(editedValueMap.get(relationshipPTID))
              );
          }
        });
      }

      const editedContactInfoData = contactsDataToEdit[emergencyContactInfoESID];
      if (isDefined(editedContactInfoData)) {
        fromJS(editedContactInfoData).forEach((editedValueMap :Map, contactEKID :UUID) => {
          const contactPersonEKID :UUID = editedContactInfo
            .findKey((contactList :List, personEKID :UUID) => {
              if (contactList.find((contact :Map) => getEKID(contact) === contactEKID)) {
                return personEKID;
              }
              return undefined;
            });
          if (isDefined(contactPersonEKID)) {
            const contactEntityIndex = editedContactInfo
              .get(contactPersonEKID, List())
              .findIndex((contact) => getEKID(contact) === contactEKID);
            if (contactEntityIndex !== -1) {
              editedValueMap.forEach((propertyValue :any, ptid :UUID) => {
                const fqn = getPropertyFqnFromEDM(edm, ptid);
                editedContactInfo = editedContactInfo
                  .updateIn([contactPersonEKID, contactEntityIndex, fqn], Map(), () => propertyValue);
              });
            }
          }
        });
      }
    }

    let newEmergencyContactPeople :List = List().asMutable();
    let newIsEmergencyContactForAssociations :Map = Map().asMutable();
    let newContactInfoByContact :Map = Map().asMutable();

    if (Object.values(contactsDataToSubmit).length) {
      const response :Object = yield call(
        submitDataGraphWorker,
        submitDataGraph({ associationEntityData: contactsAssociations, entityData: contactsDataToSubmit })
      );
      if (response.error) throw response.error;
      const { entityKeyIds, entitySetIds } = response.data;

      entityKeyIds[emergencyContactESID].forEach((emergencyContactEKID :UUID, index :number) => {
        const emergencyContactData = contactsDataToSubmit[emergencyContactESID][index];
        const newEmergencyContactEntity :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([emergencyContactEKID]));
          fromJS(emergencyContactData).forEach((propertyValue :any, ptid :UUID) => {
            const fqn = getPropertyFqnFromEDM(edm, ptid);
            map.set(fqn, propertyValue);
          });
        });
        newEmergencyContactPeople.push(newEmergencyContactEntity);

        const phoneEKID :UUID = entityKeyIds[emergencyContactInfoESID][index];
        const phoneData = contactsDataToSubmit[emergencyContactInfoESID][index];
        const emailEKID :UUID = entityKeyIds[emergencyContactInfoESID][index + 1];
        const emailData = contactsDataToSubmit[emergencyContactInfoESID][index + 1];

        const newPhone :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([phoneEKID]));
          map.set(PHONE_NUMBER, List(phoneData[phonePTID]));
        });
        const newEmail :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([emailEKID]));
          map.set(EMAIL, List(emailData[emailPTID]));
        });
        const newContactInfo :List = List([newPhone, newEmail]);
        newContactInfoByContact.set(emergencyContactEKID, newContactInfo);
      });

      entitySetIds[isEmergencyContactForESID].forEach((isEmergencyContactForEKID :UUID, index :number) => {
        const emergencyContactEKID :UUID = entityKeyIds[emergencyContactESID][index];
        const relationship :string = contactsAssociations[isEmergencyContactForESID][index].data[relationshipPTID];
        const newIsEmergencyContactForAssociation :Map = Map().withMutations((map :Map) => {
          map.set(ENTITY_KEY_ID, List([isEmergencyContactForEKID]));
          map.set(RELATIONSHIP, List([relationship]));
        });
        newIsEmergencyContactForAssociations.set(emergencyContactEKID, newIsEmergencyContactForAssociation);
      });
    }

    newEmergencyContactPeople = newEmergencyContactPeople.asImmutable();
    newIsEmergencyContactForAssociations = newIsEmergencyContactForAssociations.asImmutable();
    newContactInfoByContact = newContactInfoByContact.asImmutable();

    editedContactPeople = editedContactPeople.concat(newEmergencyContactPeople);
    editedAssociationMap = editedAssociationMap.merge(newIsEmergencyContactForAssociations);
    editedContactInfo = editedContactInfo.merge(newContactInfoByContact);

    yield put(editEmergencyContacts.success(id, { editedAssociationMap, editedContactInfo, editedContactPeople }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editEmergencyContacts.failure(id, error));
  }
  finally {
    yield put(editEmergencyContacts.finally(id));
  }
}

function* editEmergencyContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_EMERGENCY_CONTACTS, editEmergencyContactsWorker);
}

/*
 *
 * ContactInfoActions.getEmergencyContactInfo()
 *
 */

function* getEmergencyContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(getEmergencyContactInfo.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { emergencyContactEKIDs } = value;

    const app = yield select(getAppFromState);
    const emergencyContactESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT);
    const emergencyContactInfoESID :UUID = getESIDFromApp(app, EMERGENCY_CONTACT_INFO);

    const filter = {
      entityKeyIds: emergencyContactEKIDs,
      sourceEntitySetIds: [],
      destinationEntitySetIds: [emergencyContactInfoESID],
    };

    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: emergencyContactESID, filter })
    );
    if (response.error) throw response.error;
    const neighbors = fromJS(response.data);
    const emergencyContactInfoByContact :Map = Map().withMutations((map :Map) => {
      neighbors.forEach((neighborsList :List, emergencyContactEKID :UUID) => {
        const contactInfoList :List = neighborsList.map((neighbor :Map) => getNeighborDetails(neighbor));
        map.set(emergencyContactEKID, contactInfoList);
      });
    });

    yield put(getEmergencyContactInfo.success(id, emergencyContactInfoByContact));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEmergencyContactInfo.failure(id, error));
  }
  finally {
    yield put(getEmergencyContactInfo.finally(id));
  }
}

function* getEmergencyContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_EMERGENCY_CONTACT_INFO, getEmergencyContactInfoWorker);
}

export {
  editContactInfoWatcher,
  editContactInfoWorker,
  editEmergencyContactsWatcher,
  editEmergencyContactsWorker,
  getEmergencyContactInfoWatcher,
  getEmergencyContactInfoWorker,
};
