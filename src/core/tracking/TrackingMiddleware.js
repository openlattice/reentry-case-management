/*
 * @flow
 */

import _isEmpty from 'lodash/isEmpty';
import _isFunction from 'lodash/isFunction';
import _isPlainObject from 'lodash/isPlainObject';
import { LOCATION_CHANGE } from 'connected-react-router';
import type { DispatchAPI, MiddlewareAPI } from 'redux';

type TrackingAction = {
  +type :string;
  tracking ?:Object;
};

type Action =
  | TrackingAction;

const matchTrackingAction = (action :TrackingAction) => (
  (_isPlainObject(action.tracking) && !_isEmpty(action.tracking))
  || (action.type === LOCATION_CHANGE)
);

export default (handlers :Object) => (
  (store :MiddlewareAPI<*, Action, *>) => (
    (next :DispatchAPI<Action>) => (
      (action :Action) => {
        const prevState = store.getState();
        const result = next(action);
        const nextState = store.getState();
        const isMatch = matchTrackingAction(action);
        if (isMatch === true && _isPlainObject(handlers) && !_isEmpty(handlers)) {
          const handler = handlers[action.type];
          if (_isFunction(handler)) {
            handler(action, prevState, nextState);
          }
        }
        return result;
      }
    )
  )
);
