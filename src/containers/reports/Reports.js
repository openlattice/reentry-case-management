// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Table } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import DownloadPeopleModal from './DownloadPeopleModal';
import COLORS from '../../core/style/Colors';
import { getReportsData } from './ReportsActions';

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

type Props = {
  actions :{
    getReportsData :RequestSequence;
  };
};

const Reports = ({ actions } :Props) => {
  const [downloadModalVisible, setModalVisibility] = useState(false);
  useEffect(() => {
    actions.getReportsData();
  }, [actions]);
  return (
    <>
      <HeaderRow>
        <Header>Reports</Header>
        <Button mode="primary" onClick={() => setModalVisibility(true)}>Download</Button>
      </HeaderRow>
      <DownloadPeopleModal
          isVisible={downloadModalVisible}
          onClose={() => setModalVisibility(false)} />
    </>
  );
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getReportsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(Reports);
