// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

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
const { ENROLLMENT_STATUS, FOLLOW_UPS } = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
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
              console.log('followUp, ', followUp);
              followUp = followUp.mergeWith((oldVal, newVal) => newVal, newFollowUp);
              return followUps.set(followUpIndex, followUp);
            });
          console.log('participantNeighbors, ', participantNeighbors);
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
