// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardHeader,
  CardSegment,
  IconButton,
  Spinner,
} from 'lattice-ui-kit';
import {
  VerticalBarSeries,
  XYPlot,
  XAxis,
  YAxis,
} from 'react-vis';
import { faChevronLeft, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import COLORS from '../../core/style/Colors';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { GET_INTAKES_PER_YEAR, getIntakesPerYear } from './ReportsActions';
import { REPORTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;

const TableHeader = styled(CardHeader)`
  border: none;
  color: ${COLORS.GRAY_01};
  font-size: 20px;
  font-weight: 600;
`;

const YearRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const Year = styled.div`
  font-size: 12px;
  margin: 0 10px;
`;

type Props = {
  actions :{
    getIntakesPerYear :RequestSequence;
  };
  numberOfIntakesPerMonth :List;
  requestStates :{
    GET_INTAKES_PER_YEAR :RequestState;
  };
};

const IntakesBarChart = ({ actions, numberOfIntakesPerMonth, requestStates } :Props) => {
  const now :DateTime = DateTime.local();
  const [selectedYear, selectYear] = useState(now.year);
  const getIntakesForPreviousYear = () => {
    const previousYearDateObj :DateTime = DateTime.local(selectedYear - 1);
    actions.getIntakesPerYear({ dateTimeObj: previousYearDateObj });
    selectYear(selectedYear - 1);
  };
  const getIntakesForNextYear = () => {
    const nextYearDateObj :DateTime = DateTime.local(selectedYear + 1);
    actions.getIntakesPerYear({ dateTimeObj: nextYearDateObj });
    selectYear(selectedYear + 1);
  };
  const retrievingIntakes :boolean = requestIsPending(requestStates[GET_INTAKES_PER_YEAR]);
  return (
    <Card>
      <TableHeader>Number of Intakes per Month</TableHeader>
      <CardSegment padding="30px" vertical>
        <YearRow>
          <IconButton
              icon={<FontAwesomeIcon icon={faChevronLeft} color={COLORS.BLUE_01} />}
              mode="subtle"
              onClick={getIntakesForPreviousYear}
              size="sm" />
          <Year>{ selectedYear }</Year>
          <IconButton
              icon={<FontAwesomeIcon icon={faChevronRight} color={COLORS.BLUE_01} />}
              mode="subtle"
              onClick={getIntakesForNextYear}
              size="sm" />
        </YearRow>
        {
          retrievingIntakes
            ? (
              <Spinner size="2x" />
            )
            : (
              <XYPlot
                  xType="ordinal"
                  height={190}
                  margin={{
                    left: 90,
                    right: 10,
                    top: 10,
                    bottom: 40
                  }}
                  style={{ fontFamily: 'Inter', fontSize: '11px' }}
                  width={854}>
                <XAxis />
                <YAxis />
                <VerticalBarSeries barWidth={0.55} color={COLORS.BLUE_01} data={numberOfIntakesPerMonth.toJS()} />
              </XYPlot>
            )
        }
      </CardSegment>
    </Card>
  );
};

const mapStateToProps = (state :Map) => {
  const reports :Map = state.get(REPORTS.REPORTS);
  return {
    requestStates: {
      [GET_INTAKES_PER_YEAR]: reports.getIn([ACTIONS, GET_INTAKES_PER_YEAR, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getIntakesPerYear,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(IntakesBarChart);
