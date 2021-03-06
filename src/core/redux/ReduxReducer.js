/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import caseNotesReducer from '../../containers/casenotes/CaseNotesReducer';
import edmReducer from '../edm/EDMReducer';
import eventReducer from '../../containers/profile/events/EventReducer';
import intakeReducer from '../../containers/intake/IntakeReducer';
import participantFollowUpsReducer from '../../containers/profile/tasks/FollowUpsReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import profileReducer from '../../containers/profile/ProfileReducer';
import providersReducer from '../../containers/providers/ProvidersReducer';
import releasesReducer from '../../containers/releases/ReleasesReducer';
import reportsReducer from '../../containers/reports/ReportsReducer';
import tasksReducer from '../../containers/tasks/TasksReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    caseNotes: caseNotesReducer,
    edm: edmReducer,
    event: eventReducer,
    intake: intakeReducer,
    participantFollowUps: participantFollowUpsReducer,
    participants: participantsReducer,
    profile: profileReducer,
    providers: providersReducer,
    releases: releasesReducer,
    reports: reportsReducer,
    router: connectRouter(routerHistory),
    taskManager: tasksReducer,
  });
}
