// @flow
import React, { useState } from 'react';

import { Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { EDIT_PERSON, editPerson } from './EditPersonActions';
import { personSchema, personUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const {
  COUNTY_ID,
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  PERSON_SEX,
  RACE,
} = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
    editPerson :RequestSequence;
  };
  entitySetIds :Map;
  participant :Map;
  propertyTypeIds :Map;
  requestStates :{
    EDIT_PERSON :RequestState;
  };
};

const EditPersonForm = ({
  actions,
  entitySetIds,
  participant,
  propertyTypeIds,
  requestStates,
} :Props) => {

  const {
    [COUNTY_ID]: countyID,
    [DOB]: dobISO,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName,
    [PERSON_SEX]: sex,
    [RACE]: race,
  } = getEntityProperties(
    participant,
    [COUNTY_ID, DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PERSON_SEX, RACE],
    ''
  );
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {
      [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: lastName,
      [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: firstName,
      [getEntityAddressKey(0, PEOPLE, MIDDLE_NAME)]: middleName,
      [getEntityAddressKey(0, PEOPLE, DOB)]: dobISO,
      [getEntityAddressKey(0, PEOPLE, COUNTY_ID)]: countyID,
      [getEntityAddressKey(0, PEOPLE, PERSON_SEX)]: sex,
      [getEntityAddressKey(0, PEOPLE, RACE)]: race,
      [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: ethnicity,
    }
  };
  const [formData, updateFormData] = useState(originalFormData);
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const personEKID :UUID = getEKID(participant);
  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    map.setIn([PEOPLE, 0], personEKID);
  });

  const formContext = {
    editAction: actions.editPerson,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  if (requestIsPending(requestStates[EDIT_PERSON])) {
    return (
      <Card>
        <CardSegment vertical>
          <Spinner size="2x" />
        </CardSegment>
      </Card>
    );
  }

  return (
    <Form
        disabled
        formContext={formContext}
        formData={formData}
        onChange={onChange}
        schema={personSchema}
        uiSchema={personUiSchema} />
  );
};

const mapStateToProps = (state :Map) => {
  const selectedOrgId = state.getIn([APP.APP, SELECTED_ORG_ID], '');
  return {
    entitySetIds: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIds: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [EDIT_PERSON]: state.getIn([PROFILE.PROFILE, ACTIONS, EDIT_PERSON, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editPerson
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonForm);
