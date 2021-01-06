/*
 * @flow
 */

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
import type { UUID } from 'lattice';
import type { Match } from 'react-router';

import EditFacilityForm from './EditFacilityForm';
import EditReferredFromForm from './EditReferredFromForm';
import EditReleaseDateForm from './EditReleaseDateForm';

import * as Routes from '../../../core/router/Routes';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { DST } from '../../../utils/constants/GeneralConstants';
import {
  APP,
  INTAKE,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { GET_INCARCERATION_FACILITIES, getIncarcerationFacilities } from '../../intake/IntakeActions';
import {
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  getParticipant,
  getParticipantNeighbors,
} from '../ProfileActions';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';

const { reduceRequestStates } = ReduxUtils;
const { getParamFromMatch } = RoutingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { ACTIONS } = SHARED;
const { PARTICIPANT } = PROFILE;

type Props = {
  match :Match;
};

const EditReleaseInfoForm = ({ match } :Props) => {

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    APP.APP,
    ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId
  ], Map()));

  const manualJailsPrisonsESID :UUID = entitySetIds.get(MANUAL_JAILS_PRISONS);
  const manualjailStaysESID :UUID = entitySetIds.get(MANUAL_JAIL_STAYS);
  const referralRequestESID :UUID = entitySetIds.get(REFERRAL_REQUEST);

  const participantEKID = getParamFromMatch(match, Routes.PARTICIPANT_ID) || '';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIncarcerationFacilities());
    dispatch(getParticipantNeighbors({
      neighborsToGet: [
        { direction: DST, neighborESID: manualJailsPrisonsESID },
        { direction: DST, neighborESID: manualjailStaysESID },
        { direction: DST, neighborESID: referralRequestESID },
      ],
      participantEKID
    }));
    dispatch(getParticipant({ participantEKID }));
  }, [dispatch, manualJailsPrisonsESID, manualjailStaysESID, participantEKID, referralRequestESID]);

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
  const getIncarcerationFacilitiesRequestState = useRequestState([
    INTAKE.INTAKE,
    ACTIONS,
    GET_INCARCERATION_FACILITIES,
  ]);
  const reducedFetchState = reduceRequestStates([
    getIncarcerationFacilitiesRequestState,
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
                  <Header to={Routes.PARTICIPANTS}>PARTICIPANTS</Header>
                  <NameHeader to={Routes.PARTICIPANT_PROFILE.replace(Routes.PARTICIPANT_ID, participantEKID)}>
                    { personName }
                  </NameHeader>
                  <NameHeader to={Routes.EDIT_RELEASE_INFO.replace(Routes.PARTICIPANT_ID, participantEKID)}>
                    Edit Release Information
                  </NameHeader>
                </Breadcrumbs>
              </CardSegment>
              <CardStack>
                <EditFacilityForm />
                <EditReleaseDateForm />
                <EditReferredFromForm />
              </CardStack>
            </>
          )
      }
    </>
  );
};

export default EditReleaseInfoForm;
