// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  DatePicker,
  Input,
  PaginationToolbar,
  SearchResults,
} from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as Routes from '../../core/router/Routes';
import COLORS from '../../core/style/Colors';

import { goToRoute } from '../../core/router/RoutingActions';
import { RELEASES } from '../../utils/constants/ReduxStateConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { JAILS_BY_JAIL_STAY_EKID } = RELEASES;

const labels = Map({
  name: 'Name',
  releaseDate: 'Release date',
  releasedFrom: 'Released from',
});

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const HeaderRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
  width: 100%;
`;

const Header = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const StyledButton = styled(Button)`
  font-size: 14px;
  padding: 8px 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 20px;
  width: 100%;
`;

const Label = styled.div`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 10px;
`;

type Props = {
  actions:{
    goToRoute :GoToRoute;
  };
  jailsByJailStayEKID :Map;
};

class Releases extends Component<Props> {

  goToNewIntakeForm = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.NEW_INTAKE);
  }

  render() {
    return (
      <ContainerWrapper>
        <HeaderRowWrapper>
          <Header>New Releases</Header>
          <StyledButton
              onClick={this.goToNewIntakeForm}
              mode="primary">
            New Intake
          </StyledButton>
        </HeaderRowWrapper>
        <Card>
          <CardSegment padding="30px" vertical>
            <Grid>
              <div>
                <Label>Last name</Label>
                <Input />
              </div>
              <div>
                <Label>First name</Label>
                <Input />
              </div>
              <div>
                <Label>Start date</Label>
                <DatePicker />
              </div>
              <div>
                <Label>End date</Label>
                <DatePicker />
              </div>
            </Grid>
            <Button>Search People</Button>
          </CardSegment>
        </Card>
        <SearchResults
            hasSearched={false}
            isLoading={false}
            noResults=""
            resultLabels={labels}
            results={List()} />
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const releases = state.get(RELEASES.RELEASES);
  return {
    [JAILS_BY_JAIL_STAY_EKID]: releases.get(JAILS_BY_JAIL_STAY_EKID),
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Releases);
