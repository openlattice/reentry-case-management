// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Badge,
  Card,
  CardSegment,
  CardStack,
  DatePicker,
  Input,
  Label,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import NoResults from '../../components/noresults/NoResults';

import { ButtonWrapper, FieldsGrid, StyledSearchButton } from '../../components/search/SearchStyledComponents';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { generateTableHeaders } from '../../utils/Utils';
import { aggregateTableData } from './utils/ParticipantsUtils';
import { TABLE_HEADERS } from './constants';
import { SEARCH_PARTICIPANTS, searchParticipants } from './ParticipantsActions';
import { APP, PARTICIPANTS, SHARED } from '../../utils/constants/ReduxStateConstants';
import { COLORS } from '../../core/style/Colors';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE, TOTAL_HITS } = SHARED;
const { SEARCHED_PARTICIPANTS } = PARTICIPANTS;
const { PEOPLE } = APP_TYPE_FQNS;
const MAX_HITS :number = 5;
const participantsHeaders :Object[] = generateTableHeaders(TABLE_HEADERS);

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

const TableName = styled.div`
  margin-right: 10px;
`;

type Props = {
  actions :{
    searchParticipants :RequestSequence;
  };
  entitySetIdsByFqn :Map;
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
      // page: 0,
    };
  }

  componentDidMount() {
    const { actions, entitySetIdsByFqn } = this.props;
    if (entitySetIdsByFqn.has(PEOPLE)) {
      actions.searchParticipants({
        dob: '',
        firstName: '',
        lastName: '',
        maxHits: MAX_HITS,
        start: 0,
      });
    }
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

  // setPage = (page :number) => {
  //   this.setState({ page });
  // }

  onPageChange= (payload :Object) => {
    console.log('payload: ', payload);
    debugger;
    const { actions } = this.props;
    actions.searchParticipants({
      dob: '',
      firstName: '',
      lastName: '',
      maxHits: MAX_HITS,
      start: payload.start,
    });
    // this.setPage(newPage);
  }

  render() {
    const { searchedParticipants, requestStates, totalHits } = this.props;
    const isSearching :boolean = requestIsPending(requestStates[SEARCH_PARTICIPANTS]);
    const searchWasSuccessful :boolean = requestIsSuccess(requestStates[SEARCH_PARTICIPANTS]);
    const tableData :Object[] = aggregateTableData(searchedParticipants);
    console.log(tableData)
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
        <TableCard>
          {
            tableData.length ? (
              <>
                <TableHeader padding="50px 50px 40px 50px">
                  <TableName>All Participants</TableName>
                  <Badge mode="primary" count={totalHits} />
                </TableHeader>
                <Table
                    data={tableData}
                    exact
                    headers={participantsHeaders}
                    isLoading={isSearching}
                    onPageChange={this.onPageChange}
                    paginated
                    rowsPerPageOptions={[MAX_HITS, 10]}
                    totalRows={totalHits} />
              </>
            )
              : (
                <NoResults text="No Participants Found" />
              )
          }
        </TableCard>
      </CardStack>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(APP.APP);
  const participants = state.get(PARTICIPANTS.PARTICIPANTS);
  const selectedOrgId :UUID = app.get(SELECTED_ORG_ID, '');
  return {
    [SEARCHED_PARTICIPANTS]: participants.get(SEARCHED_PARTICIPANTS),
    [TOTAL_HITS]: participants.get(TOTAL_HITS),
    entitySetIdsByFqn: app.getIn([ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId]),
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
