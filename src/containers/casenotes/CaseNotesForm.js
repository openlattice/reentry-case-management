// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Banner,
  Button,
  Card,
  CardSegment,
} from 'lattice-ui-kit';
import { RoutingUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';
import type { RequestState } from 'redux-reqseq';

import {
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  getMeetingAndTask,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';
import { schema, uiSchema } from './schemas/CaseNotesSchemas';
import { hydrateCaseNotesForm, preprocessCaseNotesFormData } from './utils/CaseNotesFormUtils';

import * as Routes from '../../core/router/Routes';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEKID } from '../../utils/DataUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import {
  APP,
  CASE_NOTES,
  EDM,
  PARTICIPANT_FOLLOW_UPS,
  SHARED,
} from '../../utils/constants/ReduxStateConstants';

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
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { MEETING, TASK } = CASE_NOTES;
const { REENTRY_STAFF_MEMBERS } = PARTICIPANT_FOLLOW_UPS;
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
  requestStates :{
    SUBMIT_CASE_NOTES_AND_COMPLETE_TASK :RequestState;
  };
};

const CaseNotesForm = ({ history, match } :Props) => {

  const [formData, updateFormData] = useState({});
  const personEKID = getParamFromMatch(match, Routes.PARTICIPANT_ID);
  const meetingEKID = getParamFromMatch(match, Routes.MEETING_ID);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getReentryStaff());
    dispatch(getMeetingAndTask(meetingEKID));
  }, [dispatch, meetingEKID]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const reentryStaffMembers :List = useSelector((store :Map) => store.getIn([
    CASE_NOTES.CASE_NOTES,
    REENTRY_STAFF_MEMBERS
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
  const submitRequestState :RequestState = useSelector((store :Map) => store.getIn([
    CASE_NOTES.CASE_NOTES,
    ACTIONS,
    SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
    REQUEST_STATE,
  ]));

  const taskEKID :UUID = getEKID(task);
  const entityIndexToIdMap :Map = Map()
    .set(MEETINGS, [meetingEKID])
    .set(FOLLOW_UPS, [taskEKID]);

  useEffect(() => {
    if (requestIsSuccess(submitRequestState)) {
      window.scrollTo(0, 0);
    }
  }, [submitRequestState]);

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
            entityKeyId: getEKID(meeting)
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

  const gotToParticipantTasks = () => {
    if (personEKID) dispatch(goToRoute(Routes.PARTICIPANT_TASK_MANAGER.replace(':participantId', personEKID)));
  };

  const hydratedSchema = hydrateCaseNotesForm(schema, reentryStaffMembers);
  return (
    <>
      <Banner
          maxHeight="100px"
          isOpen={requestIsSuccess(submitRequestState)}
          mode="success">
        <BannerContent>
          <div>Notes submission was successful!</div>
          <BannerButtonWrapper>
            <Button onClick={gotToParticipantTasks}>Go To Participant Tasks</Button>
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
