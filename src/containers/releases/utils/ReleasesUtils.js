/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  DATA_SOURCE,
  DOB,
  ETHNICITY,
  PROJECTED_RELEASE_DATETIME,
  RACE,
  RELEASE_DATETIME,
} = PROPERTY_TYPE_FQNS;

const formatDataForReleasesByDateList = (searchedJailStays :List, peopleByJailStayEKID :Map) :List => {

  let releasesData :List = List();

  searchedJailStays.forEach((jailStay :Map) => {
    const release :Map = Map().withMutations((mutator) => {
      const {
        [PROJECTED_RELEASE_DATETIME]: projectedReleaseDateTime,
        [RELEASE_DATETIME]: releaseDateTime
      } = getEntityProperties(jailStay, [PROJECTED_RELEASE_DATETIME, RELEASE_DATETIME]);
      const releaseDateAsDateTime :DateTime = (releaseDateTime && releaseDateTime.length)
        ? DateTime.fromISO(releaseDateTime)
        : DateTime.fromISO(projectedReleaseDateTime);
      const releaseDate :string = releaseDateAsDateTime.isValid
        ? releaseDateAsDateTime.toLocaleString(DateTime.DATE_SHORT)
        : EMPTY_FIELD;
      mutator.set('releaseDate', releaseDate);
      mutator.set('releaseDateAsISODate', releaseDateAsDateTime.toISODate());

      const jailStayEKID :UUID = getEKID(jailStay);
      const person :Map = peopleByJailStayEKID.get(jailStayEKID, Map());
      const personName :string = getPersonFullName(person);
      mutator.set('name', personName);
      const {
        [DATA_SOURCE]: dataSource,
        [DOB]: dob,
        [ETHNICITY]: ethnicity,
        [RACE]: race,
      } = getEntityProperties(person, [DATA_SOURCE, DOB, ETHNICITY, RACE]);
      mutator.set('dataSource', dataSource);
      mutator.set('dob', dob);
      mutator.set('race', race);
      mutator.set('ethnicity', ethnicity);
      mutator.set('personEntity', person);
    });

    releasesData = releasesData.push(release);
  });

  return releasesData;
};

const formatDataForReleasesByPersonList = (searchedPeople :List, jailStaysByPersonEKID :Map) :List => {

  let releasesData :List = List();

  searchedPeople.forEach((person :Map) => {

    const release :Map = Map().withMutations((mutator) => {
      const personName :string = getPersonFullName(person);
      mutator.set('name', personName);
      const {
        [DATA_SOURCE]: dataSource,
        [DOB]: dob,
        [ETHNICITY]: ethnicity,
        [RACE]: race,
      } = getEntityProperties(person, [DATA_SOURCE, DOB, ETHNICITY, RACE]);
      mutator.set('dataSource', dataSource);
      mutator.set('dob', dob);
      mutator.set('race', race);
      mutator.set('ethnicity', ethnicity);

      const personEKID :UUID = getEKID(person);
      const jailStay :Map = jailStaysByPersonEKID.get(personEKID, '');
      const {
        [PROJECTED_RELEASE_DATETIME]: projectedReleaseDateTime,
        [RELEASE_DATETIME]: releaseDateTime
      } = getEntityProperties(jailStay, [PROJECTED_RELEASE_DATETIME, RELEASE_DATETIME]);
      const releaseDateAsDateTime :DateTime = (releaseDateTime && releaseDateTime.length)
        ? DateTime.fromISO(releaseDateTime)
        : DateTime.fromISO(projectedReleaseDateTime);
      const releaseDate :string = releaseDateAsDateTime.isValid
        ? releaseDateAsDateTime.toLocaleString(DateTime.DATE_SHORT)
        : EMPTY_FIELD;
      mutator.set('releaseDate', releaseDate);
      mutator.set('releaseDateAsISODate', releaseDateAsDateTime.toISODate());
      mutator.set('personEntity', person);
    });

    releasesData = releasesData.push(release);
  });

  return releasesData;
};

export {
  formatDataForReleasesByDateList,
  formatDataForReleasesByPersonList,
};
