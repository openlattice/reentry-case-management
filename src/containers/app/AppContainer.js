/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  Sizes,
  Spinner,
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
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import IntakeForm from '../intake/IntakeForm';
import ParticipantsSearch from '../participants/ParticipantsSearch';
import ParticipantProfile from '../profile/ParticipantProfile';
import Releases from '../releases/Releases';

import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';

import { isNonEmptyString } from '../../utils/LangUtils';
import { APP, SHARED } from '../../utils/constants/ReduxStateConstants';

const { APP_CONTENT_WIDTH } = Sizes;
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

    // TODO: tracking
    // if (isFunction(gtag)) {
    //   gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    // }
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

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.SUCCESS) {
      return (
        <Switch>
          <Route exact strict path="/home" />
          <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfile} />
          <Route path={Routes.NEW_INTAKE} component={IntakeForm} />
          <Route path={Routes.RELEASES} component={Releases} />
          <Route path={Routes.PARTICIPANTS} component={ParticipantsSearch} />
          <Redirect to="/home" />
        </Switch>
      );
    }

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.FAILURE) {
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

    const { organizations, selectedOrgId } = this.props;

    const userInfo = AuthUtils.getUserInfo();
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    return (
      <AppContainerWrapper>
        <AppHeaderWrapper
            appIcon={OpenLatticeIcon}
            appTitle="Re-entry Case Management"
            logout={this.logout}
            organizationsSelect={{
              onChange: this.switchOrganization,
              organizations,
              selectedOrganizationId: selectedOrgId
            }}
            user={user}>
          <AppNavigationWrapper>
            <NavLink to={Routes.ROOT} />
            <NavLink to={Routes.RELEASES}>Releases</NavLink>
            <NavLink to={Routes.NEW_INTAKE}>New Intake</NavLink>
            <NavLink to={Routes.PARTICIPANTS}>Search</NavLink>
          </AppNavigationWrapper>
        </AppHeaderWrapper>
        <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
          { this.renderAppContent() }
        </AppContentWrapper>
      </AppContainerWrapper>
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
