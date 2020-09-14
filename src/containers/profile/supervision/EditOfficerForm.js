// @flow
import React, { useEffect, useState } from 'react';

import {
  List,
  Map,
  set,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { DataUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import {
  EDIT_OFFICER,
  SUBMIT_OFFICER,
  editOfficer,
  submitOfficer,
} from './SupervisionActions';
import { officerSchema, officerUiSchema } from './schemas/EditSupervisionSchemas';

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
const {
  EMPLOYEE,
  IS,
  MANUAL_ASSIGNED_TO,
  OFFICERS,
  PEOPLE,
  PROBATION_PAROLE,
} = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { ACTIONS } = SHARED;
const { FIRST_NAME, LAST_NAME, TITLE } = PROPERTY_TYPE_FQNS;

type Props = {
  participantEKID :UUID;
  participantNeighbors :Map;
  supervisionNeighbors :Map;
};

const EditOfficerForm = ({ participantEKID, participantNeighbors, supervisionNeighbors } :Props) => {

  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const { [FIRST_NAME]: officerFirstName, [LAST_NAME]: officerLastName } = getEntityProperties(
      officer,
      [FIRST_NAME, LAST_NAME],
      undefined
    );
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, OFFICERS, FIRST_NAME)]: officerFirstName,
        [getEntityAddressKey(0, OFFICERS, LAST_NAME)]: officerLastName,
      }
    };
    updateFormData(originalFormData);
  }, [officer, supervisionNeighbors]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const employee = participantNeighbors.get(EMPLOYEE, Map()).get(0);
  const entityIndexToIdMap :Map = Map({
    [EMPLOYEE]: List([getEntityKeyId(employee)]),
    [OFFICERS]: List([getEntityKeyId(officer)]),
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

  const probationParoleList :?List = participantNeighbors.get(PROBATION_PAROLE);
  const probationParole :Map = probationParoleList ? probationParoleList.get(0, Map()) : Map();
  const probationParoleEKID = getEntityKeyId(probationParole);

  const dispatch = useDispatch();

  const onSubmit = ({ formData: submittedFormData }) => {
    const updatedFormData = set(submittedFormData, getPageSectionKey(1, 2), {
      [getEntityAddressKey(0, EMPLOYEE, TITLE)]: 'Probation or Parole Officer'
    });

    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [
      [MANUAL_ASSIGNED_TO, 0, EMPLOYEE, probationParoleEKID, PROBATION_PAROLE, {}],
      [MANUAL_ASSIGNED_TO, 0, OFFICERS, probationParoleEKID, PROBATION_PAROLE, {}],
      [MANUAL_ASSIGNED_TO, 0, EMPLOYEE, participantEKID, PEOPLE, {}],
      [IS, 0, OFFICERS, 0, EMPLOYEE, {}],
    ];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitOfficer({ associationEntityData, entityData }));
    }
  };

  const handleEditOfficer = (params) => {
    dispatch(editOfficer({ ...params }));
  };

  const formContext = {
    editAction: handleEditOfficer,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_OFFICER,
  ]);
  const isEditing = requestIsPending(editRequestState);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_OFFICER,
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
                  disabled={!probationParoleList || !officer.isEmpty()}
                  formContext={formContext}
                  formData={formData}
                  isSubmitting={submitRequestState}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={officerSchema}
                  uiSchema={officerUiSchema} />
            )

        }
      </CardSegment>
    </Card>
  );
};

export default EditOfficerForm;
