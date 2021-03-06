/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Banner,
  Button,
  Card,
  CardSegment,
} from 'lattice-ui-kit';
import {
  DataUtils,
  RoutingUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { Match } from 'react-router';

import {
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  clearSubmitRequestState,
  getMeetingAndTask,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';
import { schema, uiSchema } from './schemas/CaseNotesSchemas';
import { hydrateCaseNotesForm, preprocessCaseNotesFormData } from './utils/CaseNotesFormUtils';

import * as Routes from '../../core/router/Routes';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import {
  APP,
  CASE_NOTES,
  EDM,
  SHARED,
} from '../../utils/constants/ReduxStateConstants';
import { getProviders } from '../providers/ProvidersActions';

const { getEntityKeyId } = DataUtils;
const {
  findEntityAddressKeyFromMap,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { getParamFromMatch } = RoutingUtils;
const {
  FOLLOW_UPS,
  MEETINGS,
  RECORDED_BY,
  REENTRY_STAFF,
} = APP_TYPE_FQNS;
const { ACTIONS } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID, STAFF_MEMBERS } = APP;
const { MEETING, TASK } = CASE_NOTES;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;

const ButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const BannerContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const BannerButtonWrapper = styled.div`
  margin-left: 40px;
`;

type Props = {
  history :Object;
  match :Match;
};

const CaseNotesForm = ({ history, match } :Props) => {

  const [formData, updateFormData] = useState({});
  const personEKID = getParamFromMatch(match, Routes.PARTICIPANT_ID) || '';
  const meetingEKID = getParamFromMatch(match, Routes.MEETING_ID);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProviders());
    dispatch(getMeetingAndTask(meetingEKID));
  }, [dispatch, meetingEKID]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const reentryStaffMembers :List = useSelector((store :Map) => store.getIn([
    APP.APP,
    STAFF_MEMBERS
  ]));
  const meeting :Map = useSelector((store :Map) => store.getIn([
    CASE_NOTES.CASE_NOTES,
    MEETING
  ]));
  const task :Map = useSelector((store :Map) => store.getIn([
    CASE_NOTES.CASE_NOTES,
    TASK
  ]));
  const selectedOrgId = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn(
    [APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId],
    Map()
  ));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(
    [EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES],
    Map()
  ));
  const reentryStaffESID :UUID = useSelector((store :Map) => store.getIn([
    APP.APP,
    APP.ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId,
    REENTRY_STAFF
  ]));
  const recordedByESID :UUID = useSelector((store :Map) => store.getIn([
    APP.APP,
    APP.ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId,
    RECORDED_BY
  ]));
  const meetingESID :UUID = useSelector((store :Map) => store.getIn([
    APP.APP,
    APP.ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId,
    MEETINGS
  ]));
  const submitRequestState = useRequestState([
    CASE_NOTES.CASE_NOTES,
    ACTIONS,
    SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  ]) || RequestStates.STANDBY;

  const taskEKID = getEntityKeyId(task);
  const entityIndexToIdMap :Map = Map()
    .set(MEETINGS, [meetingEKID])
    .set(FOLLOW_UPS, [taskEKID]);

  useEffect(() => {
    if (requestIsSuccess(submitRequestState)) {
      window.scrollTo(0, 0);
    }
  }, [submitRequestState]);

  const clearReqState = useCallback(() => {
    dispatch(clearSubmitRequestState());
  }, [dispatch]);

  useEffect(() => clearReqState, [clearReqState]);

  const onSubmit = () => {
    const { meetingData, staffMemberEKID, taskData } = preprocessCaseNotesFormData(formData);
    const meetingDraftWithKeys :Object = replaceEntityAddressKeys(
      meetingData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const meetingEntityData = processEntityDataForPartialReplace(
      meetingDraftWithKeys,
      replaceEntityAddressKeys({}, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );
    const taskDraftWithKeys :Object = replaceEntityAddressKeys(
      taskData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const taskEntityData = processEntityDataForPartialReplace(
      taskDraftWithKeys,
      replaceEntityAddressKeys({}, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );

    const associations = {
      [recordedByESID]: [
        {
          data: {},
          src: {
            entitySetId: meetingESID,
            entityKeyId: getEntityKeyId(meeting)
          },
          dst: {
            entitySetId: reentryStaffESID,
            entityKeyId: staffMemberEKID
          }
        }
      ]
    };
    dispatch(submitCaseNotesAndCompleteTask({ associations, meetingEntityData, taskEntityData }));
  };

  const goToParticipantTasks = useGoToRoute(
    Routes.PARTICIPANT_TASK_MANAGER.replace(':participantId', personEKID)
  );

  const hydratedSchema = hydrateCaseNotesForm(schema, reentryStaffMembers);
  return (
    <>
      <Banner
          isOpen={requestIsSuccess(submitRequestState)}
          maxHeight="100px"
          mode="success">
        <BannerContent>
          <div>Notes submission was successful!</div>
          <BannerButtonWrapper>
            <Button onClick={goToParticipantTasks}>Go To Participant Tasks</Button>
          </BannerButtonWrapper>
        </BannerContent>
      </Banner>
      <Card>
        <CardSegment>
          <Form
              formData={formData}
              hideSubmit
              onChange={onChange}
              onSubmit={onSubmit}
              schema={hydratedSchema}
              uiSchema={uiSchema} />
          <ButtonWrapper>
            <Button onClick={() => history.goBack()}>Discard</Button>
            <Button
                color="primary"
                isLoading={requestIsPending(submitRequestState)}
                onClick={onSubmit}>
              Submit Notes and Complete Task
            </Button>
          </ButtonWrapper>
        </CardSegment>
      </Card>
    </>
  );
};

export default CaseNotesForm;
