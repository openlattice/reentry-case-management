// @flow
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  getIn,
  setIn,
} from 'immutable';
import { DateTime } from 'luxon';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../../components/modal/ModalHeader';
import { schema, uiSchema } from './schemas/EditSexOffenderSchemas';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getEKID } from '../../../utils/DataUtils';
import { getOriginalFormData } from '../utils/SexOffenderUtils';
import { clearEditRequestState } from '../needs/NeedsActions';
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
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { SEX_OFFENDER, SEX_OFFENDER_REGISTRATION_LOCATION } = APP_TYPE_FQNS;
const {
  COUNTY,
  OL_DATETIME,
  RECOGNIZED_END_DATETIME,
  REGISTERED_FLAG,
  US_STATE,
} = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;

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
  console.log('originalFormData ', originalFormData);
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

  const participant :Map = useSelector((store :Map) => store.getIn([PROFILE.PROFILE, PROFILE.PARTICIPANT], Map()));
  const personEKID :UUID = getEKID(participant);

  const entityIndexToIdMap = Map();

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
      // dispatch(editSexOffender({ entityData, personEKID }));
    }
    else {
      onClose();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Release Info" />);
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

export default EditSexOffenderModal;
