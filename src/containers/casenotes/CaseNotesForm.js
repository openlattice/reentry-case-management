// @flow
import React from 'react';

import styled from 'styled-components';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { schema, uiSchema } from './schemas/CaseNotesSchemas';

const CaseNotesForm = () => {

  const onSubmit = () => {};

  return (
    <Card>
      <CardSegment>
        <Form
            onSubmit={onSubmit}
            schema={schema}
            uiSchema={uiSchema} />
      </CardSegment>
    </Card>
  );
};

export default CaseNotesForm;
