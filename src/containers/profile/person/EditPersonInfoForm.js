// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map, mergeDeep } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Breadcrumbs,
  Card,
  CardSegment,
  CardStack,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import EditPersonForm from './EditPersonForm';
import {
  educationSchema,
  educationUiSchema,
  idSchema,
  idUiSchema,
  personDetailsSchema,
  personDetailsUiSchema,
  personSchema,
  personUiSchema,
} from './schemas/EditPersonSchemas';

import * as Routes from '../../../core/router/Routes';
import { getEKID } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { loadPersonInfoForEdit } from '../ProfileActions';
import { CardInnerWrapper } from '../styled/EventStyles';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';

const { PARTICIPANT } = PROFILE;

const BreadcrumbsWrapper = styled(CardInnerWrapper)`
  margin-bottom: 20px;
`;

type Props = {
  match :Match;
};

const EditPersonInfoForm = ({ match } :Props) => {
  const { params } = match;
  const { participantId } = params;
  const [formData, updateFormData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadPersonInfoForEdit({ participantEKID: participantId }));
  }, [dispatch, participantId]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };
  const onSubmit = () => {};
  const participant :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PARTICIPANT]));
  const personName :string = getPersonFullName(participant);
  return (
    <>
      <BreadcrumbsWrapper>
        <Breadcrumbs>
          <Header to={Routes.PARTICIPANTS}>PARTICIPANTS</Header>
          <NameHeader to={Routes.PARTICIPANT_PROFILE.replace(':participantId', participantId || '')}>
            { personName }
          </NameHeader>
          <NameHeader to={Routes.EDIT_PARTICIPANT.replace(':participantId', participantId || '')}>
            Edit Person Profile
          </NameHeader>
        </Breadcrumbs>
      </BreadcrumbsWrapper>
      <CardStack>
        <Card>
          <CardSegment padding="0">
            <EditPersonForm participant={participant} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <Form
                formData={formData}
                onChange={onChange}
                onSubmit={onSubmit}
                schema={idSchema}
                uiSchema={idUiSchema} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <Form
                formData={formData}
                onChange={onChange}
                onSubmit={onSubmit}
                schema={personDetailsSchema}
                uiSchema={personDetailsUiSchema} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <Form
                formData={formData}
                onChange={onChange}
                onSubmit={onSubmit}
                schema={educationSchema}
                uiSchema={educationUiSchema} />
          </CardSegment>
        </Card>
      </CardStack>
    </>
  );
};

export default EditPersonInfoForm;
