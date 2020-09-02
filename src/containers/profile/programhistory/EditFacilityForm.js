// @flow
import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import { DataUtils, LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_FACILITY_RELEASED_FROM, editFacilityReleasedFrom } from './ProgramHistoryActions';
import { facilitySchema, facilityUiSchema } from './schemas/EditReleaseInfoSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  INTAKE,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';
import { hydrateSchema } from '../utils/EditReleaseInfoUtils';
import { getReleaseDateAndEKIDForForm } from '../utils/ProfileUtils';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { MANUAL_JAILS_PRISONS, MANUAL_JAIL_STAYS, MANUAL_LOCATED_AT } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { ACTIONS } = SHARED;
const { INCARCERATION_FACILITIES } = INTAKE;
const { PARTICIPANT_NEIGHBORS } = PROFILE;

const EditFacilityForm = () => {

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    APP.APP,
    ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId
  ], Map()));

  const dispatch = useDispatch();

  const participantNeighbors = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    PARTICIPANT_NEIGHBORS
  ], Map()));

  const facilityEKID = getEntityKeyId(participantNeighbors.getIn([MANUAL_JAILS_PRISONS, 0]));
  const { jailStayEKID } = getReleaseDateAndEKIDForForm(participantNeighbors.get(MANUAL_JAIL_STAYS, List()));
  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const facilityOriginalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]: facilityEKID,
      }
    };
    updateFormData(facilityOriginalFormData);
  }, [facilityEKID]);

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const onSubmit = ({ formData: submittedFormData }) => {
    const facilityESID = entitySetIds.get(MANUAL_JAILS_PRISONS);
    const locatedAtESID = entitySetIds.get(MANUAL_LOCATED_AT);
    const jailStaysESID = entitySetIds.get(MANUAL_JAIL_STAYS);
    const newFacilityEKID = submittedFormData[getPageSectionKey(1, 1)][
      getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)
    ];
    if (facilityEKID !== newFacilityEKID) {
      const associations = {
        [locatedAtESID]: [
          {
            data: {},
            src: {
              entitySetId: jailStaysESID,
              entityKeyId: jailStayEKID
            },
            dst: {
              entitySetId: facilityESID,
              entityKeyId: newFacilityEKID
            }
          }
        ]
      };
      dispatch(editFacilityReleasedFrom({ associations, jailStayEKID, newFacilityEKID }));
    }
  };

  const incarcerationFacilities :List = useSelector((store :Map) => store.getIn([
    INTAKE.INTAKE,
    INCARCERATION_FACILITIES,
  ], List()));

  const facilitySchemaWithFacilities = hydrateSchema(facilitySchema, incarcerationFacilities);

  const formContext = {
    editAction: onSubmit,
    entityIndexToIdMap: Map(),
    entitySetIds,
    propertyTypeIds: Map(),
  };

  const editRequestState = useRequestState([
    PROFILE.PROFILE,
    ACTIONS,
    EDIT_FACILITY_RELEASED_FROM,
  ]);

  if (requestIsPending(editRequestState)) {
    return (
      <Card>
        <CardSegment vertical>
          <Spinner size="2x" />
        </CardSegment>
      </Card>
    );
  }

  return (
    <Card>
      <CardSegment padding={isDefined(facilityEKID) ? '30px' : '0'}>
        <Form
            disabled={isDefined(facilityEKID) || !isDefined(jailStayEKID)}
            formContext={formContext}
            formData={formData}
            noPadding={isDefined(facilityEKID)}
            onChange={onChange}
            onSubmit={onSubmit}
            schema={facilitySchemaWithFacilities}
            uiSchema={facilityUiSchema} />
      </CardSegment>
    </Card>
  );
};

export default EditFacilityForm;
