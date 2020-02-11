// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Badge,
  Card,
  CardSegment,
  DatePicker,
  Input,
  Label,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { ButtonWrapper, FieldsGrid, StyledSearchButton } from '../../components/search/SearchStyledComponents';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { SEARCH_PARTICIPANTS, searchParticipants } from './ParticipantsActions';
import { PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';
import { COLORS } from '../../core/style/Colors';

const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const { SEARCHED_PARTICIPANTS } = PARTICIPANTS;
const MAX_HITS :number = 20;

const SearchGrid = styled(FieldsGrid)`
  margin-top: 20px;
  grid-template-columns: repeat(4, 1fr);
`;

const TableCard = styled(Card)`
  & > ${CardSegment} {
    border: none;
  }
`;

const TableHeader = styled(CardSegment)`
  align-items: center;
  color: ${COLORS.GRAY_01};
  font-size: 24px;
  font-weight: 600;
`;

type Props = {
  actions :{
    searchParticipants :RequestSequence;
  };
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
    this.searchPeople(undefined, start);
    this.setPage(newPage);
  }

  render() {
    const { requestStates, totalHits } = this.props;
    const isSearching :boolean = requestIsPending(requestStates[SEARCH_PARTICIPANTS]);
    const searchWasSuccessful :boolean = requestIsSuccess(requestStates[SEARCH_PARTICIPANTS]);
    return (
      <>
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
                <StyledSearchButton onClick={() => {}}>Search</StyledSearchButton>
              </ButtonWrapper>
            </SearchGrid>
          </CardSegment>
        </Card>
        {
          (isSearching || searchWasSuccessful) && (
            <TableCard>
              <TableHeader padding="50px 50px 40px 50px">
                <div>All Participants</div>
                <Badge mode="primary" count={totalHits} />
              </TableHeader>
              <Table
                  isLoading={isSearching}
                  onPageChange={this.onPageChange}
                  paginated
                  totalRows={MAX_HITS} />
            </TableCard>
          )
        }
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const participants = state.get(PARTICIPANTS.PARTICIPANTS);
  return {
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
