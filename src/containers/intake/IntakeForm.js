// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { Button, Card, CardHeader } from 'lattice-ui-kit';
import { DataProcessingUtils, Form, Paged } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import COLORS from '../../core/style/Colors';
import {
  SUBMIT_PERSON_INFORMATION_FORM,
  getIncarcerationFacilities,
  submitPersonInformationForm
} from './PersonInformationActions';
import { schemas, uiSchemas } from './schemas/IntakeSchemas';
import {
  getClientContactAndAddressAssociations,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  getClientSexOffenderAssociations,
  getOfficerAndAttorneyContactAssociations,
  hydrateIncarcerationFacilitiesSchemas,
  setClientContactInfoIndices,
  setContactIndices,
  setDatesAsDateTimes,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
  setRegisteredSexOffender,
} from './utils/PersonInformationUtils';
import { deleteKeyFromFormData } from '../../utils/FormUtils';
import { pipeConcat, pipeValue } from '../../utils/Utils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import {
  APP,
  EDM,
  PERSON_INFORMATION_FORM,
  SHARED,
} from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { INCARCERATION_FACILITIES } = PERSON_INFORMATION_FORM;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { JAILS_PRISONS } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  width: 100%;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(2, 300px);
`;

const CustomCardHeader = styled(CardHeader)`
  color: ${COLORS.GRAY_01};
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
`;

type Props = {
  actions :{
    getIncarcerationFacilities :RequestSequence;
    submitPersonInformationForm :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  incarcerationFacilities :List;
  propertyTypeIdsByFqn :Map;
  requestStates :{
    SUBMIT_PERSON_INFORMATION_FORM :RequestState;
  };
};

type State = {
  hydratedSchema :Object;
};

class IntakeForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      hydratedSchema: schemas[0]
    };
  }

  componentDidMount() {
    const { actions, entitySetIdsByFqn } = this.props;
    if (entitySetIdsByFqn.has(JAILS_PRISONS)) {
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
    const hydratedSchema = hydrateIncarcerationFacilitiesSchemas(schemas[0], incarcerationFacilities);
    this.setState({ hydratedSchema });
  }

  onSubmit = ({ formData } :Object) => {
    const { actions, entitySetIdsByFqn, propertyTypeIdsByFqn } = this.props;

    let formDataToProcess = formData;
    formDataToProcess = deleteKeyFromFormData(formDataToProcess, [getPageSectionKey(1, 4), 'onProbationOrParole']);
    formDataToProcess = pipeValue(
      setClientContactInfoIndices,
      setPreferredMethodOfContact,
      setProbationOrParoleValues,
      setContactIndices,
      setDatesAsDateTimes,
      setRegisteredSexOffender
    )(formDataToProcess);

    let associations :Array<Array<*>> = pipeConcat(
      formDataToProcess,
      getClientDetailsAssociations,
      getClientContactAndAddressAssociations,
      getClientEducationAssociations,
      getClientSexOffenderAssociations,
      getClientReleaseAssociations,
      getClientHearingAssociations
    )([]);
    associations = associations.concat(getOfficerAndAttorneyContactAssociations(formData, formDataToProcess));

    // delete incarcerationFacility EKID from formData
    formDataToProcess = deleteKeyFromFormData(
      formDataToProcess,
      [getPageSectionKey(1, 4), getEntityAddressKey(0, JAILS_PRISONS, ENTITY_KEY_ID)]
    );

    const entityData :Object = processEntityData(formDataToProcess, entitySetIdsByFqn, propertyTypeIdsByFqn);
    const associationEntityData :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn
    );

    actions.submitPersonInformationForm({ associationEntityData, entityData });
  }

  render() {
    const { requestStates } = this.props;
    const { hydratedSchema } = this.state;
    return (
      <Paged
          render={(props :Object) => {
            const {
              formRef,
              pagedData,
              page,
              onBack,
              onNext,
              validateAndSubmit,
            } = props;

            const personInformationPage :boolean = page === 0;
            const needsAssessmentPage :boolean = page === 1;
            console.log('page: ', page);

            const handleNext = needsAssessmentPage
              ? this.onSubmit
              : validateAndSubmit;

            const header :string = personInformationPage ? 'Person Information' : 'Needs Assessment';

            return (
              <>
                <Card>
                  <CustomCardHeader padding="30px">{ header }</CustomCardHeader>
                  <Form
                      formData={pagedData}
                      ref={formRef}
                      hideSubmit
                      isSubmitting={requestIsPending(requestStates[SUBMIT_PERSON_INFORMATION_FORM])}
                      onSubmit={onNext}
                      schema={personInformationPage ? hydratedSchema : schemas[page]}
                      uiSchema={uiSchemas[page]} />
                </Card>
                <ActionRow>
                  <ButtonsWrapper>
                    <Button
                        disabled={!(page > 0)}
                        onClick={onBack}>
                      Back
                    </Button>
                    <Button
                        mode="primary"
                        onClick={handleNext}>
                      { personInformationPage ? 'Continue to Needs Assessment' : 'Submit'}
                    </Button>
                  </ButtonsWrapper>
                </ActionRow>
              </>
            );
          }} />
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
    requestStates: {
      [SUBMIT_PERSON_INFORMATION_FORM]: personInformationForm.getIn([
        ACTIONS,
        SUBMIT_PERSON_INFORMATION_FORM,
        REQUEST_STATE
      ]),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getIncarcerationFacilities,
    submitPersonInformationForm,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(IntakeForm);
