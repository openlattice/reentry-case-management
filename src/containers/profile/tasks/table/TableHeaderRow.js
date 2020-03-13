// @flow
import React from 'react';

import { StyledTableRow } from './FollowUpsTableStyles';

type Props = {
  components :Object;
  className ? :string;
  headers :Object[];
  sticky ? :boolean;
};

const TableHeader = ({
  components,
  className,
  headers,
  sticky
} :Props) => (
  <thead className={className}>
    <StyledTableRow sticky={sticky}>
      {
        headers.map((header :Object) => (
          <components.HeadCell
              key={header.key}
              width={header.key} />
        ))
      }
    </StyledTableRow>
  </thead>
);

export default TableHeader;

TableHeader.defaultProps = {
  className: undefined,
  sticky: true,
};
