// @flow
import React, { useEffect, useRef, useState } from 'react';

import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { Card, CardSegment, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { EDIT_PERSON, editPerson } from './EditPersonActions';
import { personSchema, personUiSchema } from './schemas/EditPersonSchemas';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../../utils/DataUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PROFILE,
  SHARED
} from '../../../utils/constants/ReduxStateConstants';

const { PEOPLE } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

type Props = {
  actions :{
    editPerson :RequestSequence;
  };
  entitySetIds :Map;
  participant :Map;
  personFormData :Map;
  propertyTypeIds :Map;
  requestStates :{
    EDIT_PERSON :RequestState;
  };
};

const EditPersonForm = ({
  actions,
  entitySetIds,
  participant,
  personFormData,
  propertyTypeIds,
  requestStates,
} :Props) => {

  const [formData, updateFormData] = useState(personFormData.toJS());
  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
    else {
      updateFormData(personFormData.toJS());
    }
  }, [personFormData]);

  const personEKID :UUID = getEKID(participant);
  const entityIndexToIdMap :Map = Map().set(PEOPLE, [personEKID]);

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
