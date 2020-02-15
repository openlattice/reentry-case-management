// @flow
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

const FieldsGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
  width: 100%;
`;

const StyledSearchButton = styled(Button)`
  height: 40px;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const PaginationWrapper = styled.div`
  margin: 30px 0;
  width: 100%;
`;

export {
  ButtonWrapper,
  FieldsGrid,
  PaginationWrapper,
  StyledSearchButton,
};
