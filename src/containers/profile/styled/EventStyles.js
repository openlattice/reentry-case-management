// @flow
import styled from 'styled-components';

const CardInnerWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const EventDateWrapper = styled.div`
  margin-right: 61px;
`;

const EventWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 600;
  justify-content: space-between;
  line-height: 19px;
`;

const EventText = styled.div`
  font-weight: normal;
  margin-top: 10px;
`;

const EventStatusText = styled.div`
  text-transform: uppercase;
`;

export {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
};
