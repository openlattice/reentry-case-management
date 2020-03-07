// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Table } from 'lattice-ui-kit';

import DownloadPeopleModal from './DownloadPeopleModal';
import COLORS from '../../core/style/Colors';

const TABLE_HEADERS :string[] = [
  'NAME',
  'TYPE',
  'USE COUNT',
];

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

const Reports = () => {
  const [downloadModalVisible, setModalVisibility] = useState(false);
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

export default Reports;
