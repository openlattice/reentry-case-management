// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ENROLLMENT_STATUS_NEIGHBORS :'GET_ENROLLMENT_STATUS_NEIGHBORS' = 'GET_ENROLLMENT_STATUS_NEIGHBORS';
const getEnrollmentStatusNeighbors :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUS_NEIGHBORS);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant :RequestSequence = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_NEIGHBORS :'GET_PARTICIPANT_NEIGHBORS' = 'GET_PARTICIPANT_NEIGHBORS';
const getParticipantNeighbors :RequestSequence = newRequestSequence(GET_PARTICIPANT_NEIGHBORS);

const LOAD_PROFILE :'LOAD_PROFILE' = 'LOAD_PROFILE';
const loadProfile :RequestSequence = newRequestSequence(LOAD_PROFILE);

const LOAD_PERSON_INFO_FOR_EDIT :'LOAD_PERSON_INFO_FOR_EDIT' = 'LOAD_PERSON_INFO_FOR_EDIT';
const loadPersonInfoForEdit :RequestSequence = newRequestSequence(LOAD_PERSON_INFO_FOR_EDIT);

export {
  GET_ENROLLMENT_STATUS_NEIGHBORS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_NEIGHBORS,
  LOAD_PERSON_INFO_FOR_EDIT,
  LOAD_PROFILE,
  getEnrollmentStatusNeighbors,
  getParticipant,
  getParticipantNeighbors,
  loadPersonInfoForEdit,
  loadProfile,
};
