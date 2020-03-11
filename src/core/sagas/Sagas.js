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
import * as ParticipantFollowUpsSagas from '../../containers/profile/tasks/FollowUpsSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as ProfileSagas from '../../containers/profile/ProfileSagas';
import * as ProvidersSagas from '../../containers/providers/ProvidersSagas';
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
    fork(EventSagas.recordEnrollmentEventWatcher),

    // IntakeSagas
    fork(IntakeSagas.getIncarcerationFacilitiesWatcher),
    fork(IntakeSagas.submitIntakeFormWatcher),

    // ParticipantFollowUpsSagas
    fork(ParticipantFollowUpsSagas.getFollowUpNeighborsWatcher),
    fork(ParticipantFollowUpsSagas.loadTasksWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.getJailNamesForJailStaysWatcher),
    fork(ParticipantsSagas.getParticipantNeighborsWatcher),
    fork(ParticipantsSagas.searchParticipantsWatcher),

    // ProfileSagas
    fork(ProfileSagas.getEnrollmentStatusNeighborsWatcher),
    fork(ProfileSagas.getParticipantWatcher),
    fork(ProfileSagas.getParticipantNeighborsWatcher),
    fork(ProfileSagas.loadProfileWatcher),

    // ProvidersSagas
    fork(ProvidersSagas.addNewProviderContactsWatcher),
    fork(ProvidersSagas.createNewProviderWatcher),
    fork(ProvidersSagas.deleteProviderStaffAndContactsWatcher),
    fork(ProvidersSagas.editProviderWatcher),
    fork(ProvidersSagas.editProviderContactsWatcher),
    fork(ProvidersSagas.getContactInfoWatcher),
    fork(ProvidersSagas.getProvidersWatcher),
    fork(ProvidersSagas.getProviderNeighborsWatcher),

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
