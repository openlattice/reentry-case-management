// @flow
import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { DataUtils, useRequestState } from 'lattice-utils';
import { format } from 'libphonenumber-js';
import { useDispatch, useSelector } from 'react-redux';

import {
  EDIT_OFFICER_CONTACT_INFO,
  SUBMIT_OFFICER_CONTACT_INFO,
  editOfficerContactInfo,
  submitOfficerContactInfo,
} from './SupervisionActions';
import { officerContactSchema, officerContactUiSchema } from './schemas/EditSupervisionSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { formatPhoneNumbersAsYouType } from '../utils/PhoneNumberUtils';
import { getNonEditableSchema, preprocessContactInfoFormData } from '../utils/SupervisionUtils';

const { getEntityKeyId } = DataUtils;
const {
  processAssociationEntityData,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
} = DataProcessingUtils;
const {
  CONTACTED_VIA,
  CONTACT_INFO,
  EMPLOYEE,
  OFFICERS,
} = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { ACTIONS } = SHARED;
const { EMAIL, PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

type Props = {
  participantNeighbors :Map;
  supervisionNeighbors :Map;
};

const EditOfficerContactInfoForm = ({ participantNeighbors, supervisionNeighbors } :Props) => {

  const officer :Map = supervisionNeighbors.get(OFFICERS, Map());
  const employee = participantNeighbors.get(EMPLOYEE, Map()).get(0);
  const contactInfo :Map = supervisionNeighbors.get(CONTACT_INFO, Map());
  const officerContactInfo :List = contactInfo.get(OFFICERS, List());
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    let officerPhone;
    let officerEmail;
    officerContactInfo.forEach((contact :Map) => {
      if (contact.has(PHONE_NUMBER)) {
        officerPhone = format(
          contact.getIn([PHONE_NUMBER, 0]),
          'US',
          'NATIONAL'
        );
      }
      if (contact.has(EMAIL)) {
        officerEmail = contact.getIn([EMAIL, 0]);
      }
    });
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: officerPhone,
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: officerEmail,
      }
    };
    updateFormData(originalFormData);
  }, [officerContactInfo, supervisionNeighbors]);

  const onChange = ({ formData: newFormData } :Object) => {
    const dataWithFormattedPhoneNumbers = formatPhoneNumbersAsYouType(newFormData, 1);
    updateFormData(dataWithFormattedPhoneNumbers);
  };

  const entityIndexToIdMap :Map = Map().withMutations((mutator :Map) => {
    officerContactInfo.forEach((contact :Map) => {
      if (contact.has(PHONE_NUMBER)) {
        mutator.setIn([CONTACT_INFO, 0], getEntityKeyId(contact));
      }
      if (contact.has(EMAIL)) {
        mutator.setIn([CONTACT_INFO, 1], getEntityKeyId(contact));
      }
    });
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

  const officerEKID = getEntityKeyId(officer);
  const employeeEKID = getEntityKeyId(employee);

  const onSubmit = ({ formData: submittedFormData }) => {
    const updatedFormData = preprocessContactInfoFormData(submittedFormData);
    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [
      [CONTACTED_VIA, officerEKID, OFFICERS, 0, CONTACT_INFO, {}],
      [CONTACTED_VIA, employeeEKID, EMPLOYEE, 0, CONTACT_INFO, {}],
      [CONTACTED_VIA, officerEKID, OFFICERS, 1, CONTACT_INFO, {}],
      [CONTACTED_VIA, employeeEKID, EMPLOYEE, 1, CONTACT_INFO, {}],
    ];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitOfficerContactInfo({ associationEntityData, entityData }));
    }
  };

  const handleEditOfficerContactInfo = (params) => {
    dispatch(editOfficerContactInfo({
      employeeEKID,
      officerContactInfo,
      officerEKID,
      ...params
    }));
  };

  const formContext = {
    editAction: handleEditOfficerContactInfo,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_OFFICER_CONTACT_INFO,
  ]);
  const isEditing = requestIsPending(editRequestState);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_OFFICER_CONTACT_INFO,
  ]);

  const uiSchema = officer.isEmpty() ? getNonEditableSchema(officerContactUiSchema) : officerContactUiSchema;

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
                  disabled={officer.isEmpty() || !officerContactInfo.isEmpty()}
                  formContext={formContext}
                  formData={formData}
                  isSubmitting={requestIsPending(submitRequestState)}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={officerContactSchema}
                  uiSchema={uiSchema} />
            )

        }
      </CardSegment>
    </Card>
  );
};

export default EditOfficerContactInfoForm;
