// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { SEARCH_RELEASES, searchReleases } from './ReleasesActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP, SHARED } from '../../utils/constants/ReduxStateConstants';

const LOG = new Logger('ReleasesSagas');

const getAppFromState = (state) => state.get(APP.APP, Map());
