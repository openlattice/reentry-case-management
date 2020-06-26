// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditSexOffenderSchemas';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import { getOriginalFormData, preprocessSexOffenderData } from '../utils/SexOffenderUtils';
import { clearEditRequestState } from '../needs/NeedsActions';
import { EDIT_SEX_OFFENDER, editSexOffender } from './SexOffenderActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;
const { REGISTERED_FLAG, US_STATE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;

const InnerWrapper = styled.div`
  padding-top: 30px;
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  participantNeighbors :Map;
};

const EditSexOffenderModal = ({ isVisible, onClose, participantNeighbors } :Props) => {

  const originalFormData = getOriginalFormData(participantNeighbors);
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const closeModal = useCallback(() => {
    updateFormData(originalFormData);
    onClose();
  }, [onClose, originalFormData]);

  const onChange = ({ formData: newFormData } :Object) => {
    if (newFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)] === false) {
      updateFormData({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, SEX_OFFENDER, REGISTERED_FLAG)]: false,
          [getEntityAddressKey(0, SEX_OFFENDER_REGISTRATION_LOCATION, US_STATE)]: '', // manually set because Select
        }
      });
    }
    else {
      updateFormData(newFormData);
    }
  };

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
  const editSexOffenderReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_SEX_OFFENDER,
    REQUEST_STATE
  ]));

  const participant :Map = useSelector((store :Map) => store.getIn([PROFILE.PROFILE, PROFILE.PARTICIPANT], Map()));
  const personEKID :UUID = getEKID(participant);

  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    map.setIn([SEX_OFFENDER, 0], getEKID(participantNeighbors.getIn([SEX_OFFENDER, 0])));
    const sexOffenderRegistrationLocation = participantNeighbors.get(SEX_OFFENDER_REGISTRATION_LOCATION);
    if (sexOffenderRegistrationLocation) {
      map.setIn([SEX_OFFENDER_REGISTRATION_LOCATION, 0], getEKID(sexOffenderRegistrationLocation.get(0)));
    }
  });

  useEffect(() => {
    if (requestIsSuccess(editSexOffenderReqState)) {
      dispatch(clearEditRequestState());
      closeModal();
    }
  }, [closeModal, dispatch, editSexOffenderReqState]);

  const onSubmit = () => {
    const {
      associations,
      editedData,
      locationEKIDToDelete,
      newData,
      updatedOriginalData,
    } = preprocessSexOffenderData(formData, originalFormData, participantNeighbors, personEKID);

    let newRegistrationLocationData = {};
    let newAssociations = [];
    if (associations.length) {
      newRegistrationLocationData = processEntityData(newData, entitySetIds, propertyTypeIds);
      newAssociations = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    }

    const draftWithKeys :Object = replaceEntityAddressKeys(
      editedData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const editedSexOffenderData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(updatedOriginalData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );

    if (associations.length || Object.values(editedSexOffenderData).length) {
      dispatch(editSexOffender({
        editedSexOffenderData,
        locationEKIDToDelete,
        newAssociations,
        newRegistrationLocationData,
        sexOffender: participantNeighbors.get(SEX_OFFENDER),
        sexOffenderRegistrationLocation: participantNeighbors.get(SEX_OFFENDER_REGISTRATION_LOCATION)
      }));
    }
    else {
      onClose();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Sex Offender Registration" />);
  const withFooter = (
    <ModalFooter
        isPendingPrimary={requestIsPending(editSexOffenderReqState)}
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

export default EditSexOffenderModal;
