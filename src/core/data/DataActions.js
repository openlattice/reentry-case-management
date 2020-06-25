/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_OR_REPLACE_ASSOCIATION :'CREATE_OR_REPLACE_ASSOCIATION' = 'CREATE_OR_REPLACE_ASSOCIATION';
const createOrReplaceAssociation :RequestSequence = newRequestSequence(CREATE_OR_REPLACE_ASSOCIATION);

const DELETE_ENTITIES :'DELETE_ENTITIES' = 'DELETE_ENTITIES';
const deleteEntities :RequestSequence = newRequestSequence(DELETE_ENTITIES);

const SUBMIT_DATA_GRAPH :'SUBMIT_DATA_GRAPH' = 'SUBMIT_DATA_GRAPH';
const submitDataGraph :RequestSequence = newRequestSequence(SUBMIT_DATA_GRAPH);

const SUBMIT_PARTIAL_REPLACE :'SUBMIT_PARTIAL_REPLACE' = 'SUBMIT_PARTIAL_REPLACE';
const submitPartialReplace :RequestSequence = newRequestSequence(SUBMIT_PARTIAL_REPLACE);

export {
  CREATE_OR_REPLACE_ASSOCIATION,
  DELETE_ENTITIES,
  SUBMIT_DATA_GRAPH,
  SUBMIT_PARTIAL_REPLACE,
  createOrReplaceAssociation,
  deleteEntities,
  submitDataGraph,
  submitPartialReplace,
};
