// @flow
import styled, { css } from 'styled-components';

import COLORS from '../../../core/style/Colors';

const CardInnerWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const EventDateWrapper = styled.div`
  margin-right: 61px;
`;

const eventTextStyles = css`
  color: ${COLORS.GRAY_01};
  font-size: 14px;
  font-weight: 600;
  line-height: 19px;
`;

const EventWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${eventTextStyles}
`;

const EventText = styled.div`
  ${eventTextStyles}
  font-weight: normal;
  margin-top: 10px;
`;

const EventStatusText = styled.div`
  ${eventTextStyles}
  text-transform: uppercase;
`;

export {
  CardInnerWrapper,
  EventDateWrapper,
  EventStatusText,
  EventText,
  EventWrapper,
};
