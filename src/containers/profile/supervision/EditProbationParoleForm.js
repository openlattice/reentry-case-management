// @flow
import React, { useEffect, useState } from 'react';

import {
  List,
  Map,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { DataUtils, useRequestState } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import {
  EDIT_SUPERVISION,
  SUBMIT_SUPERVISION,
  editSupervision,
  submitSupervision,
} from './SupervisionActions';
import { probationParoleSchema, probationParoleUiSchema } from './schemas/EditSupervisionSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const { getEntityKeyId } = DataUtils;
const {
  processAssociationEntityData,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
} = DataProcessingUtils;
const { MANUAL_ASSIGNED_TO, PEOPLE, PROBATION_PAROLE } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { ACTIONS } = SHARED;
const { LEVEL, RECOGNIZED_END_DATETIME, TYPE } = PROPERTY_TYPE_FQNS;

type Props = {
  participantEKID :UUID;
  participantNeighbors :Map;
};

const EditProbationParoleForm = ({ participantEKID, participantNeighbors } :Props) => {

  const supervision = participantNeighbors.get(PROBATION_PAROLE, List());
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const {
      [LEVEL]: level,
      [RECOGNIZED_END_DATETIME]: endDateTimeISO,
      [TYPE]: type
    } = getEntityProperties(supervision.get(0) || Map(), [LEVEL, RECOGNIZED_END_DATETIME, TYPE], undefined);
    const endDateTime = DateTime.fromISO(endDateTimeISO);
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, PROBATION_PAROLE, TYPE)]: type,
        [getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)]: endDateTime.isValid
          ? endDateTime.toISODate()
          : undefined,
        [getEntityAddressKey(0, PROBATION_PAROLE, LEVEL)]: level,
      }
    };
    updateFormData(originalFormData);
  }, [participantNeighbors, supervision]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const entityIndexToIdMap :Map = Map({
    [PROBATION_PAROLE]: List([getEntityKeyId(supervision.get(0))]),
  });

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

  const onSubmit = ({ formData: submittedFormData }) => {
    let updatedFormData = submittedFormData;
    const endDatePath = [getPageSectionKey(1, 1), getEntityAddressKey(0, PROBATION_PAROLE, RECOGNIZED_END_DATETIME)];
    if (getIn(updatedFormData, endDatePath)) {
      const endDate = getIn(updatedFormData, endDatePath);
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const endDateAsDateTime = DateTime.fromSQL(`${endDate} ${currentTime}`).toISO();
      updatedFormData = setIn(updatedFormData, endDatePath, endDateAsDateTime);
    }

    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [[MANUAL_ASSIGNED_TO, participantEKID, PEOPLE, 0, PROBATION_PAROLE, {}]];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitSupervision({ associationEntityData, entityData }));
    }
  };

  const handleEditSupervision = (params) => {
    dispatch(editSupervision({ ...params }));
  };

  const formContext = {
    editAction: handleEditSupervision,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_SUPERVISION,
  ]);
  const isEditing = requestIsPending(editRequestState);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_SUPERVISION,
  ]);

  return (
    <Card>
      <CardSegment padding={isEditing ? '30px' : '0'}>
        {
          isEditing
            ? (
              <Spinner size="2x" />
            )
            : (
              <Form
                  disabled={!supervision.isEmpty()}
                  formContext={formContext}
                  formData={formData}
                  isSubmitting={submitRequestState}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={probationParoleSchema}
                  uiSchema={probationParoleUiSchema} />
            )

        }
      </CardSegment>
    </Card>
  );
};

export default EditProbationParoleForm;
