// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_DELETE_REQUEST_STATE,
  DELETE_PARTICIPANT_AND_NEIGHBORS,
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PERSON_INFO_FOR_EDIT,
  LOAD_PROFILE,
  deleteParticipantAndNeighbors,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  loadPersonInfoForEdit,
  loadProfile,
} from './ProfileActions';
import {
  DELETE_EMERGENCY_CONTACT,
  EDIT_CONTACT_INFO,
  EDIT_EMERGENCY_CONTACTS,
  GET_EMERGENCY_CONTACT_INFO,
  deleteEmergencyContact,
  editContactInfo,
  editEmergencyContacts,
  getEmergencyContactInfo,
} from './contacts/ContactInfoActions';
import {
  DELETE_COURT_HEARING,
  EDIT_COURT_HEARINGS,
  deleteCourtHearing,
  editCourtHearings,
} from './court/CourtActions';
import { RECORD_ENROLLMENT_EVENT, recordEnrollmentEvent } from './events/EventActions';
import { CLEAR_EDIT_REQUEST_STATE, EDIT_NEEDS, editNeeds } from './needs/NeedsActions';
import {
  EDIT_EDUCATION,
  EDIT_PERSON,
  EDIT_PERSON_DETAILS,
  EDIT_STATE_ID,
  SUBMIT_EDUCATION,
  SUBMIT_PERSON_DETAILS,
  SUBMIT_STATE_ID,
  editEducation,
  editPerson,
  editPersonDetails,
  editStateId,
  submitEducation,
  submitPersonDetails,
  submitStateId,
} from './person/EditPersonActions';
import {
  EDIT_EVENT,
  EDIT_REFERRAL_SOURCE,
  EDIT_RELEASE_DATE,
  EDIT_RELEASE_INFO,
  SUBMIT_REFERRAL_SOURCE,
  SUBMIT_RELEASE_DATE,
  editEvent,
  editReferralSource,
  editReleaseDate,
  editReleaseInfo,
  submitReferralSource,
  submitReleaseDate,
} from './programhistory/ProgramHistoryActions';
import { EDIT_SEX_OFFENDER, editSexOffender } from './sexoffender/SexOffenderActions';
import {
  CREATE_NEW_FOLLOW_UP,
  MARK_FOLLOW_UP_AS_COMPLETE,
  createNewFollowUp,
  markFollowUpAsComplete,
} from './tasks/FollowUpsActions';
import {
  getEducationFormData,
  getPersonDetailsFormData,
  getPersonFormData,
  getStateIdFormData,
} from './utils/EditPersonUtils';

import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  CONTACT_NAME_BY_PROVIDER_EKID,
  EDUCATION_FORM_DATA,
  EMERGENCY_CONTACT_INFO_BY_CONTACT,
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PERSON_DETAILS_FORM_DATA,
  PERSON_FORM_DATA,
  PROVIDER_BY_STATUS_EKID,
  STATE_ID_FORM_DATA,
} = PROFILE;
const {
  CONTACT_INFO,
  EDUCATION,
  EMERGENCY_CONTACT,
  ENROLLMENT_STATUS,
  FOLLOW_UPS,
  HEARINGS,
  IS_EMERGENCY_CONTACT_FOR,
  LOCATION,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  PERSON_DETAILS,
  REFERRAL_REQUEST,
  SEX_OFFENDER,
  SEX_OFFENDER_REGISTRATION_LOCATION,
  STATE_ID,
} = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [CLEAR_DELETE_REQUEST_STATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_PARTICIPANT_AND_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_COURT_HEARINGS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_EDUCATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_EMERGENCY_CONTACTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_NEEDS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PERSON]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PERSON_DETAILS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_REFERRAL_SOURCE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_RELEASE_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_RELEASE_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_SEX_OFFENDER]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_STATE_ID]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_EMERGENCY_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUS_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_NEIGHBORS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [LOAD_PROFILE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [LOAD_PERSON_INFO_FOR_EDIT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_EDUCATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_PERSON_DETAILS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_REFERRAL_SOURCE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_RELEASE_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SUBMIT_STATE_ID]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CONTACT_NAME_BY_PROVIDER_EKID]: Map(),
  [EDUCATION_FORM_DATA]: Map(),
  [EMERGENCY_CONTACT_INFO_BY_CONTACT]: Map(),
  [PARTICIPANT]: Map(),
  [PARTICIPANT_NEIGHBORS]: Map(),
  [PERSON_DETAILS_FORM_DATA]: Map(),
  [PERSON_FORM_DATA]: Map(),
  [PROVIDER_BY_STATUS_EKID]: Map(),
  [STATE_ID_FORM_DATA]: Map(),
});

export default function profileReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_DELETE_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, REQUEST_STATE], RequestStates.STANDBY);
    }

    case CLEAR_EDIT_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_SEX_OFFENDER, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_COURT_HEARINGS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.STANDBY);
    }

    case createNewFollowUp.case(action.type): {
      return createNewFollowUp.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, action.id], action)
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { newFollowUp } = value;
          const participantNeighborMap :Map = state.get(PARTICIPANT_NEIGHBORS)
            .update(FOLLOW_UPS, List(), (followUps) => followUps.push(newFollowUp));
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighborMap)
            .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_NEW_FOLLOW_UP, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_NEW_FOLLOW_UP, action.id]),
      });
    }

    case deleteCourtHearing.case(action.type): {
      return deleteCourtHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, DELETE_COURT_HEARING, action.id], action)
          .setIn([ACTIONS, DELETE_COURT_HEARING, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const hearingEKID = action.value;
          let participantNeighbors = state.get(PARTICIPANT_NEIGHBORS);
          const hearingIndex = participantNeighbors.get(HEARINGS)
            .findIndex((hearing) => getEKID(hearing) === hearingEKID);
          if (hearingIndex !== -1) {
            participantNeighbors = participantNeighbors.deleteIn([HEARINGS, hearingIndex]);
          }
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, DELETE_COURT_HEARING, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_COURT_HEARING, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_COURT_HEARING, action.id]),
      });
    }

    case deleteEmergencyContact.case(action.type): {
      return deleteEmergencyContact.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, DELETE_EMERGENCY_CONTACT, action.id], action)
          .setIn([ACTIONS, DELETE_EMERGENCY_CONTACT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const emergencyContactEKID = action.value;
          const emergencyContactInfoByContact = state.get(EMERGENCY_CONTACT_INFO_BY_CONTACT)
            .delete(emergencyContactEKID);
          let participantNeighbors = state.get(PARTICIPANT_NEIGHBORS)
            .deleteIn([IS_EMERGENCY_CONTACT_FOR, emergencyContactEKID]);
          const emergencyContactIndex = participantNeighbors.get(EMERGENCY_CONTACT)
            .findIndex((contact) => getEKID(contact) === emergencyContactEKID);
          if (emergencyContactIndex !== -1) {
            participantNeighbors = participantNeighbors.deleteIn([EMERGENCY_CONTACT, emergencyContactIndex]);
          }
          return state
            .set(EMERGENCY_CONTACT_INFO_BY_CONTACT, emergencyContactInfoByContact)
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, DELETE_EMERGENCY_CONTACT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_EMERGENCY_CONTACT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_EMERGENCY_CONTACT, action.id]),
      });
    }

    case deleteParticipantAndNeighbors.case(action.type): {
      return deleteParticipantAndNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(CONTACT_NAME_BY_PROVIDER_EKID, Map())
          .set(EDUCATION_FORM_DATA, Map())
          .set(EMERGENCY_CONTACT_INFO_BY_CONTACT, Map())
          .set(PARTICIPANT, Map())
          .set(PARTICIPANT_NEIGHBORS, Map())
          .set(PERSON_DETAILS_FORM_DATA, Map())
          .set(PERSON_FORM_DATA, Map())
          .set(PROVIDER_BY_STATUS_EKID, Map())
          .set(STATE_ID_FORM_DATA, Map())
          .setIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_PARTICIPANT_AND_NEIGHBORS, action.id]),
      });
    }

    case editContactInfo.case(action.type): {
      return editContactInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_CONTACT_INFO, action.id], action)
          .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { newAddress, updatedContactInfoEntities } = action.value;
          const addressList = state.get(PARTICIPANT_NEIGHBORS)
            .set(LOCATION, List())
            .get(LOCATION).push(newAddress);
          return state
            .setIn([PARTICIPANT_NEIGHBORS, LOCATION], addressList)
            .setIn([PARTICIPANT_NEIGHBORS, CONTACT_INFO], updatedContactInfoEntities)
            .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_CONTACT_INFO, action.id]),
      });
    }

    case editCourtHearings.case(action.type): {
      return editCourtHearings.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_COURT_HEARINGS, action.id], action)
          .setIn([ACTIONS, EDIT_COURT_HEARINGS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const editedHearings = action.value;
          return state
            .setIn([PARTICIPANT_NEIGHBORS, HEARINGS], editedHearings)
            .setIn([ACTIONS, EDIT_COURT_HEARINGS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_COURT_HEARINGS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_COURT_HEARINGS, action.id]),
      });
    }

    case editEducation.case(action.type): {
      return editEducation.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_EDUCATION, action.id], action)
          .setIn([ACTIONS, EDIT_EDUCATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const updatedEducationData = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .updateIn([EDUCATION, 0], Map(), (oldEducation) => oldEducation
              .merge(updatedEducationData));
          const educationFormData :Object = getEducationFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(EDUCATION_FORM_DATA, fromJS(educationFormData))
            .setIn([ACTIONS, EDIT_EDUCATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_EDUCATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_EDUCATION, action.id]),
      });
    }

    case editEmergencyContacts.case(action.type): {
      return editEmergencyContacts.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, action.id], action)
          .setIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { editedAssociationMap, editedContactInfo, editedContactPeople } = action.value;
          return state
            .setIn([PARTICIPANT_NEIGHBORS, EMERGENCY_CONTACT], editedContactPeople)
            .setIn([PARTICIPANT_NEIGHBORS, IS_EMERGENCY_CONTACT_FOR], editedAssociationMap)
            .set(EMERGENCY_CONTACT_INFO_BY_CONTACT, editedContactInfo)
            .setIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_EMERGENCY_CONTACTS, action.id]),
      });
    }

    case editEvent.case(action.type): {
      return editEvent.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_EVENT, action.id], action)
          .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { newEnrollmentStatusData, newNeedsAssessmentData } = seqAction.value;
          let participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS);

          if (newEnrollmentStatusData && !newEnrollmentStatusData.isEmpty()) {
            const enrollmentStatusIndex = participantNeighbors.get(ENROLLMENT_STATUS, List())
              .findIndex((status :Map) => getEKID(status) === getEKID(newEnrollmentStatusData));
            if (isDefined(enrollmentStatusIndex)) {
              newEnrollmentStatusData.forEach((newValue, propertyFqn) => {
                participantNeighbors = participantNeighbors
                  .setIn([ENROLLMENT_STATUS, enrollmentStatusIndex, propertyFqn], newValue);
              });
            }
          }

          if (newNeedsAssessmentData && !newNeedsAssessmentData.isEmpty()) {
            participantNeighbors = participantNeighbors.updateIn(
              [NEEDS_ASSESSMENT, 0],
              Map(),
              (oldNeedsAssessment) => oldNeedsAssessment.mergeWith(
                (oldVal, newVal) => newVal,
                newNeedsAssessmentData
              )
            );
          }

          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_EVENT, action.id]),
      });
    }

    case editNeeds.case(action.type): {
      return editNeeds.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_NEEDS, action.id], action)
          .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          return state
            .setIn([PARTICIPANT_NEIGHBORS, NEEDS_ASSESSMENT, 0], seqAction.value)
            .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_NEEDS, action.id]),
      });
    }

    case editPerson.case(action.type): {
      return editPerson.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const updatedPersonData = action.value;
          const participant :Map = state.get(PARTICIPANT, Map())
            .merge(updatedPersonData);
          const personFormData :Object = getPersonFormData(participant);
          return state
            .set(PARTICIPANT, participant)
            .set(PERSON_FORM_DATA, fromJS(personFormData))
            .setIn([ACTIONS, EDIT_PERSON, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON, action.id]),
      });
    }

    case editPersonDetails.case(action.type): {
      return editPersonDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const updatedPersonDetailsData = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .updateIn([PERSON_DETAILS, 0], Map(), (oldPersonDetails) => oldPersonDetails
              .merge(updatedPersonDetailsData));
          const personDetailsFormData :Object = getPersonDetailsFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(PERSON_DETAILS_FORM_DATA, fromJS(personDetailsFormData))
            .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_DETAILS, action.id]),
      });
    }

    case editReferralSource.case(action.type): {
      return editReferralSource.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_REFERRAL_SOURCE, action.id], action)
          .setIn([ACTIONS, EDIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const editedReferralRequest :Map = seqAction.value;
          let participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS);
          if (editedReferralRequest) {
            participantNeighbors = participantNeighbors.updateIn(
              [REFERRAL_REQUEST, 0],
              Map(),
              (oldReferralRequest) => oldReferralRequest.merge(editedReferralRequest)
            );
          }
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, EDIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_REFERRAL_SOURCE, action.id]),
      });
    }

    case editReleaseDate.case(action.type): {
      return editReleaseDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_RELEASE_DATE, action.id], action)
          .setIn([ACTIONS, EDIT_RELEASE_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const editedJailStay :Map = seqAction.value;
          let participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS);
          if (editedJailStay) {
            participantNeighbors = participantNeighbors.updateIn(
              [MANUAL_JAIL_STAYS, 0],
              Map(),
              (oldJailStay) => oldJailStay.merge(editedJailStay)
            );
          }
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, EDIT_RELEASE_DATE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_RELEASE_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_RELEASE_DATE, action.id]),
      });
    }

    case editReleaseInfo.case(action.type): {
      return editReleaseInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_RELEASE_INFO, action.id], action)
          .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const newEntities :Map = seqAction.value;
          const newJailStay = newEntities.get(MANUAL_JAIL_STAYS);
          const newReferralRequest = newEntities.get(REFERRAL_REQUEST);
          let participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS);

          if (newJailStay) {
            if (participantNeighbors.get(MANUAL_JAIL_STAYS)) {
              participantNeighbors = participantNeighbors.setIn([MANUAL_JAIL_STAYS, 0], newJailStay);
            }
            else {
              participantNeighbors = participantNeighbors.set(MANUAL_JAIL_STAYS, List([newJailStay]));
            }
          }
          if (newReferralRequest) {
            if (participantNeighbors.get(REFERRAL_REQUEST)) {
              participantNeighbors = participantNeighbors.setIn([REFERRAL_REQUEST, 0], newReferralRequest);
            }
            else {
              participantNeighbors = participantNeighbors.set(REFERRAL_REQUEST, List([newReferralRequest]));
            }
          }

          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_RELEASE_INFO, action.id]),
      });
    }

    case editSexOffender.case(action.type): {
      return editSexOffender.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_SEX_OFFENDER, action.id], action)
          .setIn([ACTIONS, EDIT_SEX_OFFENDER, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { updatedSexOffenderList, updatedLocationList } = action.value;
          return state
            .setIn([PARTICIPANT_NEIGHBORS, SEX_OFFENDER], updatedSexOffenderList)
            .setIn([PARTICIPANT_NEIGHBORS, SEX_OFFENDER_REGISTRATION_LOCATION], updatedLocationList)
            .setIn([ACTIONS, EDIT_SEX_OFFENDER, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_SEX_OFFENDER, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_SEX_OFFENDER, action.id]),
      });
    }

    case editStateId.case(action.type): {
      return editStateId.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_STATE_ID, action.id], action)
          .setIn([ACTIONS, EDIT_STATE_ID, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const updatedStateIdData = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .updateIn([STATE_ID, 0], Map(), (oldStateId) => oldStateId
              .merge(updatedStateIdData));
          const stateIdFormData :Object = getStateIdFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(STATE_ID_FORM_DATA, fromJS(stateIdFormData))
            .setIn([ACTIONS, EDIT_STATE_ID, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_STATE_ID, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_STATE_ID, action.id]),
      });
    }

    case getEmergencyContactInfo.case(action.type): {

      return getEmergencyContactInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_EMERGENCY_CONTACT_INFO, action.id], action)
          .setIn([ACTIONS, GET_EMERGENCY_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          return state
            .set(EMERGENCY_CONTACT_INFO_BY_CONTACT, seqAction.value)
            .setIn([ACTIONS, GET_EMERGENCY_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_EMERGENCY_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_EMERGENCY_CONTACT_INFO, action.id]),
      });
    }

    case getEnrollmentStatusNeighbors.case(action.type): {

      return getEnrollmentStatusNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { contactNameByProviderEKID, providerByStatusEKID } = seqAction.value;
          return state
            .set(CONTACT_NAME_BY_PROVIDER_EKID, contactNameByProviderEKID)
            .set(PROVIDER_BY_STATUS_EKID, providerByStatusEKID)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUS_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_ENROLLMENT_STATUS_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_STATUS_NEIGHBORS, action.id]),
      });
    }

    case getParticipant.case(action.type): {

      return getParticipant.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, action.id], action)
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PARTICIPANT, value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, action.id]),
      });
    }

    case getParticipantNeighbors.case(action.type): {

      return getParticipantNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, action.id], action)
          .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(PARTICIPANT_NEIGHBORS, value)
            .setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_NEIGHBORS, action.id]),
      });
    }

    case loadProfile.case(action.type): {

      return loadProfile.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, LOAD_PROFILE, action.id], action)
          .setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([ACTIONS, LOAD_PROFILE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, LOAD_PROFILE, action.id]),
      });
    }

    case loadPersonInfoForEdit.case(action.type): {

      return loadPersonInfoForEdit.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, LOAD_PERSON_INFO_FOR_EDIT, action.id], action)
          .setIn([ACTIONS, LOAD_PERSON_INFO_FOR_EDIT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = action;
          const {
            educationFormData,
            personDetailsFormData,
            personFormData,
            stateIdFormData,
          } = value;
          return state
            .set(EDUCATION_FORM_DATA, fromJS(educationFormData))
            .set(PERSON_DETAILS_FORM_DATA, fromJS(personDetailsFormData))
            .set(PERSON_FORM_DATA, fromJS(personFormData))
            .set(STATE_ID_FORM_DATA, fromJS(stateIdFormData))
            .setIn([ACTIONS, LOAD_PERSON_INFO_FOR_EDIT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, LOAD_PERSON_INFO_FOR_EDIT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, LOAD_PERSON_INFO_FOR_EDIT, action.id]),
      });
    }

    case markFollowUpAsComplete.case(action.type): {
      return markFollowUpAsComplete.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, action.id], action)
          .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          const { followUpEKID, newFollowUp } = value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS)
            .update(FOLLOW_UPS, List(), (followUps) => {
              let followUpIndex :number = -1;
              let followUp :Map = followUps.find((entity :Map, index :number) => {
                if (getEKID(entity) === followUpEKID) {
                  followUpIndex = index;
                  return true;
                }
                return false;
              });
              followUp = followUp.mergeWith((oldVal, newVal) => newVal, newFollowUp);
              return followUps.set(followUpIndex, followUp);
            });
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, MARK_FOLLOW_UP_AS_COMPLETE, action.id]),
      });
    }

    case recordEnrollmentEvent.case(action.type): {

      return recordEnrollmentEvent.reducer(state, action, {
        SUCCESS: () => {
          const { value } = action;
          const { newEnrollmentStatus } = value;
          return state
            .updateIn(
              [PARTICIPANT_NEIGHBORS, ENROLLMENT_STATUS],
              List(),
              ((enrollmentStatuses) => enrollmentStatuses.concat(fromJS([newEnrollmentStatus])))
            )
            .setIn([ACTIONS, RECORD_ENROLLMENT_EVENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
      });
    }

    case submitEducation.case(action.type): {
      return submitEducation.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_EDUCATION, action.id], action)
          .setIn([ACTIONS, SUBMIT_EDUCATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const education = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .set(EDUCATION, List([education]));
          const educationFormData :Object = getEducationFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(EDUCATION_FORM_DATA, fromJS(educationFormData))
            .setIn([ACTIONS, SUBMIT_EDUCATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_EDUCATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_EDUCATION, action.id]),
      });
    }

    case submitPersonDetails.case(action.type): {
      return submitPersonDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_PERSON_DETAILS, action.id], action)
          .setIn([ACTIONS, SUBMIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const personDetails = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .set(PERSON_DETAILS, List([personDetails]));
          const personDetailsFormData :Object = getPersonDetailsFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(PERSON_DETAILS_FORM_DATA, fromJS(personDetailsFormData))
            .setIn([ACTIONS, SUBMIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_PERSON_DETAILS, action.id]),
      });
    }

    case submitReferralSource.case(action.type): {
      return submitReferralSource.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_REFERRAL_SOURCE, action.id], action)
          .setIn([ACTIONS, SUBMIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const newReferralRequest :Map = seqAction.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS)
            .set(REFERRAL_REQUEST, List([newReferralRequest]));
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, SUBMIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_REFERRAL_SOURCE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_REFERRAL_SOURCE, action.id]),
      });
    }

    case submitReleaseDate.case(action.type): {
      return submitReleaseDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_RELEASE_DATE, action.id], action)
          .setIn([ACTIONS, SUBMIT_RELEASE_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const newJailStay :Map = seqAction.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS)
            .set(MANUAL_JAIL_STAYS, List([newJailStay]));
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .setIn([ACTIONS, SUBMIT_RELEASE_DATE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_RELEASE_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_RELEASE_DATE, action.id]),
      });
    }

    case submitStateId.case(action.type): {
      return submitStateId.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_STATE_ID, action.id], action)
          .setIn([ACTIONS, SUBMIT_STATE_ID, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const stateId = action.value;
          const participantNeighbors :Map = state.get(PARTICIPANT_NEIGHBORS, Map())
            .set(STATE_ID, List([stateId]));
          const stateIdFormData :Object = getStateIdFormData(participantNeighbors);
          return state
            .set(PARTICIPANT_NEIGHBORS, participantNeighbors)
            .set(STATE_ID_FORM_DATA, fromJS(stateIdFormData))
            .setIn([ACTIONS, SUBMIT_STATE_ID, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_STATE_ID, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_STATE_ID, action.id]),
      });
    }

    default:
      return state;
  }
}
