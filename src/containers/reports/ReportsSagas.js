// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
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
  getNeighborDetails,
  getPTIDFromEDM,
} from '../../utils/DataUtils';
import { getUTCDateRangeSearchString } from '../../utils/SearchUtils';
import { createDateTime } from '../../utils/DateTimeUtils';
import {
  DOWNLOAD_PARTICIPANTS,
  downloadParticipants,
} from './ReportsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEEDS_ASSESSMENT, PEOPLE } = APP_TYPE_FQNS;
const { DATETIME_COMPLETED } = PROPERTY_TYPE_FQNS;


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

    // if newIntakes && !activeEnrollmentsChecked:
    // create search date range for finding needs assessments submitted from month start to month end
    // if newIntakes && activeEnrollmentsChecked:
    // create search date range for finding needs assessments submitted from anytime to month end
    // if !newIntakes && activeEnrollmentsChecked:
    // get everyone

    let response :Object = {};
    let needsAssessments :List = List();
    const searchOptions = {
      entitySetIds: [needsAssessmentESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };
    let searchTerm :string = '';
    const dateTimeSelected :DateTime = createDateTime(dateSelected);
    if (activeEnrollmentsChecked) {
      // get all actively enrolled people (complete needs assessments) from * to the end of month selected
      searchTerm = getUTCDateRangeSearchString(
        dateTimeCompletedPTID,
        'month',
        undefined,
        dateTimeSelected
      );
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
    }
    else if (!activeEnrollmentsChecked && newIntakesChecked && dateTimeSelected.isValid) {
      // get people who completed needs assessment within month selected
      searchTerm = getUTCDateRangeSearchString(
        dateTimeCompletedPTID,
        'month',
        dateTimeSelected,
        dateTimeSelected
      );
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
    }
    else if (!activeEnrollmentsChecked && newIntakesChecked && !dateTimeSelected.isValid) {
      // get people who completed needs assessment within current month
      const now = DateTime.local();
      searchTerm = getUTCDateRangeSearchString(
        dateTimeCompletedPTID,
        'month',
        now,
        now
      );
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
    }
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
      //
      // let jsonResults :List = List().withMutations((list :List) => {
      //
      // });
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
