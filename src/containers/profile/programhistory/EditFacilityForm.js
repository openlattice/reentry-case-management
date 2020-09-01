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
import {
  Breadcrumbs,
  Card,
  CardSegment,
  CardStack,
} from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  RoutingUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import { EDIT_RELEASE_INFO, editReleaseInfo } from './ProgramHistoryActions';
import {
  facilitySchema,
  facilityUiSchema,
  referredFromSchema,
  referredFromUiSchema,
  releaseDateSchema,
  releaseDateUiSchema,
} from './schemas/EditReleaseInfoSchemas';

import * as Routes from '../../../core/router/Routes';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { DST } from '../../../utils/constants/GeneralConstants';
import {
  APP,
  EDM,
  INTAKE,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { getIncarcerationFacilities } from '../../intake/IntakeActions';
import { getParticipant, getParticipantNeighbors } from '../ProfileActions';
import { clearEditRequestState } from '../needs/NeedsActions';
import { Header, NameHeader } from '../styled/GeneralProfileStyles';
import { getDataForAssociationUpdate, hydrateSchema } from '../utils/EditReleaseInfoUtils';
import { getReleaseDateAndEKIDForForm } from '../utils/ProfileUtils';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { getParamFromMatch } = RoutingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, PROJECTED_RELEASE_DATETIME, SOURCE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { INCARCERATION_FACILITIES } = INTAKE;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;

const EditFacilityForm = () => {

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

  const facilityEKID = getEKID(participantNeighbors.getIn([MANUAL_JAILS_PRISONS, 0]));
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const facilityOriginalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: facilityEKID,
      }
    };
    updateFormData(facilityOriginalFormData);
  }, [facilityEKID]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
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

  const participant :Map = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT
  ], Map()));
  const personEKID = getEntityKeyId(participant);

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
      dispatch(editReleaseInfo({ entityData, newFacilityEKID, personEKID }));
    }
    else {
      // onClose();
    }
  };

  const incarcerationFacilities :List = useSelector((store :Map) => store.getIn([
    INTAKE.INTAKE,
    INCARCERATION_FACILITIES,
  ], List()));

  const facilitySchemaWithFacilities = hydrateSchema(facilitySchema, incarcerationFacilities);

  return (
    <Card>
      <CardSegment>
        <Form
            disabled={isDefined(facilityEKID)}
            formData={formData}
            noPadding
            onChange={onChange}
            onSubmit={onSubmit}
            schema={facilitySchemaWithFacilities}
            uiSchema={facilityUiSchema} />
      </CardSegment>
    </Card>
  );
};

export default EditFacilityForm;
