/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_EDM_TYPES,
  getEntityDataModelTypes,
} from './EDMActions';
import { EDM, SHARED } from '../../utils/constants/ReduxStateConstants';

const { FQN } = Models;
const {
  ASSOCIATION_TYPES,
  ENTITY_TYPES,
  PROPERTY_TYPES,
  TYPES_BY_ID,
  TYPE_IDS_BY_FQN,
} = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;

const ENTITY_TYPE :string = 'entityType';
const TYPE :string = 'type';
const ID :string = 'id';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_EDM_TYPES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [TYPE_IDS_BY_FQN]: Map(),
  [TYPES_BY_ID]: Map(),
});

export default function edmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getEntityDataModelTypes.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntityDataModelTypes.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_EDM_TYPES, REQUEST_STATE], RequestStates.PENDING)
          .setIn([ACTIONS, GET_EDM_TYPES, seqAction.id], seqAction),
        SUCCESS: () => {
          const associationTypes :List = fromJS(seqAction.value.associationTypes);
          const entityTypes :List = fromJS(seqAction.value.entityTypes);
          const propertyTypes :List = fromJS(seqAction.value.propertyTypes);

          const typeIdsByFqn :Map<FQN, string> = Map().asMutable();
          const typesById :Map = Map().asMutable();

          associationTypes.forEach((type :Map) => {
            if (type.has(ENTITY_TYPE)) {
              const typeFqn :FQN = FQN.of(type.getIn([ENTITY_TYPE, TYPE]));
              const typeId :string = type.getIn([ENTITY_TYPE, ID]);
              typeIdsByFqn.setIn([ASSOCIATION_TYPES, typeFqn], typeId);
              typesById.setIn([ASSOCIATION_TYPES, typeId], type);
            }
          });

          entityTypes.forEach((type :Map) => {
            if (type.has(ID)) {
              const typeFqn :FQN = FQN.of(type.get(TYPE));
              const typeId :string = type.get(ID);
              typeIdsByFqn.setIn([ENTITY_TYPES, typeFqn], typeId);
              typesById.setIn([ENTITY_TYPES, typeId], type);
            }
          });

          propertyTypes.forEach((type :Map) => {
            if (type.has(ID)) {
              const typeFqn :FQN = FQN.of(type.get(TYPE));
              const typeId :string = type.get(ID);
              typeIdsByFqn.setIn([PROPERTY_TYPES, typeFqn], typeId);
              typesById.setIn([PROPERTY_TYPES, typeId], type);
            }
          });

          return state
            .set(TYPE_IDS_BY_FQN, typeIdsByFqn.asImmutable())
            .set(TYPES_BY_ID, typesById.asImmutable())
            .setIn([ACTIONS, GET_EDM_TYPES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_EDM_TYPES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_EDM_TYPES, REQUEST_STATE], seqAction.id)
      });
    }

    default:
      return state;
  }
}
