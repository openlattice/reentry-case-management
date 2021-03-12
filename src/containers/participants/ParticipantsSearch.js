/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  DatePicker,
  Input,
  Label,
  PaginationToolbar,
  SearchResults,
  Typography,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  SEARCH_PARTICIPANTS,
  clearSearchResults,
  searchParticipants
} from './ParticipantsActions';
import { aggregateResultsData } from './utils/ParticipantsUtils';

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
import { requestIsFailure, requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const { JAIL_NAMES_BY_JAIL_STAY_EKID, NEIGHBORS, SEARCHED_PARTICIPANTS } = PARTICIPANTS;
const MAX_HITS :number = 10;

const NoParticipantsFound = () => (
  <Card>
    <NoResults text="No Participants Found" />
  </Card>
);

const labels = Map({
  name: 'Name',
  dob: 'Date of Birth',
  facility: 'Facility',
  enrollmentDate: 'Enrollment Date',
});

type Props = {
  actions :{
    clearSearchResults :RequestSequence;
    goToRoute :GoToRoute;
    searchParticipants :RequestSequence;
  };
  jailNamesByJailStayEKID :Map;
  neighbors :Map;
  requestStates :{
    SEARCH_PARTICIPANTS :RequestState;
  };
  searchedParticipants :List;
  totalHits :number;
};

type State = {
  dob :string;
  firstName :string;
  lastName :string;
  page :number;
};

class ParticipantsSearch extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      dob: '',
      firstName: '',
      lastName: '',
      page: 0,
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  searchPeople = (e :SyntheticEvent<HTMLInputElement> | void, startIndex :?number) => {
    const { actions } = this.props;
    const { dob, firstName, lastName } = this.state;
    if (isNonEmptyString(dob) || isNonEmptyString(firstName) || isNonEmptyString(lastName)) {
      const start = startIndex || 0;
      actions.searchParticipants({
        dob,
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

  onDateChange = (date :string) => {
    this.setState({ dob: date });
  }

  setPage = (page :number) => {
    this.setState({ page });
  }

  onPageChange= ({ page: newPage, start } :Object) => {
    this.searchPeople(undefined, start);
    this.setPage(newPage);
  }

  goToParticipantProfile = (clickedPerson :Map) => {
    const { actions } = this.props;
    const ekid :UUID = clickedPerson.get('id');
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', ekid));
  }

  render() {
    const {
      jailNamesByJailStayEKID,
      neighbors,
      searchedParticipants,
      requestStates,
      totalHits
    } = this.props;
    const { page } = this.state;
    const isSearching :boolean = requestIsPending(requestStates[SEARCH_PARTICIPANTS]);
    const hasSearched :boolean = requestIsFailure(requestStates[SEARCH_PARTICIPANTS])
      || requestIsSuccess(requestStates[SEARCH_PARTICIPANTS]);
    const data :List = aggregateResultsData(searchedParticipants, neighbors, jailNamesByJailStayEKID);
    return (
      <CardStack>
        <Card>
          <CardHeader>
            <Typography variant="h2">Search Enrolled Participants</Typography>
          </CardHeader>
          <CardSegment padding="30px" vertical>
            <FieldsGrid columns={4}>
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
                <Label>Date of birth</Label>
                <DatePicker onChange={this.onDateChange} />
              </div>
              <ButtonWrapper>
                <StyledSearchButton onClick={this.searchPeople}>Search</StyledSearchButton>
              </ButtonWrapper>
            </FieldsGrid>
          </CardSegment>
        </Card>
        {
          (hasSearched && !data.isEmpty()) && (
            <PaginationWrapper>
              <PaginationToolbar
                  count={totalHits}
                  onPageChange={this.onPageChange}
                  page={page}
                  rowsPerPage={MAX_HITS} />
            </PaginationWrapper>
          )
        }
        <SearchResults
            hasSearched={hasSearched}
            isLoading={isSearching}
            noResults={NoParticipantsFound}
            onResultClick={this.goToParticipantProfile}
            resultLabels={labels}
            results={data} />
      </CardStack>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const participants = state.get(PARTICIPANTS.PARTICIPANTS);
  return {
    [JAIL_NAMES_BY_JAIL_STAY_EKID]: participants.get(JAIL_NAMES_BY_JAIL_STAY_EKID),
    [NEIGHBORS]: participants.get(NEIGHBORS),
    [SEARCHED_PARTICIPANTS]: participants.get(SEARCHED_PARTICIPANTS),
    [TOTAL_HITS]: participants.get(TOTAL_HITS),
    requestStates: {
      [SEARCH_PARTICIPANTS]: participants.getIn([ACTIONS, SEARCH_PARTICIPANTS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearSearchResults,
    goToRoute,
    searchParticipants,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearch);
