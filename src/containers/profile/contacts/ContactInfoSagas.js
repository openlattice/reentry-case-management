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
import { getEKID, getESIDFromApp, getPropertyFqnFromEDM } from '../../../utils/DataUtils';
import { submitPartialReplace } from '../../../core/data/DataActions';
import { submitPartialReplaceWorker } from '../../../core/data/DataSagas';
import { EDIT_CONTACT_INFO, editContactInfo } from './ContactInfoActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { APP, EDM } from '../../../utils/constants/ReduxStateConstants';

const { CONTACT_INFO, LOCATION } = APP_TYPE_FQNS;

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

export {
  editContactInfoWatcher,
  editContactInfoWorker,
};
