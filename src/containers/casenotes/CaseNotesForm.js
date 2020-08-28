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
import { DataUtils, RoutingUtils, useRequestState } from 'lattice-utils';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence } from 'redux-reqseq';

import {
  SUBMIT_CASE_NOTES_AND_COMPLETE_TASK,
  clearSubmitRequestState,
  getMeetingAndTask,
  getReentryStaff,
  submitCaseNotesAndCompleteTask,
} from './CaseNotesActions';
import { schema, uiSchema } from './schemas/CaseNotesSchemas';
import { hydrateCaseNotesForm, preprocessCaseNotesFormData } from './utils/CaseNotesFormUtils';

import * as Routes from '../../core/router/Routes';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import {
  APP,
  CASE_NOTES,
  EDM,
  PARTICIPANT_FOLLOW_UPS,
  SHARED,
} from '../../utils/constants/ReduxStateConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

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
  actions :{
    clearSubmitRequestState :() => void;
    getMeetingAndTask :RequestSequence;
    getReentryStaff :RequestSequence;
    goToRoute :GoToRoute;
    submitCaseNotesAndCompleteTask :RequestSequence;
  };
  history :Object;
  match :Match;
};

const CaseNotesForm = ({ actions, history, match } :Props) => {

  const [formData, updateFormData] = useState({});
  const personEKID = getParamFromMatch(match, Routes.PARTICIPANT_ID);
  const meetingEKID = getParamFromMatch(match, Routes.MEETING_ID);

  useEffect(() => {
    actions.getReentryStaff();
    actions.getMeetingAndTask(meetingEKID);
  }, [actions, meetingEKID]);

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
  }, [actions, submitRequestState]);

  useEffect(() => actions.clearSubmitRequestState, [actions]);

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
    actions.submitCaseNotesAndCompleteTask({ associations, meetingEntityData, taskEntityData });
  };

  const gotToParticipantTasks = () => {
    if (personEKID) actions.goToRoute(Routes.PARTICIPANT_TASK_MANAGER.replace(':participantId', personEKID));
  };

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

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearSubmitRequestState,
    getMeetingAndTask,
    getReentryStaff,
    goToRoute,
    submitCaseNotesAndCompleteTask,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(CaseNotesForm);
