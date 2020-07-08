// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  Breadcrumbs,
  Card,
  CardSegment,
  CardStack,
  Spinner,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import EditPersonDetailsForm from './EditPersonDetailsForm';
import EditPersonForm from './EditPersonForm';
import EditStateIdForm from './EditStateIdForm';
import {
  educationSchema,
  educationUiSchema,
} from './schemas/EditPersonSchemas';

import * as Routes from '../../../core/router/Routes';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { PROFILE, SHARED } from '../../../utils/constants/ReduxStateConstants';
import { LOAD_PERSON_INFO_FOR_EDIT, loadPersonInfoForEdit } from '../ProfileActions';
import { CardInnerWrapper } from '../styled/EventStyles';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';

const {
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PERSON_FORM_DATA,
  PERSON_DETAILS_FORM_DATA,
} = PROFILE;
const { ACTIONS, REQUEST_STATE } = SHARED;

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
  const participantNeighbors :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PARTICIPANT_NEIGHBORS]));
  const participant :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PARTICIPANT]));
  const personFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PERSON_FORM_DATA]));
  const personDetailsFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PERSON_DETAILS_FORM_DATA]));
  const personName :string = getPersonFullName(participant);
  const loadPersonInfoReqState = useSelector((store) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    LOAD_PERSON_INFO_FOR_EDIT,
    REQUEST_STATE
  ]));

  if (requestIsPending(loadPersonInfoReqState)) {
    return <Spinner size="2x" />;
  }

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
            <EditPersonForm participant={participant} personFormData={personFormData} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <EditPersonDetailsForm
                participant={participant}
                participantNeighbors={participantNeighbors}
                personDetailsFormData={personDetailsFormData} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <EditStateIdForm participant={participant} participantNeighbors={participantNeighbors} />
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
