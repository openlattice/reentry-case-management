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
  EDIT_ATTORNEY_CONTACT_INFO,
  SUBMIT_ATTORNEY_CONTACT_INFO,
  editAttorneyContactInfo,
  submitAttorneyContactInfo,
} from './SupervisionActions';
import { attorneyContactSchema, attorneyContactUiSchema } from './schemas/EditSupervisionSchemas';

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
const { ATTORNEYS, CONTACTED_VIA, CONTACT_INFO } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { ACTIONS } = SHARED;
const { EMAIL, PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

type Props = {
  supervisionNeighbors :Map;
};

const EditAttorneyContactInfoForm = ({ supervisionNeighbors } :Props) => {

  const attorney :Map = supervisionNeighbors.get(ATTORNEYS, Map());
  const contactInfo :Map = supervisionNeighbors.get(CONTACT_INFO, Map());
  const attorneyContactInfo :List = contactInfo.get(ATTORNEYS, List());
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    let attorneyPhone;
    let attorneyEmail;
    attorneyContactInfo.forEach((contact :Map) => {
      if (contact.has(PHONE_NUMBER)) {
        attorneyPhone = format(
          contact.getIn([PHONE_NUMBER, 0]),
          'US',
          'NATIONAL'
        );
      }
      if (contact.has(EMAIL)) {
        attorneyEmail = contact.getIn([EMAIL, 0]);
      }
    });
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)]: attorneyPhone,
        [getEntityAddressKey(1, CONTACT_INFO, EMAIL)]: attorneyEmail,
      }
    };
    updateFormData(originalFormData);
  }, [attorneyContactInfo, supervisionNeighbors]);

  const onChange = ({ formData: newFormData } :Object) => {
    const dataWithFormattedPhoneNumbers = formatPhoneNumbersAsYouType(newFormData, 1);
    updateFormData(dataWithFormattedPhoneNumbers);
  };

  const entityIndexToIdMap :Map = Map().withMutations((mutator :Map) => {
    attorneyContactInfo.forEach((contact :Map) => {
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

  const attorneyEKID = getEntityKeyId(attorney);

  const onSubmit = ({ formData: submittedFormData }) => {
    const updatedFormData = preprocessContactInfoFormData(submittedFormData);
    const entityData = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associations = [
      [CONTACTED_VIA, attorneyEKID, ATTORNEYS, 0, CONTACT_INFO, {}],
      [CONTACTED_VIA, attorneyEKID, ATTORNEYS, 1, CONTACT_INFO, {}],
    ];
    const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    if (Object.values(entityData).length) {
      dispatch(submitAttorneyContactInfo({ associationEntityData, entityData }));
    }
  };

  const handleEditAttorneyContactInfo = (params) => {
    dispatch(editAttorneyContactInfo({
      attorneyContactInfo,
      attorneyEKID,
      ...params
    }));
  };

  const formContext = {
    editAction: handleEditAttorneyContactInfo,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_ATTORNEY_CONTACT_INFO,
  ]);
  const isEditing = requestIsPending(editRequestState);
  const submitRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    SUBMIT_ATTORNEY_CONTACT_INFO,
  ]);

  const uiSchema = attorney.isEmpty() ? getNonEditableSchema(attorneyContactUiSchema) : attorneyContactUiSchema;

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
                  disabled={attorney.isEmpty() || !attorneyContactInfo.isEmpty()}
                  formContext={formContext}
                  formData={formData}
                  isSubmitting={requestIsPending(submitRequestState)}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={attorneyContactSchema}
                  uiSchema={uiSchema} />
            )

        }
      </CardSegment>
    </Card>
  );
};

export default EditAttorneyContactInfoForm;
