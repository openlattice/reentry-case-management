// @flow
import React, { useEffect } from 'react';

import { Map } from 'immutable';
import {
  Breadcrumbs,
  CardSegment,
  CardStack,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, RoutingUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import EditOfficerForm from './EditOfficerForm';
import EditProbationParoleForm from './EditProbationParoleForm';

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

const { getParamFromMatch } = RoutingUtils;
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
                    Edit Supervision
                  </NameHeader>
                </Breadcrumbs>
              </CardSegment>
              <CardStack>
                <EditProbationParoleForm
                    participantEKID={participantEKID}
                    participantNeighbors={participantNeighbors} />
                <EditOfficerForm
                    participantEKID={participantEKID}
                    participantNeighbors={participantNeighbors}
                    supervisionNeighbors={supervisionNeighbors} />
              </CardStack>
            </>
          )
      }
    </>
  );
};

export default EditSupervisionForm;
