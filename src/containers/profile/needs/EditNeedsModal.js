// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditNeedsSchemas';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import { EDIT_NEEDS, clearEditRequestState, editNeeds } from './NeedsActions';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;

const FixedWidthModal = styled.div`
  padding-top: 30px;
  width: 600px;
`;

type Props = {
  isVisible :boolean;
  needsAssessment :Map;
  onClose :() => void;
};

const EditNeedsModal = ({
  isVisible,
  needsAssessment,
  onClose,
} :Props) => {

  const needsAssessmentEKID :UUID = getEKID(needsAssessment);
  const entityIndexToIdMap :Map = fromJS({ [NEEDS_ASSESSMENT]: [needsAssessmentEKID] });

  const originalFormData :Object = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE)]: needsAssessment.get(TYPE, []),
      [getEntityAddressKey(0, NEEDS_ASSESSMENT, NOTES)]: needsAssessment.getIn([NOTES, 0], ''),
    }
  };
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const requestStates :Object = {
    [EDIT_NEEDS]: useSelector((store :Map) => store.getIn([
      PROFILE.PROFILE,
      ACTIONS,
      EDIT_NEEDS,
      REQUEST_STATE
    ]))
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

  const closeModal = useCallback(() => {
    dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (requestIsSuccess(requestStates[EDIT_NEEDS])) {
      closeModal();
    }
  }, [closeModal, requestStates]);

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
      dispatch(editNeeds({ entityData, needsAssessmentEKID }));
    }
    else onClose();
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="New Task" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(requestStates[EDIT_NEEDS]);
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
      <FixedWidthModal>
        <Form
            formData={formData}
            hideSubmit
            noPadding
            onChange={onChange}
            onSubmit={onSubmit}
            schema={schema}
            uiSchema={uiSchema} />
      </FixedWidthModal>
    </Modal>
  );
};

export default EditNeedsModal;
