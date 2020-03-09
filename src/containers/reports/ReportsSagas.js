// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  OrderedMap,
  fromJS
} from 'immutable';
import { DateTime } from 'luxon';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined, isNonEmptyArray } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { getProviders } from '../providers/ProvidersActions';
import { getProvidersWorker } from '../providers/ProvidersSagas';
import {
  DOWNLOAD_PARTICIPANTS,
  GET_REPORTS_DATA,
  downloadParticipants,
  getReportsData,
} from './ReportsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../profile/events/EventConstants';
import { TABLE_HEADERS } from './ReportsConstants';

const {
  ENROLLMENT_STATUS,
  NEEDS_ASSESSMENT,
  PEOPLE,
  PROVIDER,
} = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  STATUS,
  TYPE,
} = PROPERTY_TYPE_FQNS;

const headersByPropertyFqn :Map = Map().withMutations((map :Map) => {
  map.set(LAST_NAME, 'Last Name');
  map.set(FIRST_NAME, 'First Name');
  map.set(DOB, 'Date of Birth');
  map.set(DATETIME_COMPLETED, 'Enrollment Date');
  map.set(TYPE, 'Needs');
});

const LOG = new Logger('ReportsSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getAppFromState = (state) => state.get(APP.APP, Map());
const getEdmFromState = (state) => state.get(EDM.EDM, Map());

/*
 *
 * ReportsActions.downloadParticipants()
 *
 */

function* downloadParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(downloadParticipants.request(id));
    const { activeEnrollmentsChecked, dateSelected, newIntakesChecked } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const peopleESID :UUID = getESIDFromApp(app, PEOPLE);
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const dateTimeCompletedPTID :UUID = getPTIDFromEDM(edm, DATETIME_COMPLETED);

    let response :Object = {};
    let needsAssessments :List = List();
    const searchOptions = {
      entitySetIds: [needsAssessmentESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };

    // if activeEnrollmentsChecked: get actively enrolled people from * to end of month selected (or current)
    // if newIntakesChecked: get people who completed needs assessment in month selected (or current)
    const now = DateTime.local();
    const dateTimeSelected :DateTime = DateTime.fromISO(dateSelected);
    const endDateToSearch :DateTime = dateTimeSelected.isValid ? dateTimeSelected : now;
    const startDateToSearch :any = activeEnrollmentsChecked ? undefined : endDateToSearch;

    const searchTerm :string = getUTCDateRangeSearchString(
      dateTimeCompletedPTID,
      'month',
      startDateToSearch,
      endDateToSearch
    );
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm,
        fuzzy: false
      }]
    });

    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    needsAssessments = fromJS(response.data.hits);
    if (!needsAssessments.isEmpty()) {
      const needsAssessmentEKIDs :UUID[] = [];
      needsAssessments.forEach((assessment :Map) => {
        needsAssessmentEKIDs.push(getEKID(assessment));
      });

      const searchFilter :Object = {
        entityKeyIds: needsAssessmentEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: needsAssessmentESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const peopleByNeedsAssessmentEKID :Map = fromJS(response.data)
        .map((neighborList :List) => neighborList.get(0))
        .map((neighbor :Map) => getNeighborDetails(neighbor));

      const jsonResults :List = List().withMutations((list :List) => {
        needsAssessments.forEach((needsAssessment :Map) => {
          const { [DATETIME_COMPLETED]: datetime, [TYPE]: types } = getEntityProperties(
            needsAssessment,
            [DATETIME_COMPLETED, TYPE]
          );
          const person :Map = peopleByNeedsAssessmentEKID.get(getEKID(needsAssessment), Map());
          const { [DOB]: dob, [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
            person,
            [DOB, FIRST_NAME, LAST_NAME]
          );

          const csvRow :OrderedMap = OrderedMap().withMutations((map :OrderedMap) => {
            map.set(headersByPropertyFqn.get(LAST_NAME), lastName);
            map.set(headersByPropertyFqn.get(FIRST_NAME), firstName);
            map.set(headersByPropertyFqn.get(DOB), DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT));
            map.set(headersByPropertyFqn.get(TYPE), types.join(', '));
            map.set(
              headersByPropertyFqn.get(DATETIME_COMPLETED),
              DateTime.fromISO(datetime).toLocaleString(DateTime.DATE_SHORT)
            );
          });
          list.push(csvRow);
        });
      });

      const csv = Papa.unparse(jsonResults.toJS());
      const blob = new Blob([csv], {
        type: 'application/json'
      });
      let name :string = 'participants';
      if (newIntakesChecked) name += '_new-intakes';
      if (activeEnrollmentsChecked) name += '_active-enrollments';
      if (dateTimeSelected.isValid) name += `_${dateSelected}`;
      if (!dateTimeSelected.isValid) name += `_${now.toISODate()}`;
      FS.saveAs(blob, name.concat('.csv'));
    }

    yield put(downloadParticipants.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadParticipants.failure(id, error));
  }
  finally {
    yield put(downloadParticipants.finally(id));
  }
}

function* downloadParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_PARTICIPANTS, downloadParticipantsWorker);
}

function* getReportsDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getReportsData.request(id));

    let response :Object = yield call(getProvidersWorker, getProviders({ fetchNeighbors: false }));
    if (response.error) throw response.error;
    let providers :List = fromJS(response.data);
    const providerEKIDs :UUID[] = [];
    providers.forEach((provider :Map) => {
      providerEKIDs.push(getEKID(provider));
    });

    const app = yield select(getAppFromState);
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const searchFilter :Object = {
      entityKeyIds: providerEKIDs,
      destinationEntitySetIds: [enrollmentStatusESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const enrollmentStatusesByProviderEKID :Map = fromJS(response.data)
      .map((statusList :List) => statusList.map((neighbor :Map) => getNeighborDetails(neighbor)))
      .map((statusList :List) => statusList
        .filter((status :Map) => status.getIn([STATUS, 0]) === ENROLLMENT_STATUSES[1])) // 'Enrolled'
      .map((statusList :List) => statusList.count());
    providers = providers.sort((providerA :Map, providerB :Map) => {
      const countA :number = enrollmentStatusesByProviderEKID.get(getEKID(providerA), 0);
      const countB :number = enrollmentStatusesByProviderEKID.get(getEKID(providerB), 0);
      if (countA > countB) return -1;
      if (countA < countB) return 1;
      return 0;
    });

    const servicesTableData :Object[] = [];
    providers.forEach((provider :Map) => {
      const { [NAME]: name, [TYPE]: types } = getEntityProperties(provider, [NAME, TYPE]);
      let providerTypes = types;
      if (isNonEmptyArray(types)) providerTypes = types.join(', ');
      const providerEKID :UUID = getEKID(provider);
      servicesTableData.push({
        [TABLE_HEADERS[0]]: name,
        [TABLE_HEADERS[1]]: providerTypes,
        [TABLE_HEADERS[2]]: enrollmentStatusesByProviderEKID.get(providerEKID, 0),
        id: providerEKID,
      });
    });

    yield put(getReportsData.success(id, { servicesTableData }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getReportsData.failure(id, error));
  }
  finally {
    yield put(getReportsData.finally(id));
  }
}

function* getReportsDataWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REPORTS_DATA, getReportsDataWorker);
}

export {
  downloadParticipantsWatcher,
  downloadParticipantsWorker,
  getReportsDataWatcher,
  getReportsDataWorker,
};
