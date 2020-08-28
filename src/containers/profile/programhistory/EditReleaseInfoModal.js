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
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_RELEASE_INFO, editReleaseInfo } from './ProgramHistoryActions';
import { schema, uiSchema } from './schemas/EditReleaseInfoSchemas';

import ModalHeader from '../../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { clearEditRequestState } from '../needs/NeedsActions';
import { getDataForAssociationUpdate, hydrateSchema } from '../utils/EditReleaseInfoUtils';
import { getReleaseDateAndEKIDForForm } from '../utils/ProfileUtils';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, REFERRAL_REQUEST } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, PROJECTED_RELEASE_DATETIME, SOURCE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;

const FixedWidthModal = styled.div`
  padding-top: 30px;
  width: 400px;
`;

type Props = {
  incarcerationFacilities :List;
  isVisible :boolean;
  onClose :() => void;
  participantNeighbors :Map;
};

const EditReleaseInfoModal = ({
  incarcerationFacilities,
  isVisible,
  onClose,
  participantNeighbors
} :Props) => {

  const schemaWithFacilities = hydrateSchema(schema, incarcerationFacilities);

  const referralSource = participantNeighbors.getIn([REFERRAL_REQUEST, 0, SOURCE, 0]);
  const { jailStayEKID, releaseDate } = getReleaseDateAndEKIDForForm(
    participantNeighbors.get(MANUAL_JAIL_STAYS,
      List())
  );
  const facilityEKID = getEKID(participantNeighbors.getIn([MANUAL_JAILS_PRISONS, 0]));
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: facilityEKID,
      [getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)]: releaseDate,
      [getEntityAddressKey(0, REFERRAL_REQUEST, SOURCE)]: referralSource,
    }
  };
  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

  const closeModal = useCallback(() => {
    updateFormData(originalFormData);
    onClose();
  }, [onClose, originalFormData]);

  const editReleaseInfoReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_RELEASE_INFO,
    REQUEST_STATE
  ]));

  useEffect(() => {
    if (requestIsSuccess(editReleaseInfoReqState)) {
      dispatch(clearEditRequestState());
      closeModal();
    }
  }, [closeModal, dispatch, editReleaseInfoReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const referralEKID :UUID = getEKID(participantNeighbors.getIn([REFERRAL_REQUEST, 0]));
  const entityIndexToIdMap :Map = Map({
    [MANUAL_JAIL_STAYS]: List([jailStayEKID]),
    [REFERRAL_REQUEST]: List([referralEKID])
  });

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

  const onSubmit = () => {
    let updatedFormData = formData;
    const projectedReleaseDatetimePath = [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, MANUAL_JAIL_STAYS, PROJECTED_RELEASE_DATETIME)
    ];
    if (getIn(formData, projectedReleaseDatetimePath)) {
      const formReleaseDate = getIn(formData, projectedReleaseDatetimePath);
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const releaseDateTime = DateTime.fromSQL(`${formReleaseDate} ${currentTime}`).toISO();
      updatedFormData = setIn(updatedFormData, projectedReleaseDatetimePath, releaseDateTime);
    }
    const { editedFormData, newFacilityEKID } = getDataForAssociationUpdate(updatedFormData, facilityEKID);

    const draftWithKeys :Object = replaceEntityAddressKeys(
      editedFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );
    if (Object.values(entityData).length || newFacilityEKID.length) {
      dispatch(editReleaseInfo({ entityData, newFacilityEKID, personEKID }));
    }
    else {
      onClose();
    }
  };

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Release Info" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(editReleaseInfoReqState);
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
            schema={schemaWithFacilities}
            uiSchema={uiSchema} />
      </FixedWidthModal>
    </Modal>
  );
};

export default EditReleaseInfoModal;
