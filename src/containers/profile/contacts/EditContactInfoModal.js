// @flow
import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_CONTACT_INFO, editContactInfo } from './ContactInfoActions';
import { schema, uiSchema } from './schemas/EditContactInfoSchemas';

import ModalHeader from '../../../components/modal/ModalHeader';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { clearEditRequestState } from '../needs/NeedsActions';
import { getEntityIndexToIdMap, getOriginalFormData, preprocessContactFormData } from '../utils/ContactsUtils';

const {
  findEntityAddressKeyFromMap,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { CONTACT_INFO, LOCATION } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;

const InnerWrapper = styled.div`
  width: 600px;
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  participantNeighbors :Map;
};

const EditContactInfoModal = ({
  isVisible,
  onClose,
  participantNeighbors,
} :Props) => {

  const addressList :List = participantNeighbors.get(LOCATION, List());
  const address :Map = addressList.get(0);
  const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());

  const entityIndexToIdMap :Map = getEntityIndexToIdMap(contactInfoEntities, address);

  const originalFormData = getOriginalFormData(contactInfoEntities, address);
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const editContactInfoReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_CONTACT_INFO,
    REQUEST_STATE
  ]));
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

  const closeModal = useCallback(() => {
    dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (requestIsSuccess(editContactInfoReqState)) {
      closeModal();
    }
  }, [closeModal, editContactInfoReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };
  const onSubmit = () => {
    const preprocessedFormData = preprocessContactFormData(formData, originalFormData);
    const draftWithKeys :Object = replaceEntityAddressKeys(
      preprocessedFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );

    if (Object.values(entityData).length) {
      dispatch(editContactInfo({ address, contactInfoEntities, entityData }));
    }
    else {
      onClose();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Contact Info" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(editContactInfoReqState);
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
      <InnerWrapper>
        <Form
            formData={formData}
            hideSubmit
            onChange={onChange}
            onSubmit={onSubmit}
            schema={schema}
            uiSchema={uiSchema} />
      </InnerWrapper>
    </Modal>
  );
};

export default EditContactInfoModal;
