// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import {
  Banner,
  Button,
  Card,
  CardHeader,
  Colors,
} from 'lattice-ui-kit';
import { DataProcessingUtils, Form, Paged } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as Routes from '../../core/router/Routes';
import {
  SUBMIT_INTAKE_FORM,
  clearSubmitRequestState,
  getIncarcerationFacilities,
  submitIntakeForm
} from './IntakeActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { schemas, uiSchemas } from './schemas/IntakeSchemas';
import {
  getClientContactAndAddressAssociations,
  getClientDetailsAssociations,
  getClientEducationAssociations,
  getClientHearingAssociations,
  getClientReleaseAssociations,
  getClientSexOffenderAssociations,
  getNeedsAssessmentAssociations,
  getOfficerAndAttorneyContactAssociations,
  hydrateIncarcerationFacilitiesSchemas,
  setClientContactInfoIndices,
  setContactIndices,
  setDatesAsDateTimes,
  setPreferredMethodOfContact,
  setProbationOrParoleValues,
  setRegisteredSexOffender,
} from './utils/IntakeUtils';
import { deleteKeyFromFormData } from '../../utils/FormUtils';
import { pipeConcat, pipeValue } from '../../utils/Utils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import { COLORS } from '../../core/style/Colors';
import {
  APP,
  EDM,
  INTAKE,
  SHARED,
} from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const {
  KEY_MAPPERS,
  VALUE_MAPPERS,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQN } = EDM;
const { INCARCERATION_FACILITIES, NEW_PARTICIPANT_EKID } = INTAKE;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { MANUAL_JAILS_PRISONS, NEEDS_ASSESSMENT } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID, TYPE } = PROPERTY_TYPE_FQNS;

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

const DarkerButton = styled(Button)`
  background-color: ${NEUTRALS[6]};

  :disabled {
    background-color: ${NEUTRALS[6]};
  }
`;

const BannerContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const BannerButtonWrapper = styled.div`
  margin-left: 40px;
`;

type Props = {
  actions :{
    clearSubmitRequestState :() => { type :string };
    getIncarcerationFacilities :RequestSequence;
    goToRoute :GoToRoute;
    submitIntakeForm :RequestSequence;
  };
  entitySetIdsByFqn :Map;
  incarcerationFacilities :List;
  newParticipantEKID :UUID;
  propertyTypeIdsByFqn :Map;
  requestStates :{
    SUBMIT_INTAKE_FORM :RequestState;
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
    if (entitySetIdsByFqn.has(MANUAL_JAILS_PRISONS)) {
      actions.getIncarcerationFacilities();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIdsByFqn,
      incarcerationFacilities,
      requestStates,
    } = this.props;
    if (!prevProps.entitySetIdsByFqn.equals(entitySetIdsByFqn)) {
      actions.getIncarcerationFacilities();
    }
    if (!prevProps.incarcerationFacilities.equals(incarcerationFacilities)) {
      this.updateSchema(incarcerationFacilities);
    }
    const wasSubmittingIntake :boolean = requestIsPending(prevProps.requestStates[SUBMIT_INTAKE_FORM]);
    const intakeWasSuccessful :boolean = requestIsSuccess(requestStates[SUBMIT_INTAKE_FORM]);
    if (wasSubmittingIntake && intakeWasSuccessful) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmitRequestState();
  }

  goToParticipantProfile = () => {
    const { actions, newParticipantEKID } = this.props;
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', newParticipantEKID));
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
      getClientHearingAssociations,
      getNeedsAssessmentAssociations
    )([]);
    associations = associations.concat(getOfficerAndAttorneyContactAssociations(formData, formDataToProcess));

    // delete incarcerationFacility EKID from formData
    formDataToProcess = deleteKeyFromFormData(
      formDataToProcess,
      [getPageSectionKey(1, 4), getEntityAddressKey(0, MANUAL_JAILS_PRISONS, ENTITY_KEY_ID)]
    );

    const needsAssessmentTypeKey :string = getEntityAddressKey(0, NEEDS_ASSESSMENT, TYPE);
    const allTheMappers = Map().withMutations((mappers :Map) => {
      const keyMappers = Map().withMutations((map :Map) => {
        map.set(needsAssessmentTypeKey, (value) => JSON.stringify(value));
      });
      mappers.set(KEY_MAPPERS, keyMappers);

      const valueMappers = Map().withMutations((map :Map) => {
        map.set(needsAssessmentTypeKey, (value) => JSON.parse(value));
      });
      mappers.set(VALUE_MAPPERS, valueMappers);
    });

    const entityData :Object = processEntityData(
      formDataToProcess,
      entitySetIdsByFqn,
      propertyTypeIdsByFqn,
      allTheMappers
    );
    const associationEntityData :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIdsByFqn,
      propertyTypeIdsByFqn
    );

    actions.submitIntakeForm({ associationEntityData, entityData });
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
            const reviewPage :boolean = page === 2;

            let primaryButtonText :string = 'Continue to Needs Assessment';
            if (needsAssessmentPage) primaryButtonText = 'Review Form';
            if (reviewPage) primaryButtonText = 'Submit';

            const submitForm = () => {
              this.onSubmit({ formData: pagedData });
            };

            const handleNext = reviewPage
              ? submitForm
              : validateAndSubmit;

            let header :string = 'Person Information';
            if (needsAssessmentPage) header = 'Needs Assessment';
            if (reviewPage) header = 'Review';

            const submissionSuccessful :boolean = requestIsSuccess(requestStates[SUBMIT_INTAKE_FORM]);

            return (
              <>
                <Banner
                    maxHeight="100px"
                    isOpen={submissionSuccessful}
                    mode="success">
                  <BannerContent>
                    <div>Intake submission was successful!</div>
                    <BannerButtonWrapper>
                      <Button onClick={this.goToParticipantProfile}>Go To Profile</Button>
                    </BannerButtonWrapper>
                  </BannerContent>
                </Banner>
                <Card>
                  <CustomCardHeader padding="30px">{ header }</CustomCardHeader>
                  <Form
                      formData={pagedData}
                      ref={formRef}
                      hideSubmit
                      onSubmit={onNext}
                      schema={personInformationPage ? hydratedSchema : schemas[page]}
                      uiSchema={uiSchemas[page]} />
                </Card>
                <ActionRow>
                  <ButtonsWrapper>
                    <DarkerButton
                        disabled={!(page > 0)}
                        onClick={onBack}>
                      Back
                    </DarkerButton>
                    <Button
                        isLoading={requestIsPending(requestStates[SUBMIT_INTAKE_FORM])}
                        mode="primary"
                        onClick={handleNext}>
                      { primaryButtonText }
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
  const personInformationForm :Map = state.get(INTAKE.INTAKE);
  const selectedOrgId :string = state.getIn([APP.APP, SELECTED_ORG_ID]);
  return {
    [INCARCERATION_FACILITIES]: personInformationForm.get(INCARCERATION_FACILITIES),
    [NEW_PARTICIPANT_EKID]: personInformationForm.get(NEW_PARTICIPANT_EKID),
    entitySetIdsByFqn: state.getIn([APP.APP, ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
    propertyTypeIdsByFqn: state.getIn([EDM.EDM, TYPE_IDS_BY_FQN, PROPERTY_TYPES], Map()),
    requestStates: {
      [SUBMIT_INTAKE_FORM]: personInformationForm.getIn([
        ACTIONS,
        SUBMIT_INTAKE_FORM,
        REQUEST_STATE
      ]),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearSubmitRequestState,
    getIncarcerationFacilities,
    goToRoute,
    submitIntakeForm,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(IntakeForm);
