// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditContactInfoSchemas';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import { getOriginalFormData } from '../utils/ContactsUtils';
// import { EDIT_NEEDS, clearEditRequestState, editNeeds } from './NeedsActions';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

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
  const addressEKID :UUID = getEKID(address);
  const contactInfoEntities :List = participantNeighbors.get(CONTACT_INFO, List());
  const entityIndexToIdMap :Map = Map({
    [CONTACT_INFO]: List([contactInfoEntities.map((entity :Map) => getEKID(entity))]),
    [LOCATION]: List([addressEKID]),
  });

  const originalFormData = getOriginalFormData(contactInfoEntities, address);
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const editNeedsReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    // EDIT_NEEDS,
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
    // dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (requestIsSuccess(editNeedsReqState)) {
      closeModal();
    }
  }, [closeModal, editNeedsReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };
  const onSubmit = () => {
    const draftWithKeys :Object = replaceEntityAddressKeys(
      formData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );
    if (Object.values(entityData).length) {
      // dispatch(editNeeds({ entityData, needsAssessmentEKID }));
    }
    else {
      onClose();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Contact Info" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(editNeedsReqState);
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
