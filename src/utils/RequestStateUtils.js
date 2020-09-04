import has from 'lodash/has';
// @flow
import isString from 'lodash/isString';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { isDefined } from './LangUtils';

const requestIsPending = (requestState :RequestState | void) :boolean => requestState === RequestStates.PENDING;
const requestIsSuccess = (requestState :RequestState | void) :boolean => requestState === RequestStates.SUCCESS;
const requestIsFailure = (requestState :RequestState | void) :boolean => requestState === RequestStates.FAILURE;
const requestIsStandby = (requestState :RequestState | void) :boolean => requestState === RequestStates.STANDBY;

const isRequestState = (requestState :string) :boolean => isString(requestState) && has(RequestStates, requestState);

const reduceRequestStates = (requestStates :RequestState[]) :RequestState | void => requestStates
  .reduce((acc, state) :RequestState | void => {
    if (!isDefined(acc) || !isRequestState(state)) {
      return undefined;
    }
    if (requestIsFailure(state)) {
      return RequestStates.FAILURE;
    }
    if (requestIsPending(state) || requestIsPending(acc)) {
      return RequestStates.PENDING;
    }
    if (requestIsSuccess(state) || requestIsSuccess(acc)) {
      return RequestStates.SUCCESS;
    }
    return RequestStates.STANDBY;
  });

export {
  isRequestState,
  reduceRequestStates,
  requestIsFailure,
  requestIsPending,
  requestIsStandby,
  requestIsSuccess,
};
