// @flow
import React, { useEffect, useRef, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import { educationSchema, educationUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { EDUCATION } = APP_TYPE_FQNS;
const { HIGHEST_EDUCATION_LEVEL } = PROPERTY_TYPE_FQNS;

type Props = {
  educationFormData :Map;
  participant :Map;
  participantNeighbors :Map;
};

const EditStateIdForm = ({ educationFormData, participant, participantNeighbors } :Props) => {
  const [formData, updateFormData] = useState(educationFormData.toJS());
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
    else {
      updateFormData(educationFormData.toJS());
    }
  }, [educationFormData]);

  const education :List = participantNeighbors.get(EDUCATION, List());
  const onSubmit = () => {
    const personEKID :UUID = getEKID(participant);
  };
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
