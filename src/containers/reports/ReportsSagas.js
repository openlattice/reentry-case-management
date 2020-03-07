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
import { isDefined } from '../../utils/LangUtils';
import {
  getEKID,
  getESIDFromApp,
  getEntityProperties,
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import {
  DOWNLOAD_PARTICIPANTS,
  downloadParticipants,
} from './ReportsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEEDS_ASSESSMENT, PEOPLE } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
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
      if (response.error) {
        throw response.error;
      }
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
    LOG.error('caught exception in downloadParticipantsWorker()', error);
    yield put(downloadParticipants.failure(id, error));
  }
  finally {
    yield put(downloadParticipants.finally(id));
  }
}

function* downloadParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_PARTICIPANTS, downloadParticipantsWorker);
}

export {
  downloadParticipantsWatcher,
  downloadParticipantsWorker,
};
