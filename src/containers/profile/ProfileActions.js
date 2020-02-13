// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant :RequestSequence = newRequestSequence(GET_PARTICIPANT);

export {
  GET_PARTICIPANT,
  getParticipant,
};
