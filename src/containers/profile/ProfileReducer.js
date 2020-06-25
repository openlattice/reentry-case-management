// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { isDefined } from '../../utils/LangUtils';
import {
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PROFILE,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  loadProfile,
} from './ProfileActions';
import { RECORD_ENROLLMENT_EVENT, recordEnrollmentEvent } from './events/EventActions';
import {
  CREATE_NEW_FOLLOW_UP,
  MARK_FOLLOW_UP_AS_COMPLETE,
  createNewFollowUp,
  markFollowUpAsComplete,
} from './tasks/FollowUpsActions';
import { CLEAR_EDIT_REQUEST_STATE, EDIT_NEEDS, editNeeds } from './needs/NeedsActions';
import {
  EDIT_EVENT,
  EDIT_RELEASE_INFO,
  editEvent,
  editReleaseInfo,
} from './programhistory/ProgramHistoryActions';
import { EDIT_CONTACT_INFO, editContactInfo } from './contacts/ContactInfoActions';
import { getEKID } from '../../utils/DataUtils';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  CONTACT_NAME_BY_PROVIDER_EKID,
  PARTICIPANT,
  PARTICIPANT_NEIGHBORS,
  PROVIDER_BY_STATUS_EKID,
} = PROFILE;
const {
  CONTACT_INFO,
  ENROLLMENT_STATUS,
  FOLLOW_UPS,
  LOCATION,
  MANUAL_JAIL_STAYS,
  NEEDS_ASSESSMENT,
  REFERRAL_REQUEST,
} = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [EDIT_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_NEEDS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_RELEASE_INFO]: {
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
  },
  [CONTACT_NAME_BY_PROVIDER_EKID]: Map(),
  [PARTICIPANT]: Map(),
  [PARTICIPANT_NEIGHBORS]: Map(),
  [PROVIDER_BY_STATUS_EKID]: Map(),
});

export default function profileReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case CLEAR_EDIT_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, EDIT_NEEDS, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_RELEASE_INFO, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_EVENT, REQUEST_STATE], RequestStates.STANDBY)
        .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.STANDBY);
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

    case editContactInfo.case(action.type): {
      return editContactInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_CONTACT_INFO, action.id], action)
          .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { newAddress, newContacts } = action.value;
          return state
            .setIn([PARTICIPANT_NEIGHBORS, LOCATION, 0], newAddress)
            .setIn([PARTICIPANT_NEIGHBORS, CONTACT_INFO], newContacts)
            .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_CONTACT_INFO, action.id]),
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

    default:
      return state;
  }
}
