// @flow
import React, { useEffect, useState } from 'react';

import {
  List,
  Map,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import {
  EDIT_RELEASE_DATE,
  SUBMIT_RELEASE_DATE,
  editReleaseDate,
  submitReleaseDate,
} from './ProgramHistoryActions';
import { releaseDateSchema, releaseDateUiSchema } from './schemas/EditReleaseInfoSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { getReleaseDateAndEKIDForForm } from '../utils/ProfileUtils';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const { reduceRequestStates } = ReduxUtils;
const {
  processAssociationEntityData,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
} = DataProcessingUtils;
const { MANUAL_JAIL_STAYS, MANUAL_SUBJECT_OF, PEOPLE } = APP_TYPE_FQNS;
const { PROJECTED_RELEASE_DATETIME } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS } = SHARED;
const { PARTICIPANT, PARTICIPANT_NEIGHBORS } = PROFILE;

const EditReleaseDateForm = () => {

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

  const { jailStayEKID, releaseDate } = getReleaseDateAndEKIDForForm(
    participantNeighbors.get(MANUAL_JAIL_STAYS,
      List())
  );
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const releaseDateOriginalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: releaseDate,
      }
    };
    updateFormData(releaseDateOriginalFormData);
  }, [releaseDate]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const entityIndexToIdMap :Map = Map({
    [MANUAL_JAIL_STAYS]: List([jailStayEKID]),
  });

  const participant :Map = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT
  ], Map()));
  const personEKID = getEntityKeyId(participant);

  const onSubmit = ({ formData: submittedFormData }) => {
    let updatedFormData = submittedFormData;
    const projectedReleaseDatetimePath = [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)
    ];
    if (getIn(updatedFormData, projectedReleaseDatetimePath)) {
      const formReleaseDate = getIn(updatedFormData, projectedReleaseDatetimePath);
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const releaseDateTime = DateTime.fromSQL(`${formReleaseDate} ${currentTime}`).toISO();
      updatedFormData = setIn(updatedFormData, projectedReleaseDatetimePath, releaseDateTime);
    }

    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [[MANUAL_SUBJECT_OF, personEKID, PEOPLE, 0, MANUAL_JAIL_STAYS, {}]];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitReleaseDate({ associationEntityData, entityData }));
    }
  };

  const handleEditReleaseDate = (params) => {
    dispatch(editReleaseDate({ ...params }));
  };

  const formContext = {
    editAction: handleEditReleaseDate,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const jailStayIsDefined = isDefined(participantNeighbors.get(MANUAL_JAIL_STAYS));

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_RELEASE_DATE,
  ]);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_RELEASE_DATE,
  ]);
  const reducedReqState = reduceRequestStates([editRequestState, submitRequestState]);

  if (requestIsPending(reducedReqState)) {
    return (
      <Card>
        <CardSegment>
          <Spinner size="2x" />
        </CardSegment>
      </Card>
    );
  }

  return (
    <Card>
      <CardSegment padding={jailStayIsDefined ? '30px' : '0'}>
        <Form
            disabled={jailStayIsDefined}
            formContext={formContext}
            formData={formData}
            noPadding={jailStayIsDefined}
            onChange={onChange}
            onSubmit={onSubmit}
            schema={releaseDateSchema}
            uiSchema={releaseDateUiSchema} />
      </CardSegment>
    </Card>
  );
};

export default EditReleaseDateForm;
