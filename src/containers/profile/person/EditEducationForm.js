// @flow
import React, { useEffect, useRef, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  EDIT_EDUCATION,
  SUBMIT_EDUCATION,
  editEducation,
  submitEducation,
} from './EditPersonActions';
import { educationSchema, educationUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const { processAssociationEntityData, processEntityData } = DataProcessingUtils;
const { reduceRequestStates } = ReduxUtils;
const { EDUCATION, HAS, PEOPLE } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
    editEducation :RequestSequence;
    submitEducation :RequestSequence;
  };
  educationFormData :Map;
  entitySetIds :Map;
  participant :Map;
  participantNeighbors :Map;
  propertyTypeIds :Map;
  requestStates :{
    EDIT_EDUCATION :RequestState;
    SUBMIT_EDUCATION :RequestState;
  };
};

const EditEducationForm = ({
  actions,
  entitySetIds,
  educationFormData,
  participant,
  participantNeighbors,
  propertyTypeIds,
  requestStates,
} :Props) => {

  const [formData, updateFormData] = useState(educationFormData.toJS());
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
    else {
      updateFormData(educationFormData.toJS());
    }
  }, [educationFormData]);

  const education :List = participantNeighbors.get(EDUCATION, List());
  const educationEKID :UUID = getEKID(!education.isEmpty() ? education.get(0) : Map());
  const entityIndexToIdMap :Map = Map().set(EDUCATION, [educationEKID]);

  const onSubmit = () => {
    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds);
    const personEKID :UUID = getEKID(participant);
    const associations :any[][] = [
      [HAS, personEKID, PEOPLE, 0, EDUCATION, {}]
    ];
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    actions.submitEducation({ associationEntityData, entityData });
  };

  const formContext = {
    editAction: actions.editEducation,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const reducedReqState = reduceRequestStates([
    requestStates[EDIT_EDUCATION],
    requestStates[SUBMIT_EDUCATION],
  ]) || RequestStates.STANDBY;
  if (requestIsPending(reducedReqState)) {
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
        disabled={!education.isEmpty()}
        formContext={formContext}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={educationSchema}
        uiSchema={educationUiSchema} />
  );
};

const mapStateToProps = (state :Map) => {
  const selectedOrgId = state.getIn([APP.APP, SELECTED_ORG_ID], '');
  return {
    entitySetIds: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIds: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [EDIT_EDUCATION]: state.getIn([PROFILE.PROFILE, ACTIONS, EDIT_EDUCATION, REQUEST_STATE]),
      [SUBMIT_EDUCATION]: state.getIn([PROFILE.PROFILE, ACTIONS, SUBMIT_EDUCATION, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editEducation,
    submitEducation,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditEducationForm);
