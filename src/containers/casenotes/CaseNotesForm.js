// @flow
import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { Card, CardSegment } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { getReentryStaff } from './CaseNotesActions';
import { schema, uiSchema } from './schemas/CaseNotesSchemas';
import { hydrateCaseNotesForm } from './utils/CaseNotesUtils';

import { CASE_NOTES, PARTICIPANT_FOLLOW_UPS } from '../../utils/constants/ReduxStateConstants';

const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;

const CaseNotesForm = () => {

  const reentryStaffMembers :List = useSelector((store :Map) => store.getIn([
    CASE_NOTES.CASE_NOTES,
    REENTRY_STAFF_MEMBERS
  ]));
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getReentryStaff());
  }, [dispatch]);

  const onSubmit = () => {};

  const hydratedSchema = hydrateCaseNotesForm(schema, reentryStaffMembers);
  return (
    <Card>
      <CardSegment>
        <Form
            onSubmit={onSubmit}
            schema={hydratedSchema}
            uiSchema={uiSchema} />
      </CardSegment>
    </Card>
  );
};

export default CaseNotesForm;
