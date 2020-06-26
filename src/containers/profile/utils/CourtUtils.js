// @flow
import { List, Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getEKID } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { APPEARS_IN, HEARINGS, PEOPLE } = APP_TYPE_FQNS;

const { getPageSectionKey } = DataProcessingUtils;

const getHearingsEntityIndexToIdMap = (participantNeighbors :Map) :Map => {

  const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
    const courtHearings :List = participantNeighbors.get(HEARINGS, List());

    courtHearings.forEach((hearing :Map, index :number) => {
      const hearingEKID :UUID = getEKID(hearing);
      map.setIn([HEARINGS, -1, index], hearingEKID);
    });
  });
  return entityIndexToIdMap;
};

const preprocessNewCourtData = (formData :Object, originalFormData :Object) :Object => {

  const originalNumberOfCourtDates :number = originalFormData[getPageSectionKey(1, 1)].length;
  const hearingsWereAdded :boolean = formData[getPageSectionKey(1, 1)].length
    > originalNumberOfCourtDates;
  if (!hearingsWereAdded) return { [getPageSectionKey(1, 1)]: [] };

  const newCourtFormData = formData[getPageSectionKey(1, 1)].slice(originalNumberOfCourtDates);
  return { [getPageSectionKey(1, 1)]: newCourtFormData };
};

const getCourtHearingAssociations = (formData :Object, personEKID :UUID) :Array<Array<*>> => {

  const associations :Array<Array<*>> = [];
  const courtHearings :Object[] = formData[getPageSectionKey(1, 1)];

  courtHearings.forEach((hearingObj :Object, index :number) => {
    associations.push([APPEARS_IN, personEKID, PEOPLE, index, HEARINGS, {}]);
  });
  return associations;
};

const preprocessEditedCourtData = (
  formData :Object,
  originalFormData :Object,
  formDataWithCourtDataOnly :Object
) :Object => {

  const pageSection1 = getPageSectionKey(1, 1);
  const defaultReturnObject :Object = { editedCourtDataAsImmutable: Map(), originalCourtDataAsImmutable: Map() };

  if ((!formData[pageSection1].length && !originalFormData[pageSection1].length)) {
    return defaultReturnObject;
  }

  const allCourtHearingsInFormData :Object[] = formData[pageSection1];
  const numberOfNewHearings :number = formDataWithCourtDataOnly[pageSection1]
    ? formDataWithCourtDataOnly[pageSection1].length
    : 0;

  const editedHearings :Object[] = numberOfNewHearings
    ? allCourtHearingsInFormData.slice(0, allCourtHearingsInFormData.length - numberOfNewHearings)
    : allCourtHearingsInFormData;

  if (!Object.values(editedHearings).length) {
    return defaultReturnObject;
  }
  const editedCourtDataAsImmutable :List = fromJS(editedHearings);
  const originalCourtDataAsImmutable :List = fromJS(originalFormData[pageSection1]);

  const hearingsHaveChanged :boolean = !originalCourtDataAsImmutable.equals(editedCourtDataAsImmutable);
  if (!hearingsHaveChanged) return { editedCourtDataAsImmutable: Map(), originalCourtDataAsImmutable: Map() };
  return { editedCourtDataAsImmutable, originalCourtDataAsImmutable };
};

export {
  getCourtHearingAssociations,
  getHearingsEntityIndexToIdMap,
  preprocessEditedCourtData,
  preprocessNewCourtData,
};
