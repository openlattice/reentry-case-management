// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  CardStack,
  DatePicker,
  Input,
  Label,
  PaginationToolbar,
  SearchResults,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import NoResults from '../../components/noresults/NoResults';

import {
  ButtonWrapper,
  FieldsGrid,
  PaginationWrapper,
  StyledSearchButton,
} from '../../components/search/SearchStyledComponents';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsFailure, requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { aggregateResultsData } from './utils/ParticipantsUtils';
import { SEARCH_PARTICIPANTS, searchParticipants } from './ParticipantsActions';
import { PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';

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
  jail: 'Jail',
  enrollmentDate: 'Enrollment Date',
});

const SearchGrid = styled(FieldsGrid)`
  margin-top: 20px;
  grid-template-columns: repeat(4, 1fr);
`;

type Props = {
  actions :{
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
    const { actions } = this.props;
    actions.searchParticipants({
      dob: '',
      firstName: '',
      lastName: '',
      maxHits: MAX_HITS,
      start,
    });
    this.setPage(newPage);
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
          <CardSegment padding="30px" vertical>
            <div>Search Participants</div>
            <SearchGrid>
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
            </SearchGrid>
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
    searchParticipants,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearch);
