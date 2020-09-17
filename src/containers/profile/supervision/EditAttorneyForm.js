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
  EDIT_ATTORNEY,
  SUBMIT_ATTORNEY,
  editAttorney,
  submitAttorney,
} from './SupervisionActions';
import { attorneySchema, attorneyUiSchema } from './schemas/EditSupervisionSchemas';

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
  ATTORNEYS,
  EMPLOYMENT,
  HAS,
  PEOPLE,
  REPRESENTED_BY,
} = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { ACTIONS } = SHARED;
const { FIRST_NAME, LAST_NAME, NAME } = PROPERTY_TYPE_FQNS;

type Props = {
  participantEKID :UUID;
  participantNeighbors :Map;
  supervisionNeighbors :Map;
};

const EditAttorneyForm = ({ participantEKID, participantNeighbors, supervisionNeighbors } :Props) => {

  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const { [FIRST_NAME]: attorneyFirstName, [LAST_NAME]: attorneyLastName } = getEntityProperties(
      attorney,
      [FIRST_NAME, LAST_NAME],
      undefined
    );
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, ATTORNEYS, FIRST_NAME)]: attorneyFirstName,
        [getEntityAddressKey(0, ATTORNEYS, LAST_NAME)]: attorneyLastName,
      }
    };
    updateFormData(originalFormData);
  }, [attorney, supervisionNeighbors]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const employee = participantNeighbors.get(EMPLOYMENT, Map()).get(0);
  const entityIndexToIdMap :Map = Map({
    [EMPLOYMENT]: List([getEntityKeyId(employee)]),
    [ATTORNEYS]: List([getEntityKeyId(attorney)]),
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
    const updatedFormData = set(submittedFormData, getPageSectionKey(1, 2), {
      [getEntityAddressKey(0, EMPLOYMENT, NAME)]: 'Attorney'
    });

    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [
      [REPRESENTED_BY, participantEKID, PEOPLE, 0, EMPLOYMENT, {}],
      [REPRESENTED_BY, participantEKID, PEOPLE, 0, ATTORNEYS, {}],
      [HAS, 0, ATTORNEYS, 0, EMPLOYMENT, {}],
    ];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitAttorney({ associationEntityData, entityData }));
    }
  };

  const handleEditOfficer = (params) => {
    dispatch(editAttorney({ ...params }));
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
    EDIT_ATTORNEY,
  ]);
  const isEditing = requestIsPending(editRequestState);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_ATTORNEY,
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
                  disabled={!attorney.isEmpty()}
                  formContext={formContext}
                  formData={formData}
                  isSubmitting={requestIsPending(submitRequestState)}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={attorneySchema}
                  uiSchema={attorneyUiSchema} />
            )

        }
      </CardSegment>
    </Card>
  );
};

export default EditAttorneyForm;
