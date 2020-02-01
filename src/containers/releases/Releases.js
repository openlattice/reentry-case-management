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
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as Routes from '../../core/router/Routes';
import COLORS from '../../core/style/Colors';

import { SEARCH_RELEASES, searchReleases } from './ReleasesActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { formatDataForReleasesList } from './utils/ReleasesUtils';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsFailure, requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { RELEASES, SHARED } from '../../utils/constants/ReduxStateConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  JAILS_BY_JAIL_STAY_EKID,
  PEOPLE_BY_JAIL_STAY_EKID,
  SEARCHED_JAIL_STAYS,
  TOTAL_HITS,
} = RELEASES;

const labels = Map({
  name: 'Name',
  releaseDate: 'Release date',
  releasedFrom: 'Released from',
});

const MAX_HITS :number = 10;

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

const StyledPrimaryButton = styled(Button)`
  font-size: 14px;
  padding: 8px 32px;
`;

const StyledSearchButton = styled(Button)`
  align-self: flex-end;
  width: 210px;
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
    searchReleases :RequestSequence;
  };
  jailsByJailStayEKID :Map;
  peopleByJailStayEKID :Map;
  requestStates:{
    SEARCH_RELEASES :RequestState;
  };
  searchedJailStays :List;
  totalHits :number;
};

type State = {
  endDate :string;
  firstName :string;
  lastName :string;
  page :number;
  startDate :string;
};

class Releases extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      endDate: '',
      firstName: '',
      lastName: '',
      page: 0,
      startDate: '',
    };
  }

  searchForPeopleAndReleases = (e :SyntheticEvent<HTMLInputElement>, startIndex :?number) => {
    const { actions } = this.props;
    const {
      endDate,
      firstName,
      lastName,
      startDate,
    } = this.state;

    if (isNonEmptyString(startDate)) {
      const start = startIndex || 0;
      actions.searchReleases({
        endDate,
        firstName,
        lastName,
        start,
        maxHits: MAX_HITS,
        startDate,
      });
    }
  }

  onInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    this.setState({ [name]: value });
  }

  setStartDate = (date :string) => {
    this.setState({ startDate: date });
  }

  setEndDate = (date :string) => {
    this.setState({ endDate: date });
  }

  setPage = (page :number) => {
    this.setState({ page });
  }

  onPageChange = ({ page: newPage, start } :Object) => {
    this.searchForPeopleAndReleases(start);
    this.setPage(newPage);
  }

  goToNewIntakeForm = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.NEW_INTAKE);
  }

  render() {
    const {
      jailsByJailStayEKID,
      peopleByJailStayEKID,
      requestStates,
      searchedJailStays,
      totalHits,
    } = this.props;
    const { page } = this.state;

    const isSearching :boolean = requestIsPending(requestStates[SEARCH_RELEASES]);
    const hasSearched :boolean = requestIsSuccess(requestStates[SEARCH_RELEASES])
      || requestIsFailure(requestStates[SEARCH_RELEASES]);

    const releasesData :List = formatDataForReleasesList(searchedJailStays, peopleByJailStayEKID, jailsByJailStayEKID);
    return (
      <ContainerWrapper>
        <HeaderRowWrapper>
          <Header>New Releases</Header>
          <StyledPrimaryButton
              onClick={this.goToNewIntakeForm}
              mode="primary">
            New Intake
          </StyledPrimaryButton>
        </HeaderRowWrapper>
        <Card>
          <CardSegment padding="30px" vertical>
            <Grid>
              <div>
                <Label>Last name</Label>
                <Input
                    name="lastName"
                    onChange={this.onInputChange} />
              </div>
              <div>
                <Label>First name</Label>
                <Input
                    name="firstName"
                    onChange={this.onInputChange} />
              </div>
              <div>
                <Label>Start date*</Label>
                <DatePicker onChange={this.setStartDate} />
              </div>
              <div>
                <Label>End date</Label>
                <DatePicker onChange={this.setEndDate} />
              </div>
            </Grid>
            <StyledSearchButton
                type="submit"
                onClick={this.searchForPeopleAndReleases}>
              Search People
            </StyledSearchButton>
          </CardSegment>
        </Card>
        {
          hasSearched && (
            <PaginationToolbar
                count={totalHits}
                onPageChange={this.onPageChange}
                page={page}
                rowsPerPage={MAX_HITS} />
          )
        }
        <SearchResults
            hasSearched={hasSearched}
            isLoading={isSearching}
            noResults=""
            resultLabels={labels}
            results={releasesData} />
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const releases = state.get(RELEASES.RELEASES);
  return {
    [JAILS_BY_JAIL_STAY_EKID]: releases.get(JAILS_BY_JAIL_STAY_EKID),
    [PEOPLE_BY_JAIL_STAY_EKID]: releases.get(PEOPLE_BY_JAIL_STAY_EKID),
    [SEARCHED_JAIL_STAYS]: releases.get(SEARCHED_JAIL_STAYS),
    [TOTAL_HITS]: releases.get(TOTAL_HITS),
    requestStates: {
      [SEARCH_RELEASES]: releases.getIn([ACTIONS, SEARCH_RELEASES, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoute,
    searchReleases,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Releases);
