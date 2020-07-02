// @flow
import React, { useEffect, useState } from 'react';

import { Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import { personSchema, personUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const {
  COUNTY_ID,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  PERSON_SEX,
  RACE,
} = PROPERTY_TYPE_FQNS;

type Props = {
  participant :Map;
};

const EditPersonForm = ({ participant } :Props) => {
  const {
    [COUNTY_ID]: countyID,
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName,
    [PERSON_SEX]: sex,
    [RACE]: race,
  } = getEntityProperties(
    participant,
    [COUNTY_ID, DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PERSON_SEX, RACE],
    ''
  );
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: lastName,
      [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: firstName,
      [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: middleName,
      [getEntityAddressKey(0, PEOPLE, DOB)]: dobISO,
      [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: countyID,
      [getEntityAddressKey(0, PEOPLE, PERSON_SEX)]: sex,
      [getEntityAddressKey(0, PEOPLE, RACE)]: race,
      [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: ethnicity,
    }
  };
  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const formLastName = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, LAST_NAME)]);
    if (!isDefined(formLastName) && isDefined(participant)) {
      onChange({ formData: originalFormData });
    }
  }, [formData, originalFormData, participant]);
  const onSubmit = () => {};
  return (
    <Form
        disabled
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={personSchema}
        uiSchema={personUiSchema} />
  );
};

export default EditPersonForm;
