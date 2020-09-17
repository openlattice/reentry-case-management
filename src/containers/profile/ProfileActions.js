// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_DELETE_REQUEST_STATE :'CLEAR_DELETE_REQUEST_STATE' = 'CLEAR_DELETE_REQUEST_STATE';
const clearDeleteRequestState = () => ({
  type: CLEAR_DELETE_REQUEST_STATE
});

const DELETE_PARTICIPANT_AND_NEIGHBORS :'DELETE_PARTICIPANT_AND_NEIGHBORS' = 'DELETE_PARTICIPANT_AND_NEIGHBORS';
const deleteParticipantAndNeighbors :RequestSequence = newRequestSequence(DELETE_PARTICIPANT_AND_NEIGHBORS);

const GET_ENROLLMENT_STATUS_NEIGHBORS :'GET_ENROLLMENT_STATUS_NEIGHBORS' = 'GET_ENROLLMENT_STATUS_NEIGHBORS';
const getEnrollmentStatusNeighbors :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUS_NEIGHBORS);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant :RequestSequence = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_NEIGHBORS :'GET_PARTICIPANT_NEIGHBORS' = 'GET_PARTICIPANT_NEIGHBORS';
const getParticipantNeighbors :RequestSequence = newRequestSequence(GET_PARTICIPANT_NEIGHBORS);

const GET_SUPERVISION_NEIGHBORS :'GET_SUPERVISION_NEIGHBORS' = 'GET_SUPERVISION_NEIGHBORS';
const getSupervisionNeighbors :RequestSequence = newRequestSequence(GET_SUPERVISION_NEIGHBORS);

const LOAD_PROFILE :'LOAD_PROFILE' = 'LOAD_PROFILE';
const loadProfile :RequestSequence = newRequestSequence(LOAD_PROFILE);

const LOAD_PERSON_INFO_FOR_EDIT :'LOAD_PERSON_INFO_FOR_EDIT' = 'LOAD_PERSON_INFO_FOR_EDIT';
const loadPersonInfoForEdit :RequestSequence = newRequestSequence(LOAD_PERSON_INFO_FOR_EDIT);

export {
  CLEAR_DELETE_REQUEST_STATE,
  DELETE_PARTICIPANT_AND_NEIGHBORS,
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  GET_SUPERVISION_NEIGHBORS,
  LOAD_PERSON_INFO_FOR_EDIT,
  LOAD_PROFILE,
  clearDeleteRequestState,
  deleteParticipantAndNeighbors,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  getSupervisionNeighbors,
  loadPersonInfoForEdit,
  loadProfile,
};
