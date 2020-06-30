// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_JAIL_NAMES_FOR_JAIL_STAYS,
  GET_PARTICIPANT_NEIGHBORS,
  SEARCH_PARTICIPANTS,
  getJailNamesForJailStays,
  getParticipantNeighbors,
  searchParticipants,
} from './ParticipantsActions';

import Logger from '../../utils/Logger';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getFqnFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined, isNonEmptyString } from '../../utils/LangUtils';
import { getSearchTerm } from '../../utils/SearchUtils';
import { DST, SRC } from '../../utils/constants/GeneralConstants';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';

const LOG = new Logger('ParticipantsSagas');
const { FullyQualifiedName } = Models;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  MANUAL_JAILS_PRISONS,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  NAME,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());
/*
 *
 * ParticipantsSagas.getJailNamesForJailStays()
 *
 */

function* getJailNamesForJailStaysWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getJailNamesForJailStays.request(id, value));
    const { jailStayEKIDs } = value;

    const app = yield select(getAppFromState);
    const manualJailStayESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
    const manualJailsOrPrisonsESID :UUID = getESIDFromApp(app, MANUAL_JAILS_PRISONS);

    const searchFilter = {
      entityKeyIds: jailStayEKIDs,
      destinationEntitySetIds: [manualJailsOrPrisonsESID],
      sourceEntitySetIds: [],
    };

    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: manualJailStayESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    const jailNamesByJailStayEKID :Map = fromJS(response.data)
      .map((neighborList :List) => {
        if (!neighborList.isEmpty()) {
          const facilityEntity :Map = getNeighborDetails(neighborList.get(0));
          const { [NAME]: facilityName } = getEntityProperties(facilityEntity, [NAME]);
          return facilityName;
        }
        return '';
      });

    yield put(getJailNamesForJailStays.success(id, jailNamesByJailStayEKID));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getJailNamesForJailStays.failure(id, error));
  }
  finally {
    yield put(getJailNamesForJailStays.finally(id));
  }
}

function* getJailNamesForJailStaysWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_JAIL_NAMES_FOR_JAIL_STAYS, getJailNamesForJailStaysWorker);
}

/*
 *
 * ParticipantsSagas.getParticipantNeighbors()
 *
 */

function* getParticipantNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getParticipantNeighbors.request(id, value));
    const { neighborsToGet, participantEKIDs } = value;

    const app = yield select(getAppFromState);
    const participantsESID :UUID = getESIDFromApp(app, PEOPLE);

    const searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [],
    };
    neighborsToGet.forEach((neighborMap :Object) => {
      const { direction, neighborESID } = neighborMap;
      if (direction === DST) searchFilter.destinationEntitySetIds.push(neighborESID);
      if (direction === SRC) searchFilter.sourceEntitySetIds.push(neighborESID);
    });

    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: participantsESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    const neighbors :Map = fromJS(response.data)
      .map((neighborList :List) => {
        if (!neighborList.isEmpty()) {
          let personNeighborMap :Map = Map();
          neighborList.forEach((neighbor :Map) => {
            const neighborESID :UUID = getNeighborESID(neighbor);
            const neighborEntityFqn :FullyQualifiedName = getFqnFromApp(app, neighborESID);
            const entity :Map = getNeighborDetails(neighbor);
            let entityList :List = personNeighborMap.get(neighborEntityFqn, List());
            entityList = entityList.push(entity);
            personNeighborMap = personNeighborMap.set(neighborEntityFqn, entityList);
          });
          return personNeighborMap;
        }
        return neighborList;
      });

    const jailStayEKIDs :UUID[] = [];
    neighbors.forEach((personNeighborMap :Map) => {
      if (personNeighborMap.has(MANUAL_JAIL_STAYS)) {
        personNeighborMap.get(MANUAL_JAIL_STAYS).forEach((jailStay :string) => {
          jailStayEKIDs.push(getEKID(jailStay));
        });
      }
    });
    if (jailStayEKIDs.length) {
      yield call(getJailNamesForJailStaysWorker, getJailNamesForJailStays({ jailStayEKIDs }));
    }

    yield put(getParticipantNeighbors.success(id, neighbors));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipantNeighbors.failure(id, error));
  }
  finally {
    yield put(getParticipantNeighbors.finally(id));
  }
}

function* getParticipantNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_NEIGHBORS, getParticipantNeighborsWorker);
}

/*
 *
 * ParticipantsSagas.searchParticipants()
 *
 */

function* searchParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let searchedParticipants :List = List();
  let totalHits :number = 0;
  let response :Object = {};

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
    const firstNamePTID :UUID = getPTIDFromEDM(edm, FIRST_NAME);
    const lastNamePTID :UUID = getPTIDFromEDM(edm, LAST_NAME);
    const dobPTID :UUID = getPTIDFromEDM(edm, DOB);

    const searchOptions = {
      entitySetIds: [participantsESID],
      start,
      maxHits,
      constraints: []
    };

    if (firstName === '*' && lastName === '*') {
      searchOptions.constraints.push({
        constraints: [{
          type: 'advanced',
          searchFields: [
            { searchTerm: '*', property: firstNamePTID },
            { searchTerm: '*', property: lastNamePTID }
          ],
        }]
      });
      response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
      if (response.error) throw response.error;
      searchedParticipants = fromJS(response.data.hits);
      totalHits = response.data.numHits;
    }
    else {
      if (isNonEmptyString(firstName)) {
        const firstNameConstraint = getSearchTerm(firstNamePTID, firstName);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: firstNameConstraint,
            fuzzy: true
          }]
        });
      }
      if (isNonEmptyString(lastName)) {
        const lastNameConstraint = getSearchTerm(lastNamePTID, lastName);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: lastNameConstraint,
            fuzzy: true
          }]
        });
      }
      if (DateTime.fromISO(dob).isValid) {
        const dobConstraint = getSearchTerm(dobPTID, dob);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: dobConstraint,
            fuzzy: true
          }]
        });
      }

      response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
      if (response.error) throw response.error;
      searchedParticipants = fromJS(response.data.hits);
      totalHits = response.data.numHits;
    }

    if (totalHits) {
      const participantEKIDs :UUID[] = searchedParticipants.map((person :Object) => getEKID(person)).toJS();
      const manualJailStaysESID :UUID = getESIDFromApp(app, MANUAL_JAIL_STAYS);
      const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
      const neighborsToGet = [
        { direction: DST, neighborESID: manualJailStaysESID },
        { direction: DST, neighborESID: needsAssessmentESID },
      ];
      yield call(getParticipantNeighborsWorker, getParticipantNeighbors({ neighborsToGet, participantEKIDs }));
    }

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
  getJailNamesForJailStaysWatcher,
  getJailNamesForJailStaysWorker,
  getParticipantNeighborsWatcher,
  getParticipantNeighborsWorker,
  searchParticipantsWatcher,
  searchParticipantsWorker,
};
