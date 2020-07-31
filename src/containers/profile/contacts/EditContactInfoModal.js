// @flow
import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { AsYouType } from 'libphonenumber-js';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_CONTACT_INFO, editContactInfo } from './ContactInfoActions';
import { schema, uiSchema } from './schemas/EditContactInfoSchemas';

import ModalHeader from '../../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../../utils/LangUtils';
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
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
  getPageSectionKey,
  getEntityAddressKey,
} = DataProcessingUtils;
const { CONTACT_INFO, LOCATION } = APP_TYPE_FQNS;
const { PHONE_NUMBER } = PROPERTY_TYPE_FQNS;
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
  personEKID :UUID;
};

const EditContactInfoModal = ({
  isVisible,
  onClose,
  participantNeighbors,
  personEKID,
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
    updateFormData(originalFormData);
  }, [dispatch, onClose, originalFormData]);

  useEffect(() => {
    if (requestIsSuccess(editContactInfoReqState)) {
      closeModal();
    }
  }, [closeModal, editContactInfoReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    let formDataWithPhoneFormatter = newFormData;
    const homePhoneKey :string[] = [getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFO, PHONE_NUMBER)];
    const homePhone = getIn(formDataWithPhoneFormatter, homePhoneKey) || '';
    const cellPhoneKey :string[] = [getPageSectionKey(1, 1), getEntityAddressKey(1, CONTACT_INFO, PHONE_NUMBER)];
    const cellPhone = getIn(formDataWithPhoneFormatter, cellPhoneKey) || '';
    formDataWithPhoneFormatter = setIn(formDataWithPhoneFormatter, homePhoneKey, new AsYouType('US').input(homePhone));
    formDataWithPhoneFormatter = setIn(formDataWithPhoneFormatter, cellPhoneKey, new AsYouType('US').input(cellPhone));
    updateFormData(formDataWithPhoneFormatter);
  };
  const onSubmit = () => {
    const { associations, newData, updatedFormData } = preprocessContactFormData(
      formData,
      originalFormData,
      address,
      contactInfoEntities,
      personEKID
    );
    let newContactInfoData = {};
    let newAssociations = [];

    if (!isDefined(address) || contactInfoEntities.isEmpty()) {
      newContactInfoData = processEntityData(newData, entitySetIds, propertyTypeIds);
      newAssociations = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    }

    let editedContactInfoData = {};

    if (isDefined(address) || !contactInfoEntities.isEmpty()) {
      const draftWithKeys :Object = replaceEntityAddressKeys(
        updatedFormData,
        findEntityAddressKeyFromMap(entityIndexToIdMap)
      );
      editedContactInfoData = processEntityDataForPartialReplace(
        draftWithKeys,
        replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
        entitySetIds,
        propertyTypeIds,
      );
    }

    if (Object.values(newContactInfoData).length || Object.values(editedContactInfoData).length) {
      dispatch(editContactInfo({
        address,
        contactInfoEntities,
        editedContactInfoData,
        newAssociations,
        newContactInfoData,
      }));
    }
    else {
      closeModal();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={closeModal} title="Edit Contact Info" />);
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
