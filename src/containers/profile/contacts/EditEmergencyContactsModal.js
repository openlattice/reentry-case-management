// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map, fromJS, mergeDeep } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditEmergencyContactsSchemas';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import {
  getAssociationsForNewEmergencyContacts,
  getEmergencyEntityIndexToIdMap,
  getOriginalEmergencyFormData,
  preprocessEditedEmergencyContactData,
  preprocessNewEmergencyContactData,
  removeRelationshipFromFormData,
} from '../utils/ContactsUtils';
import { EDIT_EMERGENCY_CONTACTS, deleteEmergencyContact, editEmergencyContacts } from './ContactInfoActions';
import { clearEditRequestState } from '../needs/NeedsActions';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const {
  findEntityAddressKeyFromMap,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
  wrapFormDataInPageSection,
} = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { PARTICIPANT } = PROFILE;

const InnerWrapper = styled.div`
  width: 600px;
`;

type Props = {
  emergencyContactInfoByContact :Map;
  isVisible :boolean;
  onClose :() => void;
  participantNeighbors :Map;
};

const EditEmergencyContactsModal = ({
  emergencyContactInfoByContact,
  isVisible,
  onClose,
  participantNeighbors,
} :Props) => {

  const entityIndexToIdMap :Map = getEmergencyEntityIndexToIdMap(emergencyContactInfoByContact, participantNeighbors);

  const originalFormData = getOriginalEmergencyFormData(emergencyContactInfoByContact, participantNeighbors);
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const editEmergencyContactsReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_EMERGENCY_CONTACTS,
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
  const participant :Map = useSelector((store :Map) => store.getIn([PROFILE.PROFILE, PARTICIPANT], Map()));

  const closeModal = useCallback(() => {
    dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (requestIsSuccess(editEmergencyContactsReqState)) {
      closeModal();
    }
  }, [closeModal, editEmergencyContactsReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const onSubmit = () => {
    let contactsDataToSubmit :Object = {};
    let contactsAssociations :Object = {};

    const { formDataWithNewContactsOnly, mappers } = preprocessNewEmergencyContactData(formData, originalFormData);

    if (Object.values(formDataWithNewContactsOnly).length && !mappers.isEmpty()) {
      const associations = getAssociationsForNewEmergencyContacts(formDataWithNewContactsOnly, getEKID(participant));
      const formDataWithoutRelationship = removeRelationshipFromFormData(formDataWithNewContactsOnly);
      contactsDataToSubmit = processEntityData(
        formDataWithoutRelationship,
        entitySetIds,
        propertyTypeIds,
        mappers
      );
      contactsAssociations = processAssociationEntityData(
        fromJS(associations),
        entitySetIds,
        propertyTypeIds,
      );
    }

    const { editedContactsAsImmutable, originalFormContactsAsImmutable } = preprocessEditedEmergencyContactData(
      formData,
      originalFormData,
      formDataWithNewContactsOnly
    );

    let contactsDataToEdit :Object = {};
    editedContactsAsImmutable.forEach((contact :Map, index :number) => {
      const contactDraftWithKeys :Map = replaceEntityAddressKeys(
        contact,
        findEntityAddressKeyFromMap(entityIndexToIdMap, index)
      );
      const originalContactWithKeys :Map = replaceEntityAddressKeys(
        originalFormContactsAsImmutable.get(index),
        findEntityAddressKeyFromMap(entityIndexToIdMap, index)
      );
      const contactsDataDiff = processEntityDataForPartialReplace(
        wrapFormDataInPageSection(contactDraftWithKeys),
        wrapFormDataInPageSection(originalContactWithKeys),
        entitySetIds,
        propertyTypeIds,
        {}
      );
      contactsDataToEdit = mergeDeep(contactsDataToEdit, contactsDataDiff);
    });

    if (Object.values(contactsDataToSubmit).length || Object.values(contactsDataToEdit).length) {
      dispatch(editEmergencyContacts({
        contactsAssociations,
        contactsDataToEdit,
        contactsDataToSubmit,
        emergencyContactInfoByContact,
        participantNeighbors,
      }));
    }
    else {
      onClose();
    }
  };

  const onDelete = (deleteValue) => {
    dispatch(deleteEmergencyContact({ deleteValue }));
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Emergency Contacts" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(editEmergencyContactsReqState);
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

  const formContext :Object = {
    deleteAction: onDelete,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
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
            formContext={formContext}
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

export default EditEmergencyContactsModal;
