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
  Radio,
  SearchResults,
} from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as Routes from '../../core/router/Routes';
import COLORS from '../../core/style/Colors';

import {
  SEARCH_RELEASES_BY_DATE,
  clearSearchResults,
  searchReleasesByDate
} from './ReleasesActions';
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

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const StyledSearchButton = styled(Button)`
  height: 40px;
  width: 100%;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
  width: 100%;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(2, 200px);
  margin-bottom: 40px;
`;

const Label = styled.div`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 10px;
`;

type Props = {
  actions:{
    clearSearchResults :() => { type :string };
    goToRoute :GoToRoute;
    searchReleasesByDate :RequestSequence;
  };
  jailsByJailStayEKID :Map;
  peopleByJailStayEKID :Map;
  requestStates:{
    SEARCH_RELEASES_BY_DATE :RequestState;
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
  searchingByPerson :boolean;
  searchingByDate :boolean;
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
      searchingByPerson: false,
      searchingByDate: true,
    };
  }

  searchForPeopleByRelease = (e :SyntheticEvent<HTMLInputElement> | void, startIndex :?number) => {
    const { actions } = this.props;
    const { endDate, startDate } = this.state;

    if (isNonEmptyString(startDate)) {
      const start = startIndex || 0;
      actions.searchReleasesByDate({
        endDate,
        start,
        maxHits: MAX_HITS,
        startDate,
      });
    }
  }

  searchForPeopleByName = (e :SyntheticEvent<HTMLInputElement> | void, startIndex :?number) => {
    const { actions } = this.props;
    const { firstName, lastName } = this.state;
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
    this.searchForPeopleByRelease(undefined, start);
    this.setPage(newPage);
  }

  goToNewIntakeForm = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.NEW_INTAKE);
  }

  onSwitchSearchContext = (e :SyntheticEvent<HTMLInputElement>) => {
    const { currentTarget } = e;
    const { name } = currentTarget;
    const { [name]: currentState } = this.state;
    this.setState({ [name]: !currentState });
  }

  switchToReleaseDateContext = () => {
    const { actions } = this.props;
    actions.clearSearchResults();
    this.setState({
      firstName: '',
      lastName: '',
      searchingByDate: true,
      searchingByPerson: false,
    });
  }

  switchToPersonContext = () => {
    const { actions } = this.props;
    actions.clearSearchResults();
    this.setState({
      endDate: '',
      searchingByDate: false,
      searchingByPerson: true,
      startDate: '',
    });
  }

  render() {
    const {
      jailsByJailStayEKID,
      peopleByJailStayEKID,
      requestStates,
      searchedJailStays,
      totalHits,
    } = this.props;
    const { page, searchingByPerson, searchingByDate } = this.state;

    const isSearching :boolean = requestIsPending(requestStates[SEARCH_RELEASES_BY_DATE]);
    const hasSearched :boolean = requestIsSuccess(requestStates[SEARCH_RELEASES_BY_DATE])
      || requestIsFailure(requestStates[SEARCH_RELEASES_BY_DATE]);

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
            <ButtonGrid>
              <Radio
                  checked={searchingByDate}
                  label="Search by Release Date"
                  mode="button"
                  onChange={this.switchToReleaseDateContext}
                  name="searchingByDate" />
              <Radio
                  checked={searchingByPerson}
                  label="Search by Person"
                  mode="button"
                  onChange={this.switchToPersonContext}
                  name="searchingByPerson" />
            </ButtonGrid>
            {
              searchingByDate && (
                <FieldsGrid>
                  <div>
                    <Label>Start date*</Label>
                    <DatePicker onChange={this.setStartDate} />
                  </div>
                  <div>
                    <Label>End date</Label>
                    <DatePicker onChange={this.setEndDate} />
                  </div>
                  <ButtonWrapper>
                    <StyledSearchButton onClick={this.searchForPeopleByRelease}>Search</StyledSearchButton>
                  </ButtonWrapper>
                </FieldsGrid>
              )
            }
            {
              searchingByPerson && (
                <FieldsGrid>
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
                  <ButtonWrapper>
                    <StyledSearchButton onClick={this.searchForPeopleByRelease}>Search</StyledSearchButton>
                  </ButtonWrapper>
                </FieldsGrid>
              )
            }
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
      [SEARCH_RELEASES_BY_DATE]: releases.getIn([ACTIONS, SEARCH_RELEASES_BY_DATE, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    clearSearchResults,
    goToRoute,
    searchReleasesByDate,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Releases);
