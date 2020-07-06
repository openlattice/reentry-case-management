// @flow
import React, { useEffect, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import { personDetailsSchema, personDetailsUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PERSON_DETAILS } = APP_TYPE_FQNS;
const { MARITAL_STATUS, GENDER } = PROPERTY_TYPE_FQNS;

type Props = {
  participant :Map;
  participantNeighbors :Map;
};

const EditPersonDetailsForm = ({ participant, participantNeighbors } :Props) => {
  const personDetails :List = participantNeighbors.get(PERSON_DETAILS, List());
  const {
    [MARITAL_STATUS]: maritalStatus,
    [GENDER]: gender
  } = getEntityProperties(personDetails.get(0) || Map(), [MARITAL_STATUS, GENDER]);
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, PERSON_DETAILS, GENDER)]: gender,
      [getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]: maritalStatus,
    }
  };
  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const formMaritalStatus = getIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PERSON_DETAILS, MARITAL_STATUS)]
    );
    const formGender = getIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PERSON_DETAILS, GENDER)]
    );
    if ((!isDefined(formMaritalStatus) && !isDefined(formGender)) && !personDetails.isEmpty()) {
      onChange({ formData: originalFormData });
    }
  }, [formData, originalFormData, personDetails]);
  const onSubmit = () => {};
  return (
    <Form
        disabled={!personDetails.isEmpty()}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={personDetailsSchema}
        uiSchema={personDetailsUiSchema} />
  );
};

export default EditPersonDetailsForm;
