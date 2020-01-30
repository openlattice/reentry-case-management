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

const { FullyQualifiedName } = Models;
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

          const typeIdsByFqn :Map<FullyQualifiedName, string> = Map().asMutable();
          const typesById :Map = Map().asMutable();

          associationTypes.forEach((type :Map) => {
            if (type.has(ENTITY_TYPE)) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.getIn([ENTITY_TYPE, TYPE]));
              const typeId :string = type.getIn([ENTITY_TYPE, ID]);
              typeIdsByFqn.setIn([ASSOCIATION_TYPES, typeFqn], typeId);
              typesById.setIn([ASSOCIATION_TYPES, typeId], type);
            }
          });

          entityTypes.forEach((type :Map) => {
            if (type.has(ID)) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.get(TYPE));
              const typeId :string = type.get(ID);
              typeIdsByFqn.setIn([ENTITY_TYPES, typeFqn], typeId);
              typesById.setIn([ENTITY_TYPES, typeId], type);
            }
          });

          propertyTypes.forEach((type :Map) => {
            if (type.has(ID)) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.get(TYPE));
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

// export default function edmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
//
//   switch (action.type) {
//
//     case getEntityDataModelTypes.case(action.type): {
//       const seqAction :SequenceAction = action;
//       return getEntityDataModelTypes.reducer(state, action, {
//         REQUEST: () => state
//           .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.PENDING)
//           .setIn([GET_EDM_TYPES, seqAction.id], seqAction),
//         SUCCESS: () => {
//
//           const rawEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
//           const entityTypes :List = List().asMutable();
//           const entityTypesIndexMap :Map = Map().asMutable();
//
//           rawEntityTypes.forEach((et :EntityTypeObject, index :number) => {
//             try {
//               const entityType = new EntityTypeBuilder()
//                 .setBaseType(et.baseType)
//                 .setCategory(et.category)
//                 .setDescription(et.description)
//                 .setId(et.id)
//                 .setKey(et.key)
//                 .setPropertyTags(et.propertyTags)
//                 .setPropertyTypes(et.properties)
//                 .setSchemas(et.schemas)
//                 .setShards(et.shards)
//                 .setTitle(et.title)
//                 .setType(et.type)
//                 .build();
//               entityTypes.push(entityType.toImmutable());
//               entityTypesIndexMap.set(entityType.id, index);
//               entityTypesIndexMap.set(entityType.type, index);
//             }
//             catch (e) {
//               LOG.error(seqAction.type, e);
//               LOG.error(seqAction.type, et);
//             }
//           });
//
//           const rawPropertyTypes :PropertyTypeObject[] = seqAction.value.propertyTypes;
//           const propertyTypes :List = List().asMutable();
//           const propertyTypesIndexMap :Map = Map().asMutable();
//           const propertyTypeIds :Map = Map().asMutable();
//
//           rawPropertyTypes.forEach((pt :PropertyTypeObject, index :number) => {
//             try {
//               const propertyType = new PropertyTypeBuilder()
//                 .setAnalyzer(pt.analyzer)
//                 .setDataType(pt.datatype)
//                 .setDescription(pt.description)
//                 .setEnumValues(pt.enumValues)
//                 .setId(pt.id)
//                 .setIndexType(pt.indexType)
//                 .setMultiValued(pt.multiValued)
//                 .setPii(pt.pii)
//                 .setSchemas(pt.schemas)
//                 .setTitle(pt.title)
//                 .setType(pt.type)
//                 .build();
//               propertyTypes.push(propertyType.toImmutable());
//               propertyTypesIndexMap.set(propertyType.id, index);
//               propertyTypesIndexMap.set(propertyType.type, index);
//               propertyTypeIds.set(propertyType.type, propertyType.id);
//             }
//             catch (e) {
//               LOG.error(seqAction.type, e);
//               LOG.error(seqAction.type, pt);
//             }
//           });
//
//           return state
//             .set('entityTypes', entityTypes.asImmutable())
//             .set('entityTypesIndexMap', entityTypesIndexMap.asImmutable())
//             .set('propertyTypeIds', propertyTypeIds.asImmutable())
//             .set('propertyTypes', propertyTypes.asImmutable())
//             .set('propertyTypesIndexMap', propertyTypesIndexMap.asImmutable())
//             .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.SUCCESS);
//         },
//         FAILURE: () => state
//           .set('entityTypes', List())
//           .set('entityTypesIndexMap', Map())
//           .set('propertyTypeIds', Map())
//           .set('propertyTypes', List())
//           .set('propertyTypesIndexMap', Map())
//           .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.FAILURE),
//         FINALLY: () => state
//           .deleteIn([GET_EDM_TYPES, seqAction.id]),
//       });
//     }
//
//     default:
//       return state;
//   }
// }
