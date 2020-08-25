/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as CaseNotesSagas from '../../containers/casenotes/CaseNotesSagas';
import * as ContactInfoSagas from '../../containers/profile/contacts/ContactInfoSagas';
import * as CourtSagas from '../../containers/profile/court/CourtSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as EditPersonSagas from '../../containers/profile/person/EditPersonSagas';
import * as EventSagas from '../../containers/profile/events/EventSagas';
import * as IntakeSagas from '../../containers/intake/IntakeSagas';
import * as NeedsSagas from '../../containers/profile/needs/NeedsSagas';
import * as ParticipantFollowUpsSagas from '../../containers/profile/tasks/FollowUpsSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as ProfileSagas from '../../containers/profile/ProfileSagas';
import * as ProgramHistorySagas from '../../containers/profile/programhistory/ProgramHistorySagas';
import * as ProvidersSagas from '../../containers/providers/ProvidersSagas';
import * as ReleasesSagas from '../../containers/releases/ReleasesSagas';
import * as ReportsSagas from '../../containers/reports/ReportsSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as SexOffenderSagas from '../../containers/profile/sexoffender/SexOffenderSagas';
import * as TasksSagas from '../../containers/tasks/TasksSagas';

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

    // CaseNotesSagas
    fork(CaseNotesSagas.getMeetingWatcher),
    fork(CaseNotesSagas.getReentryStaffWatcher),
    fork(CaseNotesSagas.submitCaseNotesAndCompleteTaskWatcher),

    // ContactInfoSagas
    fork(ContactInfoSagas.deleteEmergencyContactWatcher),
    fork(ContactInfoSagas.editContactInfoWatcher),
    fork(ContactInfoSagas.editEmergencyContactsWatcher),
    fork(ContactInfoSagas.getEmergencyContactInfoWatcher),

    // CourtSagas
    fork(CourtSagas.deleteCourtHearingWatcher),
    fork(CourtSagas.editCourtHearingsWatcher),

    // EditPersonSagas
    fork(EditPersonSagas.editEducationWatcher),
    fork(EditPersonSagas.editPersonDetailsWatcher),
    fork(EditPersonSagas.editPersonWatcher),
    fork(EditPersonSagas.editStateIdWatcher),
    fork(EditPersonSagas.submitEducationWatcher),
    fork(EditPersonSagas.submitPersonDetailsWatcher),
    fork(EditPersonSagas.submitStateIdWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // EventSagas
    fork(EventSagas.recordEnrollmentEventWatcher),

    // IntakeSagas
    fork(IntakeSagas.getIncarcerationFacilitiesWatcher),
    fork(IntakeSagas.submitIntakeFormWatcher),

    // NeedsSagas
    fork(NeedsSagas.editNeedsWatcher),

    // ParticipantFollowUpsSagas
    fork(ParticipantFollowUpsSagas.createNewFollowUpWatcher),
    fork(ParticipantFollowUpsSagas.getEntitiesForNewFollowUpFormWatcher),
    fork(ParticipantFollowUpsSagas.getFollowUpNeighborsWatcher),
    fork(ParticipantFollowUpsSagas.loadTasksWatcher),
    fork(ParticipantFollowUpsSagas.markFollowUpAsCompleteWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.getJailNamesForJailStaysWatcher),
    fork(ParticipantsSagas.getParticipantNeighborsWatcher),
    fork(ParticipantsSagas.searchParticipantsWatcher),

    // ProfileSagas
    fork(ProfileSagas.deleteParticipantAndNeighborsWatcher),
    fork(ProfileSagas.getEnrollmentStatusNeighborsWatcher),
    fork(ProfileSagas.getParticipantWatcher),
    fork(ProfileSagas.getParticipantNeighborsWatcher),
    fork(ProfileSagas.loadProfileWatcher),
    fork(ProfileSagas.loadPersonInfoForEditWatcher),

    // ProgramHistorySagas
    fork(ProgramHistorySagas.editEventWatcher),
    fork(ProgramHistorySagas.editReleaseInfoWatcher),

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

    // ReportsSagas
    fork(ReportsSagas.downloadParticipantsWatcher),
    fork(ReportsSagas.getIntakesPerYearWatcher),
    fork(ReportsSagas.getReportsDataWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // SexOffenderSagas
    fork(SexOffenderSagas.editSexOffenderWatcher),

    // TasksSagas
    fork(TasksSagas.getPeopleForNewTaskFormWatcher),
    fork(TasksSagas.loadTaskManagerDataWatcher),
    fork(TasksSagas.searchForTasksWatcher),
  ]);
}
