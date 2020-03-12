// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  OrderedMap,
  fromJS,
  getIn,
  setIn,
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
  GET_INTAKES_PER_YEAR,
  GET_REPORTS_DATA,
  downloadParticipants,
  getIntakesPerYear,
  getReportsData,
} from './ReportsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../profile/events/EventConstants';
import { TABLE_HEADERS } from './ReportsConstants';

const {
  ENROLLMENT_STATUS,
  JAIL_STAYS,
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
  PROJECTED_RELEASE_DATETIME,
  STATUS,
  TYPE,
} = PROPERTY_TYPE_FQNS;

const headersByPropertyFqn :Map = Map().withMutations((map :Map) => {
  map.set(LAST_NAME, 'Last Name');
  map.set(FIRST_NAME, 'First Name');
  map.set(DOB, 'Date of Birth');
  map.set(DATETIME_COMPLETED, 'Enrollment Date');
  map.set(TYPE, 'Needs');
}).asImmutable();

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
          let providerTypes = types;
          if (isNonEmptyArray(types)) providerTypes = types.join(', ');
          const csvRow :OrderedMap = OrderedMap().withMutations((map :OrderedMap) => {
            map.set(headersByPropertyFqn.get(LAST_NAME), lastName);
            map.set(headersByPropertyFqn.get(FIRST_NAME), firstName);
            map.set(headersByPropertyFqn.get(DOB), DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT));
            map.set(headersByPropertyFqn.get(TYPE), providerTypes);
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

/*
 *
 * ReportsActions.getIntakesPerYear()
 *
 */

function* getIntakesPerYearWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const sagaResponse = {};

  try {
    yield put(getIntakesPerYear.request(id));
    const { dateTimeObj } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const needsAssessmentESID :UUID = getESIDFromApp(app, NEEDS_ASSESSMENT);
    const dateTimeCompletedPTID :UUID = getPTIDFromEDM(edm, DATETIME_COMPLETED);
    const searchOptions = {
      entitySetIds: [needsAssessmentESID],
      start: 0,
      maxHits: 10000,
      constraints: [{
        min: 1,
        constraints: [{
          searchTerm: getUTCDateRangeSearchString(
            dateTimeCompletedPTID,
            'year',
            dateTimeObj,
            dateTimeObj
          ),
          fuzzy: false
        }]
      }]
    };

    const response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    let numberOfIntakesPerMonth :List = fromJS([
      { y: 0, x: 'Jan' },
      { y: 0, x: 'Feb' },
      { y: 0, x: 'Mar' },
      { y: 0, x: 'Apr' },
      { y: 0, x: 'May' },
      { y: 0, x: 'Jun' },
      { y: 0, x: 'July' },
      { y: 0, x: 'Aug' },
      { y: 0, x: 'Sept' },
      { y: 0, x: 'Oct' },
      { y: 0, x: 'Nov' },
      { y: 0, x: 'Dec' }
    ]);
    response.data.hits.forEach((assessment :Object) => {
      const dateTimeCompleted :string = getIn(assessment, [DATETIME_COMPLETED, 0]);
      const { month } = DateTime.fromISO(dateTimeCompleted); // indexed 1-12
      const currentCount :number = getIn(numberOfIntakesPerMonth, [month - 1, 'y']);
      numberOfIntakesPerMonth = setIn(numberOfIntakesPerMonth, [month - 1, 'y'], currentCount + 1);
    });

    sagaResponse.data = numberOfIntakesPerMonth;
    yield put(getIntakesPerYear.success(id, numberOfIntakesPerMonth));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(action.type, error);
    yield put(getIntakesPerYear.failure(id, error));
  }
  finally {
    yield put(getIntakesPerYear.finally(id));
  }
  return sagaResponse;
}

function* getIntakesPerYearWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INTAKES_PER_YEAR, getIntakesPerYearWorker);
}

/*
 *
 * ReportsActions.getReportsData()
 *
 */

function* getReportsDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(getReportsData.request(id));

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const jailStaysESID :UUID = getESIDFromApp(app, JAIL_STAYS);
    const projectedReleaseDateTimePTID :UUID = getPTIDFromEDM(edm, PROJECTED_RELEASE_DATETIME);
    const now = DateTime.local();

    const releasesSearchOptions = {
      entitySetIds: [jailStaysESID],
      start: 0,
      maxHits: 10000,
      constraints: [{
        min: 1,
        constraints: [{
          searchTerm: getUTCDateRangeSearchString(
            projectedReleaseDateTimePTID,
            'week',
            now,
            now
          ),
          fuzzy: false
        }]
      }]
    };

    const [providersResponse, intakesPerYear, jailStaysResponse] = yield all([
      call(getProvidersWorker, getProviders({ fetchNeighbors: false })),
      call(getIntakesPerYearWorker, getIntakesPerYear({ dateTimeObj: now })),
      call(executeSearchWorker, executeSearch({ searchOptions: releasesSearchOptions })),
    ]);
    if (providersResponse.error) throw providersResponse.error;
    if (intakesPerYear.error) throw intakesPerYear.error;
    if (jailStaysResponse.error) throw jailStaysResponse.error;

    const currentMonthIndexedFrom1 :number = now.month;
    const numberOfIntakesThisMonth :number = getIn(intakesPerYear.data, [currentMonthIndexedFrom1 - 1, 'y'], 0);
    const numberOfReleasesThisWeek :number = jailStaysResponse.data.numHits;
    let providers :List = fromJS(providersResponse.data);
    const providerEKIDs :UUID[] = [];
    providers.forEach((provider :Map) => {
      providerEKIDs.push(getEKID(provider));
    });
    const providersESID :UUID = getESIDFromApp(app, PROVIDER);
    const enrollmentStatusESID :UUID = getESIDFromApp(app, ENROLLMENT_STATUS);
    const searchFilter :Object = {
      entityKeyIds: providerEKIDs,
      destinationEntitySetIds: [enrollmentStatusESID],
      sourceEntitySetIds: [],
    };
    const enrollmentResponse :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: providersESID, filter: searchFilter })
    );
    if (enrollmentResponse.error) throw enrollmentResponse.error;
    const enrollmentStatusesByProviderEKID :Map = fromJS(enrollmentResponse.data)
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

    yield put(getReportsData.success(id, { numberOfIntakesThisMonth, numberOfReleasesThisWeek, servicesTableData }));
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
  getIntakesPerYearWatcher,
  getIntakesPerYearWorker,
  getReportsDataWatcher,
  getReportsDataWorker,
};
