// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map, setIn } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { getEKID } from '../../../utils/DataUtils';
import { clearEditRequestState } from '../needs/NeedsActions';
import { schema, uiSchema } from './schemas/EditCourtDatesSchemas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PROFILE } from '../../../utils/constants/ReduxStateConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { HEARINGS } = APP_TYPE_FQNS;
const { DATE, TYPE } = PROPERTY_TYPE_FQNS;

const InnerWrapper = styled.div`
  padding-top: 30px;
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  participantNeighbors :Map;
};

const EditCourtDatesModal = ({
  isVisible,
  onClose,
  participantNeighbors,
} :Props) => {

  let originalFormData = {
    [getPageSectionKey(1, 1)]: []
  };
  participantNeighbors.get(HEARINGS, List()).forEach((hearing :Map, index :number) => {
    originalFormData = setIn(
      originalFormData,
      [getPageSectionKey(1, 1), index, getEntityAddressKey(0, HEARINGS, DATE)],
      hearing.getIn([DATE, 0])
    );
    originalFormData = setIn(
      originalFormData,
      [getPageSectionKey(1, 1), index, getEntityAddressKey(0, HEARINGS, TYPE)],
      hearing.getIn([TYPE, 0])
    );
  });

  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const participant :Map = useSelector((store :Map) => store.getIn([PROFILE.PROFILE, PROFILE.PARTICIPANT], Map()));
  const personEKID :UUID = getEKID(participant);

  const closeModal = useCallback(() => {
    dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const onSubmit = () => {};

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Court Hearings" />);
  const withFooter = (
    <ModalFooter
        isPendingPrimary={false}
        onClickPrimary={onSubmit}
        onClickSecondary={closeModal}
        shouldStretchButtons
        textPrimary="Save"
        textSecondary="Discard" />
  );

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
        withFooter={withFooter}
        withHeader={renderHeader}>
      <InnerWrapper>
        <Form
            formData={formData}
            hideSubmit
            noPadding
            onChange={onChange}
            onSubmit={onSubmit}
            schema={schema}
            uiSchema={uiSchema} />
      </InnerWrapper>
    </Modal>
  );
};

export default EditCourtDatesModal;
