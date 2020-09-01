// @flow
import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  RoutingUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_RELEASE_INFO, editReleaseInfo } from './ProgramHistoryActions';
import { referredFromSchema, referredFromUiSchema } from './schemas/EditReleaseInfoSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { clearEditRequestState } from '../needs/NeedsActions';
import { getDataForAssociationUpdate } from '../utils/EditReleaseInfoUtils';

const { isDefined } = LangUtils;
const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, PROJECTED_RELEASE_DATETIME, SOURCE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;
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
  const facilityEKID = getEKID(participantNeighbors.getIn([MANUAL_JAILS_PRISONS, 0]));
  const [referredFromFormData, updateReferredFromFormData] = useState({});

  useEffect(() => {
    const referredFromOriginalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: referralSource,
      }
    };
    updateReferredFromFormData(referredFromOriginalFormData);
  }, [referralSource]);

  const onReferredFromChange = ({ formData: newFormData } :Object) => {
    updateReferredFromFormData(newFormData);
  };

  const editReleaseInfoReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_RELEASE_INFO,
    REQUEST_STATE
  ]));

  useEffect(() => {
    if (requestIsSuccess(editReleaseInfoReqState)) {
      dispatch(clearEditRequestState());
    }
  }, [dispatch, editReleaseInfoReqState]);

  const referralEKID :UUID = getEKID(participantNeighbors.getIn([REFERRAL_REQUEST, 0]));
  const entityIndexToIdMap :Map = Map({
    [REFERRAL_REQUEST]: List([referralEKID])
  });

  const onSubmit = () => {
    let updatedFormData = formData;
    const projectedReleaseDatetimePath = [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)
    ];
    if (getIn(formData, projectedReleaseDatetimePath)) {
      const formReleaseDate = getIn(formData, projectedReleaseDatetimePath);
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const releaseDateTime = DateTime.fromSQL(`${formReleaseDate} ${currentTime}`).toISO();
      updatedFormData = setIn(updatedFormData, projectedReleaseDatetimePath, releaseDateTime);
    }
    const { editedFormData, newFacilityEKID } = getDataForAssociationUpdate(updatedFormData, facilityEKID);

    const draftWithKeys :Object = replaceEntityAddressKeys(
      editedFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );
    if (Object.values(entityData).length || newFacilityEKID.length) {
      dispatch(editReleaseInfo({ entityData, newFacilityEKID, personEKID: participantEKID }));
    }
  };

  const participant :Map = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT
  ], Map()));
  return (
    <Card>
      <CardSegment>
        <Form
            disabled={isDefined(referralSource)}
            formData={referredFromFormData}
            noPadding
            onChange={onReferredFromChange}
            onSubmit={onSubmit}
            schema={referredFromSchema}
            uiSchema={referredFromUiSchema} />
      </CardSegment>
    </Card>
  );
};

export default EditReferredFromForm;
