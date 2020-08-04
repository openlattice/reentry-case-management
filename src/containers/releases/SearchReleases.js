// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Breadcrumbs,
  Button,
  Card,
  CardSegment,
  CardStack,
  Colors,
  DatePicker,
  Input,
  PaginationToolbar,
  Radio,
  SearchResults,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  SEARCH_RELEASES_BY_DATE,
  SEARCH_RELEASES_BY_PERSON_NAME,
  clearSearchResults,
  searchReleasesByDate,
  searchReleasesByPersonName,
  selectReleaseResult,
} from './ReleasesActions';
import { formatDataForReleasesByDateList, formatDataForReleasesByPersonList } from './utils/ReleasesUtils';

import NoResults from '../../components/noresults/NoResults';
import * as Routes from '../../core/router/Routes';
import {
  ButtonWrapper,
  FieldsGrid,
  PaginationWrapper,
  StyledSearchButton,
} from '../../components/search/SearchStyledComponents';
import { goToRoute } from '../../core/router/RoutingActions';
import { isNonEmptyString } from '../../utils/LangUtils';
import {
  reduceRequestStates,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess,
} from '../../utils/RequestStateUtils';
import { RELEASES, SHARED } from '../../utils/constants/ReduxStateConstants';
import { CardHeaderWithButtons, Header } from '../profile/styled/GeneralProfileStyles';
import type { GoToRoute } from '../../core/router/RoutingActions';

const NoReleasesFound = () => (
  <Card>
    <NoResults text="No Releases Found" />
  </Card>
);

const { NEUTRAL } = Colors;
const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const {
  JAIL_STAYS_BY_PERSON_EKID,
  PEOPLE_BY_JAIL_STAY_EKID,
  SEARCHED_JAIL_STAYS,
  SEARCHED_PEOPLE,
} = RELEASES;

const labels = Map({
  name: 'Name',
  releaseDate: 'Release date',
  dataSource: 'Data source',
});

const MAX_HITS :number = 10;

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(2, 200px);
  margin-bottom: 40px;
`;

const Label = styled.div`
  color: ${NEUTRAL.N600};
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 10px;
`;

const CenteredCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

const SearchResultMessage = styled.div`
  margin-right: 5px;
`;

type Props = {
  actions:{
    clearSearchResults :() => { type :string };
    goToRoute :GoToRoute;
    searchReleasesByDate :RequestSequence;
    searchReleasesByPersonName :RequestSequence;
    selectReleaseResult :(person :Map) => { type :string };
  };
  jailStaysByPersonEKID :Map;
  peopleByJailStayEKID :Map;
  requestStates:{
    SEARCH_RELEASES_BY_DATE :RequestState;
    SEARCH_RELEASES_BY_PERSON_NAME :RequestState;
  };
  searchedJailStays :List;
  searchedPeople :List;
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

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
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

    if (isNonEmptyString(firstName) || isNonEmptyString(lastName)) {
      const start = startIndex || 0;
      actions.searchReleasesByPersonName({
        firstName,
        lastName,
        maxHits: MAX_HITS,
        start,
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

  onPageChangeReleases = ({ page: newPage, start } :Object) => {
    this.searchForPeopleByRelease(undefined, start);
    this.setPage(newPage);
  }

  onPageChangePersonName = ({ page: newPage, start } :Object) => {
    this.searchForPeopleByName(undefined, start);
    this.setPage(newPage);
  }

  goToNewIntakeForm = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.NEW_INTAKE_FORM);
  }

  selectRelease = (clickedResult :Map) => {
    const { actions } = this.props;
    const person :Map = clickedResult.get('personEntity');
    const releaseDate :string = clickedResult.get('releaseDateAsISODate');
    actions.selectReleaseResult({ person, releaseDate });
    this.goToNewIntakeForm();
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
      page: 0,
      searchingByDate: true,
      searchingByPerson: false,
    });
  }

  switchToPersonContext = () => {
    const { actions } = this.props;
    actions.clearSearchResults();
    this.setState({
      endDate: '',
      page: 0,
      searchingByDate: false,
      searchingByPerson: true,
      startDate: '',
    });
  }

  getReleasesData = () => {
    const {
      jailStaysByPersonEKID,
      peopleByJailStayEKID,
      searchedJailStays,
      searchedPeople,
    } = this.props;
    const { searchingByPerson, searchingByDate } = this.state;
    let releasesData :List = List();
    if (searchingByDate) {
      releasesData = formatDataForReleasesByDateList(searchedJailStays, peopleByJailStayEKID);
    }
    if (searchingByPerson) {
      releasesData = formatDataForReleasesByPersonList(searchedPeople, jailStaysByPersonEKID);
    }
    return releasesData;
  }

  render() {
    const { requestStates, totalHits } = this.props;
    const { page, searchingByPerson, searchingByDate } = this.state;

    const reducedState = reduceRequestStates([
      requestStates[SEARCH_RELEASES_BY_DATE],
      requestStates[SEARCH_RELEASES_BY_PERSON_NAME]
    ]);
    const isSearching :boolean = reducedState ? requestIsPending(reducedState) : false;
    const hasSearched :boolean = reducedState
      ? (requestIsSuccess(reducedState) || requestIsFailure(reducedState))
      : false;

    const onPageChange = searchingByDate
      ? this.onPageChangeReleases
      : this.onPageChangePersonName;

    const releasesData :List = this.getReleasesData();
    const searchResultMessage :string = 'Can\'t find what you\'re looking for?';
    return (
      <ContainerWrapper>
        <CardStack>
          <Card>
            <CardHeaderWithButtons vertical={false}>
              <div>Search Releases</div>
              <Button onClick={this.goToNewIntakeForm}>Create New Person</Button>
            </CardHeaderWithButtons>
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
                      <StyledSearchButton onClick={this.searchForPeopleByName}>Search</StyledSearchButton>
                    </ButtonWrapper>
                  </FieldsGrid>
                )
              }
            </CardSegment>
          </Card>
          {
            (hasSearched && !releasesData.isEmpty()) && (
              <PaginationWrapper>
                <PaginationToolbar
                    count={totalHits}
                    onPageChange={onPageChange}
                    page={page}
                    rowsPerPage={MAX_HITS} />
              </PaginationWrapper>
            )
          }
          <SearchResults
              hasSearched={hasSearched}
              isLoading={isSearching}
              noResults={NoReleasesFound}
              onResultClick={this.selectRelease}
              resultLabels={labels}
              results={releasesData} />
          {
            hasSearched && (
              <CenteredCardSegment vertical={false}>
                <SearchResultMessage>{ searchResultMessage }</SearchResultMessage>
                <Breadcrumbs>
                  <Header to={Routes.NEW_INTAKE_FORM}>CREATE NEW PERSON</Header>
                </Breadcrumbs>
              </CenteredCardSegment>
            )
          }
        </CardStack>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const releases = state.get(RELEASES.RELEASES);
  return {
    [JAIL_STAYS_BY_PERSON_EKID]: releases.get(JAIL_STAYS_BY_PERSON_EKID),
    [PEOPLE_BY_JAIL_STAY_EKID]: releases.get(PEOPLE_BY_JAIL_STAY_EKID),
    [SEARCHED_JAIL_STAYS]: releases.get(SEARCHED_JAIL_STAYS),
    [SEARCHED_PEOPLE]: releases.get(SEARCHED_PEOPLE),
    [TOTAL_HITS]: releases.get(TOTAL_HITS),
    requestStates: {
      [SEARCH_RELEASES_BY_DATE]: releases.getIn([ACTIONS, SEARCH_RELEASES_BY_DATE, REQUEST_STATE]),
      [SEARCH_RELEASES_BY_PERSON_NAME]: releases.getIn([ACTIONS, SEARCH_RELEASES_BY_PERSON_NAME, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    clearSearchResults,
    goToRoute,
    searchReleasesByDate,
    searchReleasesByPersonName,
    selectReleaseResult,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Releases);
