/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DELETE_ENTITIES :'DELETE_ENTITIES' = 'DELETE_ENTITIES';
const deleteEntities :RequestSequence = newRequestSequence(DELETE_ENTITIES);

const SUBMIT_DATA_GRAPH :'SUBMIT_DATA_GRAPH' = 'SUBMIT_DATA_GRAPH';
const submitDataGraph :RequestSequence = newRequestSequence(SUBMIT_DATA_GRAPH);

const SUBMIT_PARTIAL_REPLACE :'SUBMIT_PARTIAL_REPLACE' = 'SUBMIT_PARTIAL_REPLACE';
const submitPartialReplace :RequestSequence = newRequestSequence(SUBMIT_PARTIAL_REPLACE);

export {
  DELETE_ENTITIES,
  SUBMIT_DATA_GRAPH,
  SUBMIT_PARTIAL_REPLACE,
  deleteEntities,
  submitDataGraph,
  submitPartialReplace,
};
