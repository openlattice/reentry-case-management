/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import eventReducer from '../../containers/profile/events/EventReducer';
import intakeReducer from '../../containers/intake/IntakeReducer';
import participantTasksReducer from '../../containers/profile/tasks/TasksReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import profileReducer from '../../containers/profile/ProfileReducer';
import providersReducer from '../../containers/providers/ProvidersReducer';
import releasesReducer from '../../containers/releases/ReleasesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    event: eventReducer,
    intake: intakeReducer,
    participantTasks: participantTasksReducer,
    participants: participantsReducer,
    profile: profileReducer,
    providers: providersReducer,
    releases: releasesReducer,
    router: connectRouter(routerHistory),
  });
}
