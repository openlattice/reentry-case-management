/*
 * @flow
 */

import React, { Component } from 'react';

import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  Spinner,
  StylesProvider,
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as AppActions from './AppActions';

import CaseNotesForm from '../casenotes/CaseNotesForm';
import ContactSupportButton from '../../components/buttons/ContactSupportButton';
import EditPersonInfoForm from '../profile/person/EditPersonInfoForm';
import EditReleaseInfoForm from '../profile/programhistory/EditReleaseInfoForm';
import EditSupervisionForm from '../profile/supervision/EditSupervisionForm';
import IntakeForm from '../intake/IntakeForm';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import ParticipantFollowUps from '../profile/tasks/ParticipantFollowUps';
import ParticipantProfile from '../profile/ParticipantProfile';
import ParticipantsSearch from '../participants/ParticipantsSearch';
import Providers from '../providers/Providers';
import Reports from '../reports/Reports';
import SearchReleases from '../releases/SearchReleases';
import TaskManager from '../tasks/TaskManager';
import * as Routes from '../../core/router/Routes';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsFailure, requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { APP, SHARED } from '../../utils/constants/ReduxStateConstants';

declare var gtag :?Function;

const { INITIALIZE_APPLICATION, switchOrganization } = AppActions;
const { ORGS, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
    logout :() => void;
    switchOrganization :RequestSequence;
  };
  organizations :Map;
  requestStates :{
    INITIALIZE_APPLICATION :RequestState;
  };
  selectedOrgId :UUID;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.initializeApplication();
  }

  logout = () => {

    const { actions } = this.props;
    actions.logout();

    if (_isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  switchOrganization = (organization :Object) => {
    const { actions, selectedOrgId } = this.props;
    if (organization.value !== selectedOrgId) {
      actions.switchOrganization({
        orgId: organization.value,
        title: organization.label
      });
    }
  }

  renderAppContent = () => {

    const { requestStates } = this.props;

    if (requestIsSuccess(requestStates[INITIALIZE_APPLICATION])) {
      return (
        <Switch>
          <Route path={Routes.EDIT_SUPERVISION} component={EditSupervisionForm} />
          <Route path={Routes.EDIT_RELEASE_INFO} component={EditReleaseInfoForm} />
          <Route path={Routes.CASE_NOTES_FORM} component={CaseNotesForm} />
          <Route path={Routes.PARTICIPANT_TASK_MANAGER} component={ParticipantFollowUps} />
          <Route path={Routes.EDIT_PARTICIPANT} component={EditPersonInfoForm} />
          <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfile} />
          <Route path={Routes.NEW_INTAKE_FORM} component={IntakeForm} />
          <Route path={Routes.NEW_INTAKE} component={SearchReleases} />
          <Route path={Routes.PARTICIPANTS} component={ParticipantsSearch} />
          <Route path={Routes.PROVIDERS} component={Providers} />
          <Route path={Routes.REPORTS} component={Reports} />
          <Route path={Routes.TASKS} component={TaskManager} />
          <Redirect to={Routes.PARTICIPANTS} />
        </Switch>
      );
    }

    if (requestIsFailure(requestStates[INITIALIZE_APPLICATION])) {
      return (
        <AppContentWrapper>
          <Error>
            Sorry, something went wrong. Please try refreshing the page, or contact support.
          </Error>
        </AppContentWrapper>
      );
    }

    return (
      <Spinner size="2x" />
    );
  }

  render() {

    const { organizations, requestStates, selectedOrgId } = this.props;

    const userInfo = AuthUtils.getUserInfo() || {};
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    return (
      <ThemeProvider theme={lightTheme}>
        <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
          <StylesProvider injectFirst>
            <AppContainerWrapper>
              <AppHeaderWrapper
                  appIcon={OpenLatticeIcon}
                  appTitle="Re-entry Case Management"
                  logout={this.logout}
                  organizationsSelect={{
                    isLoading: requestIsPending(requestStates[INITIALIZE_APPLICATION]),
                    onChange: this.switchOrganization,
                    organizations,
                    selectedOrganizationId: selectedOrgId
                  }}
                  user={user}>
                <AppNavigationWrapper>
                  <NavLink to={Routes.ROOT} />
                  <NavLink to={Routes.PARTICIPANTS}>Participants</NavLink>
                  <NavLink to={Routes.NEW_INTAKE}>Releases & Intake</NavLink>
                  <NavLink to={Routes.REPORTS}>Reports</NavLink>
                  <NavLink to={Routes.PROVIDERS}>Providers</NavLink>
                  <NavLink to={Routes.TASKS}>Tasks</NavLink>
                </AppNavigationWrapper>
              </AppHeaderWrapper>
              <AppContentWrapper>
                { this.renderAppContent() }
              </AppContentWrapper>
              <ContactSupportButton />
            </AppContainerWrapper>
          </StylesProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  [ORGS]: state.getIn([APP.APP, ORGS]),
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn([APP.APP, ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE]),
  },
  [SELECTED_ORG_ID]: state.getIn([APP.APP, SELECTED_ORG_ID]),
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout: AuthActions.logout,
    switchOrganization,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
