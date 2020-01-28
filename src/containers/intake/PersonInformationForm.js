// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import COLORS from '../../core/style/Colors';

import { personInformationSchema, personInformationUiSchema } from './schemas/PersonInformationSchemas';
import {
  setContactIndices,
  getClientCJDetailsAssociations,
  getClientContactAndAddressAssociations,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  setClientContactInfoIndices,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
} from './utils/PersonInformationUtils';
import { deleteKeyFromFormData } from '../../utils/FormUtils';
import { APP, EDM } from '../../utils/constants/ReduxStateConstants';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;

const CustomCardHeader = styled(CardHeader)`
  color: ${COLORS.GRAY_01};
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
`;

type Props = {
  entitySetIdsByFqn :Map;
  propertyTypeIdsByFqn :Map;
};

type State = {
  formData :Object;
};

class PersonInformationForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  onSubmit = ({ formData } :Object) => {
    const { entitySetIdsByFqn, propertyTypeIdsByFqn } = this.props;

    console.log('formData: ', formData);

    let formDataToProcess = formData;
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 4), 'onProbationOrParole']);
    formDataToProcess = setClientContactInfoIndices(formDataToProcess);
    formDataToProcess = setPreferredMethodOfContact(formDataToProcess);
    formDataToProcess = setProbationOrParoleValues(formDataToProcess);
    formDataToProcess = setContactIndices(formDataToProcess);
    // HACK: remove 'registered county' and 'referred from' until data model is figured out:
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 5), 'registeredCounty']);
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 4), 'referredFrom']);
    console.log('formDataToProcess: ', formDataToProcess);

    let associations :Array<Array<*>> = [];
    associations = associations.concat(getClientDetailsAssociations(formDataToProcess));
    associations = associations.concat(getClientContactAndAddressAssociations(formDataToProcess));
    associations = associations.concat(getClientEducationAssociations(formDataToProcess));
    associations = associations.concat(getClientCJDetailsAssociations(formDataToProcess));
    associations = associations.concat(getClientReleaseAssociations(formDataToProcess));
    associations = associations.concat(getClientHearingAssociations(formDataToProcess));
    console.log('associations: ', associations);

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
    const { formData } = this.state;
    return (
      <Card>
        <CustomCardHeader padding="30px">Person Information</CustomCardHeader>
        <Form
            formData={formData}
            onSubmit={this.onSubmit}
            schema={personInformationSchema}
            uiSchema={personInformationUiSchema} />
      </Card>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(PersonInformationForm);
