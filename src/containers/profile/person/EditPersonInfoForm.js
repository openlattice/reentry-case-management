// @flow
import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Breadcrumbs,
  Card,
  CardSegment,
  CardStack,
  Spinner,
} from 'lattice-ui-kit';
import { RoutingUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';

import EditEducationForm from './EditEducationForm';
import EditPersonDetailsForm from './EditPersonDetailsForm';
import EditPersonForm from './EditPersonForm';
import EditStateIdForm from './EditStateIdForm';

import * as Routes from '../../../core/router/Routes';
import { getEKID } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { PROFILE, SHARED } from '../../../utils/constants/ReduxStateConstants';
import { LOAD_PERSON_INFO_FOR_EDIT, loadPersonInfoForEdit } from '../ProfileActions';
import { CardInnerWrapper } from '../styled/EventStyles';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';

const { getParamFromMatch } = RoutingUtils;
const {
  EDUCATION_FORM_DATA,
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PERSON_FORM_DATA,
  PERSON_DETAILS_FORM_DATA,
  STATE_ID_FORM_DATA,
} = PROFILE;
const { ACTIONS } = SHARED;

const BreadcrumbsWrapper = styled(CardInnerWrapper)`
  margin-bottom: 20px;
`;

type Props = {
  match :Match;
};

const EditPersonInfoForm = ({ match } :Props) => {
  const participantId = getParamFromMatch(match, Routes.PARTICIPANT_ID);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadPersonInfoForEdit({ participantEKID: participantId }));
  }, [dispatch, participantId]);

  const participantNeighbors :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PARTICIPANT_NEIGHBORS]));
  const participant :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PARTICIPANT]));
  const personFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PERSON_FORM_DATA]));
  const personDetailsFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, PERSON_DETAILS_FORM_DATA]));
  const stateIdFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, STATE_ID_FORM_DATA]));
  const educationFormData :Map = useSelector((store) => store.getIn([PROFILE.PROFILE, EDUCATION_FORM_DATA]));
  const personName :string = getPersonFullName(participant);
  const loadPersonInfoReqState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    LOAD_PERSON_INFO_FOR_EDIT,
  ]) || RequestStates.STANDBY;
  const personEKID :UUID = getEKID(participant);

  if (requestIsPending(loadPersonInfoReqState)) {
    return <Spinner size="2x" />;
  }

  return (
    <>
      <BreadcrumbsWrapper>
        <Breadcrumbs>
          <Header to={Routes.PARTICIPANTS}>PARTICIPANTS</Header>
          <NameHeader to={Routes.PARTICIPANT_PROFILE.replace(Routes.PARTICIPANT_ID, personEKID)}>
            { personName }
          </NameHeader>
          <NameHeader to={Routes.EDIT_PARTICIPANT.replace(Routes.PARTICIPANT_ID, personEKID)}>
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
            <EditStateIdForm
                participant={participant}
                participantNeighbors={participantNeighbors}
                stateIdFormData={stateIdFormData} />
          </CardSegment>
        </Card>
        <Card>
          <CardSegment padding="0">
            <EditEducationForm
                educationFormData={educationFormData}
                participant={participant}
                participantNeighbors={participantNeighbors} />
          </CardSegment>
        </Card>
      </CardStack>
    </>
  );
};

export default EditPersonInfoForm;
