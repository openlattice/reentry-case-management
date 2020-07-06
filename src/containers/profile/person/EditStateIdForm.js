// @flow
import React, { useEffect, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import { idSchema, idUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { STATE_ID } = APP_TYPE_FQNS;
const { OL_ID_FQN } = PROPERTY_TYPE_FQNS;

type Props = {
  participant :Map;
  participantNeighbors :Map;
};

const EditStateIdForm = ({ participant, participantNeighbors } :Props) => {
  const personId :List = participantNeighbors.get(STATE_ID, List());
  const { [OL_ID_FQN]: opusNumber } = getEntityProperties(personId.get(0) || Map(), [OL_ID_FQN]);
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]: opusNumber,
    }
  };
  const [formData, updateFormData] = useState({});
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const formId = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, STATE_ID, OL_ID_FQN)]);
    if (!isDefined(formId) && !personId.isEmpty()) {
      onChange({ formData: originalFormData });
    }
  }, [formData, originalFormData, personId]);
  const onSubmit = () => {};
  return (
    <Form
        disabled={!personId.isEmpty()}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={idSchema}
        uiSchema={idUiSchema} />
  );
};

export default EditStateIdForm;
