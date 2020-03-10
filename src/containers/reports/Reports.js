// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  Skeleton,
  Table
} from 'lattice-ui-kit';
import {
  VerticalBarSeries,
  XYPlot,
  XAxis,
  YAxis,
} from 'react-vis';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DownloadPeopleModal from './DownloadPeopleModal';
import COLORS from '../../core/style/Colors';
import { generateTableHeaders } from '../../utils/Utils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { GET_REPORTS_DATA, getReportsData } from './ReportsActions';
import { TABLE_HEADERS } from './ReportsConstants';
import { APP, REPORTS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS, WHITE } = Colors;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { NUMBER_OF_INTAKES_THIS_MONTH, NUMBER_OF_RELEASES_THIS_WEEK, SERVICES_TABLE_DATA } = REPORTS;

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const Header = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const StatsWrapper = styled.div`
  display: flex;
`;

const StatBox = styled.div`
  align-items: center;
  background-color: ${WHITE};
  border-radius: 5px;
  border: 1px solid ${COLORS.GRAY_03};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 20px 20px 0;
  padding: 17px 0;
  width: 225px;

  :last-of-type {
    margin-right: 0;
  }
`;

const Number = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 24px;
`;

const Category = styled.div`
  color: ${NEUTRALS[1]};
  font-size: 14px;
  font-weight: 600;
`;

const TableCard = styled(Card)`
  & > ${CardSegment} {
    border: none;
  }
`;

const TableHeader = styled(CardHeader)`
  border: none;
  color: ${COLORS.GRAY_01};
  font-size: 20px;
  font-weight: 600;
`;

const StatsBoxSkeleton = () => (
  <>
    <Skeleton height={36} width="20%" />
    <Skeleton height={24} width="80%" />
  </>
);

type Props = {
  actions :{
    getReportsData :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  numberOfIntakesThisMonth :number;
  numberOfReleasesThisWeek :number;
  requestStates :{
    GET_REPORTS_DATA :RequestState;
  };
  servicesTableData :Object[];
};

const Reports = ({
  actions,
  entitySetIdsByFqn,
  numberOfIntakesThisMonth,
  numberOfReleasesThisWeek,
  requestStates,
  servicesTableData
} :Props) => {
  const [downloadModalVisible, setModalVisibility] = useState(false);
  useEffect(() => {
    if (!entitySetIdsByFqn.isEmpty()) actions.getReportsData();
  }, [actions, entitySetIdsByFqn]);
  const tableHeaders :Object[] = generateTableHeaders(TABLE_HEADERS);
  const tableIsLoading :boolean = requestIsPending(requestStates[GET_REPORTS_DATA]);
  const data = [
    { y: 100, x: 'Jan' },
    { y: 112, x: 'Feb' },
    { y: 230, x: 'Mar' },
    { y: 268, x: 'Apr' },
    { y: 300, x: 'May' },
    { y: 310, x: 'Jun' },
    { y: 315, x: 'July' },
    { y: 340, x: 'Aug' },
    { y: 388, x: 'Sept' },
    { y: 100, x: 'Oct' },
    { y: 142, x: 'Nov' },
    { y: 147, x: 'Dec' }
  ];
  return (
    <>
      <HeaderRow>
        <Header>Reports</Header>
        <Button mode="primary" onClick={() => setModalVisibility(true)}>Download</Button>
      </HeaderRow>
      <StatsWrapper>
        <StatBox>
          {
            tableIsLoading
              ? (
                <StatsBoxSkeleton />
              )
              : (
                <>
                  <Number>{ numberOfIntakesThisMonth }</Number>
                  <Category>New Intakes This Month</Category>
                </>
              )
          }
        </StatBox>
        <StatBox>
          {
            tableIsLoading
              ? (
                <StatsBoxSkeleton />
              )
              : (
                <>
                  <Number>{ numberOfReleasesThisWeek }</Number>
                  <Category>People Released This Week</Category>
                </>
              )
          }
        </StatBox>
      </StatsWrapper>
      <CardStack>
        <Card>
          <TableHeader>Number of Intakes per Month</TableHeader>
          <CardSegment padding="30px" vertical>
            <XYPlot
                xType="ordinal"
                height={190}
                margin={{
                  left: 100,
                  right: 10,
                  top: 10,
                  bottom: 40
                }}
                style={{ fontFamily: 'Inter', fontSize: '11px' }}
                width={854}>
              <XAxis />
              <YAxis />
              <VerticalBarSeries barWidth={0.55} color={COLORS.BLUE_01} data={data} />
            </XYPlot>
          </CardSegment>
        </Card>
        <TableCard>
          <TableHeader>Most Utilized Services</TableHeader>
          <CardSegment padding="0">
            <Table
                data={servicesTableData}
                headers={tableHeaders}
                isLoading={tableIsLoading} />
          </CardSegment>
        </TableCard>
      </CardStack>
      <DownloadPeopleModal
          isVisible={downloadModalVisible}
          onClose={() => setModalVisibility(false)} />
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const reports :Map = state.get(REPORTS.REPORTS);
  const selectedOrgId :UUID = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [NUMBER_OF_INTAKES_THIS_MONTH]: reports.get(NUMBER_OF_INTAKES_THIS_MONTH),
    [NUMBER_OF_RELEASES_THIS_WEEK]: reports.get(NUMBER_OF_RELEASES_THIS_WEEK),
    [SERVICES_TABLE_DATA]: reports.get(SERVICES_TABLE_DATA),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    requestStates: {
      [GET_REPORTS_DATA]: reports.getIn([ACTIONS, GET_REPORTS_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getReportsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Reports);
