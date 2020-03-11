// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOAD_TASKS :'LOAD_TASKS' = 'LOAD_TASKS';
const loadTasks :RequestSequence = newRequestSequence(LOAD_TASKS);

export {
  LOAD_TASKS,
  loadTasks,
};
