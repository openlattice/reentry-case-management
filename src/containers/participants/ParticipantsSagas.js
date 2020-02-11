// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined, isNonEmptyString } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getSearchTerm, getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { SEARCH_PARTICIPANTS, searchParticipants } from './ParticipantsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('ReleasesSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { PEOPLE } = APP_TYPE_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());


function* searchParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let searchedParticipants :List = List();
  let totalHits :number = 0;

  try {
    yield put(searchParticipants.request(id, value));
    const {
      dob,
      firstName,
      lastName,
      maxHits,
      start,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const participantsESID :UUID = getESIDFromApp(app, PEOPLE);

    const searchOptions = {
      entitySetIds: [participantsESID],
      start,
      maxHits,
      constraints: []
    };

    const firstNamePTID :UUID = getPTIDFromEDM(edm, FIRST_NAME);
    if (firstName.length) {
      const firstNameConstraint = getSearchTerm(firstNamePTID, firstName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: firstNameConstraint,
          fuzzy: true
        }]
      });
    }

    const lastNamePTID :UUID = getPTIDFromEDM(edm, LAST_NAME);
    if (lastName.length) {
      const lastNameConstraint = getSearchTerm(lastNamePTID, lastName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: lastNameConstraint,
          fuzzy: true
        }]
      });
    }

    const dobPTID :UUID = getPTIDFromEDM(edm, DOB);
    if (DateTime.fromISO(dob).isValid) {
      const lastNameConstraint = getSearchTerm(dobPTID, dob);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: lastNameConstraint,
          fuzzy: true
        }]
      });
    }

    const response :Object = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    searchedParticipants = fromJS(response.data.hits);
    totalHits = response.data.numHits;

    yield put(searchParticipants.success(id, { searchedParticipants, totalHits }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchParticipants.failure(id, error));
  }
  finally {
    yield put(searchParticipants.finally(id));
  }
}

function* searchParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_PARTICIPANTS, searchParticipantsWorker);
}

export {
  searchParticipantsWatcher,
  searchParticipantsWorker,
};
