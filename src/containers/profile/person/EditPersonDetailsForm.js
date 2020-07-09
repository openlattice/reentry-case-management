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
  EDIT_PERSON_DETAILS,
  SUBMIT_PERSON_DETAILS,
  editPersonDetails,
  submitPersonDetails,
} from './EditPersonActions';
import { personDetailsSchema, personDetailsUiSchema } from './schemas/EditPersonSchemas';

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
const { HAS, PEOPLE, PERSON_DETAILS } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
    editPersonDetails :RequestSequence;
    submitPersonDetails :RequestSequence;
  };
  entitySetIds :Map;
  propertyTypeIds :Map;
  participant :Map;
  participantNeighbors :Map;
  personDetailsFormData :Map;
  requestStates :{
    EDIT_PERSON_DETAILS :RequestState;
    SUBMIT_PERSON_DETAILS :RequestState;
  };
};

const EditPersonDetailsForm = ({
  actions,
  entitySetIds,
  propertyTypeIds,
  participant,
  participantNeighbors,
  personDetailsFormData,
  requestStates,
} :Props) => {

  const [formData, updateFormData] = useState(personDetailsFormData.toJS());
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
    else {
      updateFormData(personDetailsFormData.toJS());
    }
  }, [personDetailsFormData]);

  const personDetails :List = participantNeighbors.get(PERSON_DETAILS, List());
  const personDetailsEKID :UUID = getEKID(!personDetails.isEmpty() ? personDetails.get(0) : Map());
  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    map.setIn([PERSON_DETAILS, 0], personDetailsEKID);
  });

  const onSubmit = () => {
    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds);
    const personEKID :UUID = getEKID(participant);
    const associations :any[][] = [
      [HAS, personEKID, PEOPLE, 0, PERSON_DETAILS, {}]
    ];
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    actions.submitPersonDetails({ associationEntityData, entityData });
  };

  const formContext = {
    editAction: actions.editPersonDetails,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const reducedReqState = reduceRequestStates([
    requestStates[EDIT_PERSON_DETAILS],
    requestStates[SUBMIT_PERSON_DETAILS],
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
        disabled={!personDetails.isEmpty()}
        formContext={formContext}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        schema={personDetailsSchema}
        uiSchema={personDetailsUiSchema} />
  );
};

const mapStateToProps = (state :Map) => {
  const selectedOrgId = state.getIn([APP.APP, SELECTED_ORG_ID], '');
  return {
    entitySetIds: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIds: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [EDIT_PERSON_DETAILS]: state.getIn([PROFILE.PROFILE, ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE]),
      [SUBMIT_PERSON_DETAILS]: state.getIn([PROFILE.PROFILE, ACTIONS, SUBMIT_PERSON_DETAILS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editPersonDetails,
    submitPersonDetails,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonDetailsForm);
