// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import ModalHeader from '../../../components/modal/ModalHeader';
import { isDefined } from '../../../utils/LangUtils';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { ENROLLMENT_STATUS, NEEDS_ASSESSMENT, PROVIDER } = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  DATETIME_COMPLETED,
  EFFECTIVE_DATE,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const FormWrapper = styled.div`
  padding-top: 30px;
`;

type Props = {
  enrollmentStatus ? :Map;
  isVisible :boolean;
  needsAssessment ? :string;
  onClose :() => void;
  provider ? :Map;
  schema :Object;
  uiSchema :Object;
};

const EditEventModal = ({
  enrollmentStatus,
  isVisible,
  needsAssessment,
  onClose,
  provider,
  schema,
  uiSchema,
} :Props) => {

  const [formData, updateFormData] = useState({});
  let originalFormData = {};
  if (isDefined(needsAssessment)) {
    originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)]: needsAssessment.getIn([DATETIME_COMPLETED, 0])
      }
    };
  }
  else if (isDefined(enrollmentStatus)) {
    const { [EFFECTIVE_DATE]: datetime, [STATUS]: status } = getEntityProperties(
      enrollmentStatus,
      [EFFECTIVE_DATE, STATUS]
    );
    const providerEKID :UUID = getEKID(provider);
    originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: status,
        [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: DateTime.fromISO(datetime).toISODate(),
        [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: providerEKID
      }
    };
  }

  const [formData, updateFormData] = useState(originalFormData);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };
  const onSubmit = () => {};

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Event" />);
  const renderFooter = () => {
    const isSubmitting :boolean = false;
    return (
      <ModalFooter
          isPendingPrimary={isSubmitting}
          onClickPrimary={onSubmit}
          onClickSecondary={closeModal}
          shouldStretchButtons
          textPrimary="Save"
          textSecondary="Discard" />
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={onSubmit}
        onClickSecondary={closeModal}
        onClose={closeModal}
        shouldStretchButtons
        textPrimary="Save"
        textSecondary="Discard"
        viewportScrolling
        withFooter={renderFooter}
        withHeader={renderHeader}>
      <FormWrapper>
        <Form
            formData={formData}
            hideSubmit
            noPadding
            onChange={onChange}
            onSubmit={onSubmit}
            schema={schema}
            uiSchema={uiSchema} />
      </FormWrapper>
    </Modal>
  );
};

EditEventModal.defaultProps = {
  enrollmentStatus: undefined,
  needsAssessment: undefined,
  provider: undefined,
};

export default EditEventModal;
