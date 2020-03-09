// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Colors,
  Table
} from 'lattice-ui-kit';
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
const { SERVICES_TABLE_DATA } = REPORTS;

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

type Props = {
  actions :{
    getReportsData :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  requestStates :{
    GET_REPORTS_DATA :RequestState;
  };
  servicesTableData :Object[];
};

const Reports = ({
  actions,
  entitySetIdsByFqn,
  requestStates,
  servicesTableData
} :Props) => {
  const [downloadModalVisible, setModalVisibility] = useState(false);
  useEffect(() => {
    if (!entitySetIdsByFqn.isEmpty()) actions.getReportsData();
  }, [actions, entitySetIdsByFqn]);
  const tableHeaders :Object[] = generateTableHeaders(TABLE_HEADERS);
  const tableIsLoading :boolean = requestIsPending(requestStates[GET_REPORTS_DATA]);
  return (
    <>
      <HeaderRow>
        <Header>Reports</Header>
        <Button mode="primary" onClick={() => setModalVisibility(true)}>Download</Button>
      </HeaderRow>
      <StatsWrapper>
        <StatBox>
          <Number>96</Number>
          <Category>New Intakes This Week</Category>
        </StatBox>
        <StatBox>
          <Number>173</Number>
          <Category>People Released This Week</Category>
        </StatBox>
      </StatsWrapper>
      <TableCard>
        <TableHeader>Most Utilized Services</TableHeader>
        <CardSegment padding="0">
          <Table
              data={servicesTableData}
              headers={tableHeaders}
              isLoading={tableIsLoading} />
        </CardSegment>
      </TableCard>
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
