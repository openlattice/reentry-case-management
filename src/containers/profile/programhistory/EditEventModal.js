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

type Props = {
  isVisible :boolean;
  onClose :() => void;
};

const EditEventModal = ({ isVisible, onClose } :Props) => {

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

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
      {/* <Form
          formData={formData}
          hideSubmit
          noPadding
          onChange={onChange}
          onSubmit={onSubmit}
          schema={schema}
          uiSchema={uiSchema} /> */}
    </Modal>
  );
};

export default EditEventModal;
