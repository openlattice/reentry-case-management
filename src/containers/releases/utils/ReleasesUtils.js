// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';

const {
  DATA_SOURCE,
  PROJECTED_RELEASE_DATETIME,
  RELEASE_DATETIME,
} = PROPERTY_TYPE_FQNS;

const formatDataForReleasesByDateList = (searchedJailStays :List, peopleByJailStayEKID :Map) :List => {

  let releasesData :List = List();

  searchedJailStays.forEach((jailStay :Map) => {
    let release :Map = Map();
    const {
      [PROJECTED_RELEASE_DATETIME]: projectedReleaseDateTime,
      [RELEASE_DATETIME]: releaseDateTime
    } = getEntityProperties(jailStay, [PROJECTED_RELEASE_DATETIME, RELEASE_DATETIME]);
    const releaseDate :string = (releaseDateTime && releaseDateTime.length)
      ? DateTime.fromISO(releaseDateTime).toLocaleString(DateTime.DATE_SHORT)
      : DateTime.fromISO(projectedReleaseDateTime).toLocaleString(DateTime.DATE_SHORT);
    release = release.set('releaseDate', releaseDate);

    const jailStayEKID :UUID = getEKID(jailStay);
    const person :Map = peopleByJailStayEKID.get(jailStayEKID, Map());
    const personName :string = getPersonFullName(person);
    release = release.set('name', personName);
    const { [DATA_SOURCE]: dataSource } = getEntityProperties(person, [DATA_SOURCE]);
    release = release.set('dataSource', dataSource);
    release = release.set('personEntity', person);
    releasesData = releasesData.push(release);
  });

  return releasesData;
};

const formatDataForReleasesByPersonList = (searchedPeople :List, jailStaysByPersonEKID :Map) :List => {

  let releasesData :List = List();

  searchedPeople.forEach((person :Map) => {
    let release :Map = Map();
    const personName :string = getPersonFullName(person);
    release = release.set('name', personName);
    const { [DATA_SOURCE]: dataSource } = getEntityProperties(person, [DATA_SOURCE]);
    release = release.set('dataSource', dataSource);

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
    release = release.set('releaseDate', releaseDate);
    release = release.set('personEntity', person);
    releasesData = releasesData.push(release);
  });

  return releasesData;
};

export {
  formatDataForReleasesByDateList,
  formatDataForReleasesByPersonList,
};
