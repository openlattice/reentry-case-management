// @flow
import React, { Component } from 'react';
import {
  Card,
  CardSegment,
  Input,
  Label
} from 'lattice-ui-kit';

import { ButtonWrapper, FieldsGrid, StyledSearchButton } from '../../components/search/SearchStyledComponents';

type Props = {};

type State = {
  firstName :string;
  lastName :string;
  page :number;
};

class ParticipantsSearch extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      page: 0,
    };
  }

  onInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <Card>
        <CardSegment padding="30px" vertical>
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
              <StyledSearchButton onClick={() => {}}>Search</StyledSearchButton>
            </ButtonWrapper>
          </FieldsGrid>
        </CardSegment>
      </Card>
    );
  }
}

export default ParticipantsSearch;
