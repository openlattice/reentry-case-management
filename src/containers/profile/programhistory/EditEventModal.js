/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  getIn,
  removeIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter, Spinner } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import { EDIT_EVENT, editEvent } from './ProgramHistoryActions';

import ModalHeader from '../../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  PROVIDERS,
  SHARED,
} from '../../../utils/constants/ReduxStateConstants';
import { GET_PROVIDERS } from '../../providers/ProvidersActions';
import { hydrateEventSchema } from '../events/utils/EventUtils';
import { clearEditRequestState } from '../needs/NeedsActions';

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { ENROLLMENT_STATUS, NEEDS_ASSESSMENT, PROVIDER } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  EFFECTIVE_DATE,
  ENTITY_KEY_ID,
  NOTES,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PROVIDERS_LIST } = PROVIDERS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

const FormWrapper = styled.div`
  padding-top: 30px;
`;

type Props = {
  enrollmentStatus ? :Map;
  isVisible :boolean;
  needsAssessment ? :string;
  onClose :() => void;
  provider ? :Map;
  schema :Object;
  uiSchema :Object;
};

const EditEventModal = ({
  enrollmentStatus,
  isVisible,
  needsAssessment,
  onClose,
  provider,
  schema,
  uiSchema,
} :Props) => {

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
  const getProvidersReqState = useSelector((store) => store.getIn([
    PROVIDERS.PROVIDERS,
    ACTIONS,
    GET_PROVIDERS,
    REQUEST_STATE
  ]));

  const providersList = useSelector((store) => store.getIn([PROVIDERS.PROVIDERS, PROVIDERS_LIST]));
  const hydratedSchema = isDefined(needsAssessment) ? schema : hydrateEventSchema(schema, providersList);

  let originalFormData = {};
  if (isDefined(needsAssessment)) {
    originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)]: needsAssessment.getIn([DATETIME_COMPLETED, 0])
      }
    };
  }
  else if (isDefined(enrollmentStatus)) {
    const { [EFFECTIVE_DATE]: datetime, [NOTES]: notes, [STATUS]: status } = getEntityProperties(
      enrollmentStatus,
      [EFFECTIVE_DATE, NOTES, STATUS]
    );
    const providerEKID :UUID = getEKID(provider);
    originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: status,
        [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: DateTime.fromISO(datetime).toISODate(),
        [getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]: providerEKID,
        [getEntityAddressKey(0, ENROLLMENT_STATUS, NOTES)]: notes
      }
    };
  }

  const [formData, updateFormData] = useState(originalFormData);
  const enrollmentStatusEKID :UUID = getEKID(enrollmentStatus);
  const needsAssessmentEKID :UUID = getEKID(needsAssessment);
  const entityIndexToIdMap = Map({
    [ENROLLMENT_STATUS]: List([enrollmentStatusEKID]),
    [NEEDS_ASSESSMENT]: List([needsAssessmentEKID]),
    [PROVIDER]: List([getEKID(provider)]),
  });

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const dispatch = useDispatch();
  const onSubmit = () => {
    let updatedFormData = formData;
    const eventDatePath = [getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)];
    const enrollmentDatePath = [getPageSectionKey(1, 1), getEntityAddressKey(0, NEEDS_ASSESSMENT, DATETIME_COMPLETED)];
    const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);

    const effectiveDate = getIn(formData, eventDatePath);
    const enrollmentDate = getIn(formData, enrollmentDatePath);
    if (effectiveDate) {
      updatedFormData = setIn(
        updatedFormData,
        eventDatePath,
        DateTime.fromSQL(`${effectiveDate} ${currentTime}`).toISO()
      );
    }
    else if (enrollmentDate) {
      updatedFormData = setIn(
        updatedFormData,
        enrollmentDatePath,
        DateTime.fromSQL(`${enrollmentDate} ${currentTime}`).toISO()
      );
    }

    const providerPath = [getPageSectionKey(1, 1), getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)];
    const newProviderEKID = getIn(updatedFormData, providerPath) !== getEKID(provider)
      ? getIn(updatedFormData, providerPath)
      : undefined;
    updatedFormData = removeIn(updatedFormData, providerPath);

    const draftWithKeys :Object = replaceEntityAddressKeys(
      updatedFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      replaceEntityAddressKeys(originalFormData, findEntityAddressKeyFromMap(entityIndexToIdMap)),
      entitySetIds,
      propertyTypeIds,
    );

    dispatch(editEvent({
      enrollmentStatusEKID,
      entityData,
      needsAssessmentEKID,
      newProviderEKID,
    }));
  };
  const editEventReqState = useSelector((store) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_EVENT,
    REQUEST_STATE
  ]));

  useEffect(() => {
    if (requestIsSuccess(editEventReqState)) {
      dispatch(clearEditRequestState());
      closeModal();
    }
  }, [closeModal, dispatch, editEventReqState]);

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Edit Event" />);
  const renderFooter = () => {
    const isSubmitting :boolean = requestIsPending(editEventReqState);
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
      {
        requestIsPending(getProvidersReqState)
          ? (
            <Spinner size="2x" />
          )
          : (
            <FormWrapper>
              <Form
                  formData={formData}
                  hideSubmit
                  noPadding
                  onChange={onChange}
                  onSubmit={onSubmit}
                  schema={hydratedSchema}
                  uiSchema={uiSchema} />
            </FormWrapper>
          )
      }
    </Modal>
  );
};

EditEventModal.defaultProps = {
  enrollmentStatus: undefined,
  needsAssessment: undefined,
  provider: undefined,
};

export default EditEventModal;
