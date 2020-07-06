// @flow
import React, { useEffect, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import { educationSchema, educationUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { EDUCATION } = APP_TYPE_FQNS;
const { HIGHEST_EDUCATION_LEVEL } = PROPERTY_TYPE_FQNS;

type Props = {
  participant :Map;
  participantNeighbors :Map;
};

const EditStateIdForm = ({ participant, participantNeighbors } :Props) => {
  const education :List = participantNeighbors.get(EDUCATION, List());
  const { [HIGHEST_EDUCATION_LEVEL]: opusNumber } = getEntityProperties(
    education.get(0) || Map(),
    [HIGHEST_EDUCATION_LEVEL]
  );
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]: opusNumber,
    }
  };
  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const formEducationLevel = getIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, EDUCATION, HIGHEST_EDUCATION_LEVEL)]
    );
    if (!isDefined(formEducationLevel) && !education.isEmpty()) {
      onChange({ formData: originalFormData });
    }
  }, [formData, originalFormData, education]);
  const onSubmit = () => {};
  return (
    <Form
        disabled={!education.isEmpty()}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={educationSchema}
        uiSchema={educationUiSchema} />
  );
};

export default EditStateIdForm;
