/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  EDIT_STATE_ID,
  SUBMIT_STATE_ID,
  editStateId,
  submitStateId,
} from './EditPersonActions';
import { idSchema, idUiSchema } from './schemas/EditPersonSchemas';

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
const { HAS, PEOPLE, STATE_ID } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
    editStateId :RequestSequence;
    submitStateId :RequestSequence;
  };
  entitySetIds :Map;
  propertyTypeIds :Map;
  participant :Map;
  participantNeighbors :Map;
  requestStates :{
    EDIT_STATE_ID :RequestState;
    SUBMIT_STATE_ID :RequestState;
  };
  stateIdFormData :Map;
};

const EditStateIdForm = ({
  actions,
  entitySetIds,
  propertyTypeIds,
  participant,
  participantNeighbors,
  requestStates,
  stateIdFormData,
} :Props) => {

  const [formData, updateFormData] = useState(stateIdFormData.toJS());
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    updateFormData(stateIdFormData.toJS());
  }, [stateIdFormData]);

  const stateId :List = participantNeighbors.get(STATE_ID, List());
  const stateIdEKID :UUID = getEKID(!stateId.isEmpty() ? stateId.get(0) : Map());
  const entityIndexToIdMap :Map = Map().set(STATE_ID, [stateIdEKID]);

  const onSubmit = () => {
    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds);
    const personEKID :UUID = getEKID(participant);
    const associations :any[][] = [
      [HAS, personEKID, PEOPLE, 0, STATE_ID, {}]
    ];
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    actions.submitStateId({ associationEntityData, entityData });
  };

  const formContext = {
    editAction: actions.editStateId,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const reducedReqState = reduceRequestStates([
    requestStates[EDIT_STATE_ID],
    requestStates[SUBMIT_STATE_ID],
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
        disabled={!stateId.isEmpty()}
        formContext={formContext}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={idSchema}
        uiSchema={idUiSchema} />
  );
};

const mapStateToProps = (state :Map) => {
  const selectedOrgId = state.getIn([APP.APP, SELECTED_ORG_ID], '');
  return {
    entitySetIds: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIds: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [EDIT_STATE_ID]: state.getIn([PROFILE.PROFILE, ACTIONS, EDIT_STATE_ID, REQUEST_STATE]),
      [SUBMIT_STATE_ID]: state.getIn([PROFILE.PROFILE, ACTIONS, SUBMIT_STATE_ID, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editStateId,
    submitStateId,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditStateIdForm);
