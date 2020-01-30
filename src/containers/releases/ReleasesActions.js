// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_RELEASES :'SEARCH_RELEASES' = 'SEARCH_RELEASES';
const searchReleases :RequestSequence = newRequestSequence(SEARCH_RELEASES);

export {
  SEARCH_RELEASES,
  searchReleases,
};
