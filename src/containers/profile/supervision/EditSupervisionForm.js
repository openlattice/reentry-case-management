// @flow
import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Breadcrumbs,
  Card,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, RoutingUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import { schema, uiSchema } from './schemas/EditSupervisionSchemas';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  EDIT_SUPERVISION,
  PARTICIPANTS,
  PARTICIPANT_ID,
  PARTICIPANT_PROFILE,
} from '../../../core/router/Routes';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { DST, SRC } from '../../../utils/constants/GeneralConstants';
import {
  APP,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import {
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  getParticipant,
  getParticipantNeighbors,
} from '../ProfileActions';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';
import { getOriginalFormData } from '../utils/SupervisionUtils';

const { getParamFromMatch } = RoutingUtils;
const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { reduceRequestStates } = ReduxUtils;
const { EMPLOYEE, EMPLOYMENT, PROBATION_PAROLE } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { ACTIONS } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS, SUPERVISION_NEIGHBORS } = PROFILE;

type Props = {
  match :Match;
};

const EditSupervisionForm = ({ match } :Props) => {

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    APP.APP,
    ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId
  ], Map()));
  const probationParoleESID :UUID = entitySetIds.get(PROBATION_PAROLE);
  const employmentESID :UUID = entitySetIds.get(EMPLOYMENT);
  const employeeESID :UUID = entitySetIds.get(EMPLOYEE);

  const participantEKID = getParamFromMatch(match, PARTICIPANT_ID) || '';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getParticipantNeighbors({
      neighborsToGet: [
        { direction: DST, neighborESID: probationParoleESID },
        { direction: DST, neighborESID: employmentESID }, // attorney
        { direction: SRC, neighborESID: employeeESID }, // probation/parole officer
      ],
      participantEKID
    }));
    dispatch(getParticipant({ participantEKID }));
  }, [dispatch, employeeESID, employmentESID, participantEKID, probationParoleESID]);

  const participantNeighbors = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT_NEIGHBORS
  ], Map()));
  const supervisionNeighbors = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    SUPERVISION_NEIGHBORS
  ], Map()));
  const participant :Map = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT
  ], Map()));
  const personName = getPersonFullName(participant);

  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const originalFormData = getOriginalFormData(participantNeighbors, supervisionNeighbors);
    updateFormData(originalFormData);
  }, [participantNeighbors, supervisionNeighbors]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const entityIndexToIdMap :Map = Map({
    [PROBATION_PAROLE]: List([jailStayEKID]),
  });

  const onSubmit = ({ formData: submittedFormData }) => {
    console.log('submittedFormData ', submittedFormData);
  };

  const getParticipantRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    GET_PARTICIPANT,
  ]);
  const getParticipantNeighborsRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    GET_PARTICIPANT_NEIGHBORS,
  ]);
  const reducedFetchState = reduceRequestStates([
    getParticipantNeighborsRequestState,
    getParticipantRequestState,
  ]);

  return (
    <>
      {
        requestIsPending(reducedFetchState)
          ? <Spinner size="2x" />
          : (
            <>
              <CardSegment padding="0 0 30px">
                <Breadcrumbs>
                  <Header to={PARTICIPANTS}>PARTICIPANTS</Header>
                  <NameHeader to={PARTICIPANT_PROFILE.replace(PARTICIPANT_ID, participantEKID)}>
                    { personName }
                  </NameHeader>
                  <NameHeader to={EDIT_SUPERVISION.replace(PARTICIPANT_ID, participantEKID)}>
                    Edit Release Information
                  </NameHeader>
                </Breadcrumbs>
              </CardSegment>
              <Card>
                <CardSegment padding="0">
                  <Form
                      formData={formData}
                      onChange={onChange}
                      onSubmit={onSubmit}
                      schema={schema}
                      uiSchema={uiSchema} />
                </CardSegment>
              </Card>
            </>
          )
      }
    </>
  );
};

export default EditSupervisionForm;
