/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import intakeReducer from '../../containers/intake/IntakeReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import releasesReducer from '../../containers/releases/ReleasesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    intake: intakeReducer,
    participants: participantsReducer,
    releases: releasesReducer,
    router: connectRouter(routerHistory),
  });
}
