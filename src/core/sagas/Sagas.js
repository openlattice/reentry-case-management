/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as EventSagas from '../../containers/profile/events/EventSagas';
import * as IntakeSagas from '../../containers/intake/IntakeSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as ProfileSagas from '../../containers/profile/ProfileSagas';
import * as ReleasesSagas from '../../containers/releases/ReleasesSagas';
import * as RoutingSagas from '../router/RoutingSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(SearchApiSagas.searchEntitySetDataWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),
    fork(AppSagas.switchOrganizationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // EventSagas
    fork(EventSagas.getProvidersWatcher),
    fork(EventSagas.recordEnrollmentEventWatcher),

    // IntakeSagas
    fork(IntakeSagas.getIncarcerationFacilitiesWatcher),
    fork(IntakeSagas.submitIntakeFormWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.getJailNamesForJailStaysWatcher),
    fork(ParticipantsSagas.getParticipantNeighborsWatcher),
    fork(ParticipantsSagas.searchParticipantsWatcher),

    // ProfileSagas
    fork(ProfileSagas.getParticipantWatcher),
    fork(ProfileSagas.getParticipantNeighborsWatcher),
    fork(ProfileSagas.loadProfileWatcher),

    // ReleasesSagas
    fork(ReleasesSagas.getJailsByJailStayEKIDWatcher),
    fork(ReleasesSagas.searchJailStaysByPersonWatcher),
    fork(ReleasesSagas.searchPeopleByJailStayWatcher),
    fork(ReleasesSagas.searchReleasesByDateWatcher),
    fork(ReleasesSagas.searchReleasesByPersonNameWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}
