// @flow
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

const requestIsPending = (requestState :RequestState) :boolean => requestState === RequestStates.PENDING;
const requestIsSuccess = (requestState :RequestState) :boolean => requestState === RequestStates.SUCCESS;
const requestIsFailure = (requestState :RequestState) :boolean => requestState === RequestStates.FAILURE;
const requestIsStandby = (requestState :RequestState) :boolean => requestState === RequestStates.STANDBY;

export {
  requestIsFailure,
  requestIsPending,
  requestIsStandby,
  requestIsSuccess,
};
