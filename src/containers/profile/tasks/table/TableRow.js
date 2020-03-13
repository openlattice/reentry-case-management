// @flow
import React from 'react';
import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { StyledTableRow } from './FollowUpsTableStyles';

const { NEUTRALS } = Colors;

const cellPadding = css`
  padding: 20px 0;
`;

const TaskName = styled.td`
  margin-right: 10px;
  font-size: 14px;
  ${cellPadding}
  padding-left: 30px;
`;

const TaskDescriptionPreview = styled.td`
  color: ${NEUTRALS[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 70%;
  ${cellPadding}
`;

const DueBy = styled.td`
  text-align: right;
  ${cellPadding}
  padding-right: 30px;
`;

type Props = {
  actions:{
  };
  className ?:string;
  data :Object;
};

const TableRow = ({ className, data } :Props) => {
  const {
    dueDate,
    taskName,
    taskDescription
  } = data;
  return (
    <StyledTableRow className={className}>
      <TaskName>{ taskName }</TaskName>
      <TaskDescriptionPreview>{ taskDescription }</TaskDescriptionPreview>
      <DueBy>{ dueDate }</DueBy>
    </StyledTableRow>
  );
};

TableRow.defaultProps = {
  className: undefined
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(TableRow);
