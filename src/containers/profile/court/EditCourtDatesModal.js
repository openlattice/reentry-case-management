// @flow
import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  mergeDeep,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_COURT_HEARINGS, deleteCourtHearing, editCourtHearings } from './CourtActions';
import { schema, uiSchema } from './schemas/EditCourtDatesSchemas';

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
import {
  getCourtHearingAssociations,
  getHearingsEntityIndexToIdMap,
  preprocessEditedCourtData,
  preprocessNewCourtData,
} from '../utils/CourtUtils';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
  wrapFormDataInPageSection,
} = DataProcessingUtils;
const { HEARINGS } = APP_TYPE_FQNS;
const { DATE, TYPE } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
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

const EditCourtDatesModal = ({
  isVisible,
  onClose,
  participantNeighbors,
} :Props) => {

  const entityIndexToIdMap :Map = getHearingsEntityIndexToIdMap(participantNeighbors);

  let originalFormData = {
    [getPageSectionKey(1, 1)]: []
  };
  participantNeighbors.get(HEARINGS, List()).forEach((hearing :Map, index :number) => {
    originalFormData = setIn(
      originalFormData,
      [getPageSectionKey(1, 1), index, getEntityAddressKey(-1, HEARINGS, DATE)],
      hearing.getIn([DATE, 0])
    );
    originalFormData = setIn(
      originalFormData,
      [getPageSectionKey(1, 1), index, getEntityAddressKey(-1, HEARINGS, TYPE)],
      hearing.getIn([TYPE, 0])
    );
  });

  const [formData, updateFormData] = useState(originalFormData);
  const dispatch = useDispatch();

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
  const editCourtHearingsReqState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_COURT_HEARINGS,
    REQUEST_STATE
  ]));

  const closeModal = useCallback(() => {
    dispatch(clearEditRequestState());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (requestIsSuccess(editCourtHearingsReqState)) {
      closeModal();
    }
  }, [closeModal, editCourtHearingsReqState]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const onSubmit = () => {
    let hearingsDataToSubmit :Object = {};
    let hearingsAssociations :Object = {};

    const formDataWithCourtDataOnly :Object = preprocessNewCourtData(formData, originalFormData);

    if (formDataWithCourtDataOnly[getPageSectionKey(1, 1)].length) {

      hearingsDataToSubmit = processEntityData(
        formDataWithCourtDataOnly,
        entitySetIds,
        propertyTypeIds,
      );
      const associations = getCourtHearingAssociations(formDataWithCourtDataOnly, personEKID);
      hearingsAssociations = processAssociationEntityData(
        associations,
        entitySetIds,
        propertyTypeIds,
      );
    }

    const { editedCourtDataAsImmutable, originalCourtDataAsImmutable } = preprocessEditedCourtData(
      formData,
      originalFormData,
      formDataWithCourtDataOnly
    );

    let hearingsDataToEdit :Object = {};

    editedCourtDataAsImmutable.forEach((hearing :Map, index :number) => {
      const hearingDraftWithKeys :Map = replaceEntityAddressKeys(
        hearing,
        findEntityAddressKeyFromMap(entityIndexToIdMap, index)
      );
      const originalContactWithKeys :Map = replaceEntityAddressKeys(
        originalCourtDataAsImmutable.get(index),
        findEntityAddressKeyFromMap(entityIndexToIdMap, index)
      );
      const hearingsDataDiff = processEntityDataForPartialReplace(
        wrapFormDataInPageSection(hearingDraftWithKeys),
        wrapFormDataInPageSection(originalContactWithKeys),
        entitySetIds,
        propertyTypeIds,
        {}
      );
      hearingsDataToEdit = mergeDeep(hearingsDataToEdit, hearingsDataDiff);
    });

    if (Object.values(hearingsDataToSubmit).length || Object.values(hearingsDataToEdit).length) {
      dispatch(editCourtHearings({
        hearingsAssociations,
        hearingsDataToEdit,
        hearingsDataToSubmit,
        participantNeighbors,
      }));
    }
    else {
      onClose();
    }
  };

  const onDelete = (deleteValue) => {
    dispatch(deleteCourtHearing({ deleteValue }));
  };

  const withHeader = (
    <ModalHeader onClose={onClose} title="Edit Court Hearings" />
  );
  const withFooter = (
    <ModalFooter
        isPendingPrimary={requestIsPending(editCourtHearingsReqState)}
        onClickPrimary={onSubmit}
        onClickSecondary={closeModal}
        shouldStretchButtons
        textPrimary="Save"
        textSecondary="Discard" />
  );

  const formContext = {
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
        withFooter={withFooter}
        withHeader={withHeader}>
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

export default EditCourtDatesModal;
