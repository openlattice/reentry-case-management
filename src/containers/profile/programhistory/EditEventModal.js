// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';

import ModalHeader from '../../../components/modal/ModalHeader';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;

const FormWrapper = styled.div`
  padding-top: 30px;
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  schema :Object;
  uiSchema :Object;
};

const EditEventModal = ({
  isVisible,
  onClose,
  schema,
  uiSchema,
} :Props) => {

  const [formData, updateFormData] = useState({});

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

export default EditEventModal;
