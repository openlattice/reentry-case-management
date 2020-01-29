// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

import COLORS from '../../core/style/Colors';

import { getIncarcerationFacilities } from './PersonInformationActions';
import { personInformationSchema, personInformationUiSchema } from './schemas/PersonInformationSchemas';
import {
  setContactIndices,
  getClientCJDetailsAssociations,
  getClientContactAndAddressAssociations,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  getOfficerAndAttorneyContactAssociations,
  hydrateIncarcerationFacilitiesSchemas,
  setClientContactInfoIndices,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
} from './utils/PersonInformationUtils';
import { deleteKeyFromFormData } from '../../utils/FormUtils';
import { APP, EDM, PERSON_INFORMATION_FORM } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { INCARCERATION_FACILITIES } = PERSON_INFORMATION_FORM;

const CustomCardHeader = styled(CardHeader)`
  color: ${COLORS.GRAY_01};
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
`;

type Props = {
  actions:{
    getIncarcerationFacilities :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  incarcerationFacilities :List;
  propertyTypeIdsByFqn :Map;
};

type State = {
  schema :Object;
};

class PersonInformationForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      schema: {}
    };
  }

  componentDidMount() {
    const { actions, entitySetIdsByFqn } = this.props;
    if (entitySetIdsByFqn.has(APP_TYPE_FQNS.JAILS_PRISONS)) {
      actions.getIncarcerationFacilities();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, entitySetIdsByFqn, incarcerationFacilities } = this.props;
    if (!prevProps.entitySetIdsByFqn.equals(entitySetIdsByFqn)) {
      actions.getIncarcerationFacilities();
    }
    if (!prevProps.incarcerationFacilities.equals(incarcerationFacilities)) {
      this.updateSchema(incarcerationFacilities);
    }
  }

  updateSchema = (incarcerationFacilities :List) => {
    const schema = hydrateIncarcerationFacilitiesSchemas(personInformationSchema, incarcerationFacilities);
    this.setState({ schema });
  };

  onSubmit = ({ formData } :Object) => {
    const { entitySetIdsByFqn, propertyTypeIdsByFqn } = this.props;

    let formDataToProcess = formData;
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 4), 'onProbationOrParole']);
    formDataToProcess = setClientContactInfoIndices(formDataToProcess);
    formDataToProcess = setPreferredMethodOfContact(formDataToProcess);
    formDataToProcess = setProbationOrParoleValues(formDataToProcess);
    formDataToProcess = setContactIndices(formDataToProcess);
    // HACK: remove 'registered county' and 'referred from' until data model is figured out:
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 5), 'registeredCounty']);

    let associations :Array<Array<*>> = [];
    associations = associations.concat(getClientDetailsAssociations(formDataToProcess));
    associations = associations.concat(getClientContactAndAddressAssociations(formDataToProcess));
    associations = associations.concat(getClientEducationAssociations(formDataToProcess));
    associations = associations.concat(getClientCJDetailsAssociations(formDataToProcess));
    associations = associations.concat(getClientReleaseAssociations(formDataToProcess));
    associations = associations.concat(getOfficerAndAttorneyContactAssociations(formData, formDataToProcess));
    associations = associations.concat(getClientHearingAssociations(formDataToProcess));

    const entityData :Object = processEntityData(formDataToProcess, entitySetIdsByFqn, propertyTypeIdsByFqn);
    console.log('entityData: ', entityData);
    const associationEntityData :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn
    );
    console.log('associationEntityData: ', associationEntityData);

  }

  render() {
    const { schema } = this.state;
    return (
      <Card>
        <CustomCardHeader padding="30px">Person Information</CustomCardHeader>
        <Form
            onSubmit={this.onSubmit}
            schema={schema}
            uiSchema={personInformationUiSchema} />
      </Card>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const personInformationForm :Map = state.get(PERSON_INFORMATION_FORM.PERSON_INFORMATION_FORM);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [INCARCERATION_FACILITIES]: personInformationForm.get(INCARCERATION_FACILITIES),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getIncarcerationFacilities,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PersonInformationForm);
