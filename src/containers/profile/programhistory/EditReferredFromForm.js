// @flow
import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import {
  EDIT_REFERRAL_SOURCE,
  SUBMIT_REFERRAL_SOURCE,
  editReferralSource,
  submitReferralSource,
} from './ProgramHistoryActions';
import { referredFromSchema, referredFromUiSchema } from './schemas/EditReleaseInfoSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const { reduceRequestStates } = ReduxUtils;
const {
  processAssociationEntityData,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
} = DataProcessingUtils;
const { MANUAL_SUBJECT_OF, PEOPLE, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { SOURCE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;

const EditReferredFromForm = () => {

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    APP.APP,
    ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId
  ], Map()));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn([
    EDM.EDM,
    TYPE_IDS_BY_FQN,
    PROPERTY_TYPES
  ], Map()));

  const dispatch = useDispatch();

  const participantNeighbors = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT_NEIGHBORS
  ], Map()));

  const referralSource = participantNeighbors.getIn([REFERRAL_REQUEST, 0, SOURCE, 0]);
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const referredFromOriginalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: referralSource,
      }
    };
    updateFormData(referredFromOriginalFormData);
  }, [referralSource]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const referralEKID :UUID = getEKID(participantNeighbors.getIn([REFERRAL_REQUEST, 0]));
  const entityIndexToIdMap :Map = Map({
    [REFERRAL_REQUEST]: List([referralEKID])
  });

  const participant :Map = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT
  ], Map()));
  const personEKID = getEntityKeyId(participant);

  const onSubmit = ({ formData: submittedFormData }) => {
    const entityData = processEntityData(submittedFormData, entitySetIds, propertyTypeIds);
    const associations = [[MANUAL_SUBJECT_OF, personEKID, PEOPLE, 0, REFERRAL_REQUEST, {}]];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitReferralSource({ associationEntityData, entityData }));
    }
  };

  const handleEditReleaseDate = (params) => {
    dispatch(editReferralSource({ ...params }));
  };

  const formContext = {
    editAction: handleEditReleaseDate,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_REFERRAL_SOURCE,
  ]);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_REFERRAL_SOURCE,
  ]);
  const reducedReqState = reduceRequestStates([editRequestState, submitRequestState]);

  if (requestIsPending(reducedReqState)) {
    return (
      <Card>
        <CardSegment vertical>
          <Spinner size="2x" />
        </CardSegment>
      </Card>
    );
  }

  return (
    <Card>
      <CardSegment padding={isDefined(referralSource) ? '30px' : '0'}>
        <Form
            disabled={isDefined(referralSource)}
            formContext={formContext}
            formData={formData}
            noPadding={isDefined(referralSource)}
            onChange={onChange}
            onSubmit={onSubmit}
            schema={referredFromSchema}
            uiSchema={referredFromUiSchema} />
      </CardSegment>
    </Card>
  );
};

export default EditReferredFromForm;
