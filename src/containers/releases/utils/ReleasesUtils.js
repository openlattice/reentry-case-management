// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  FIRST_NAME,
  LAST_NAME,
  NAME,
  PROJECTED_RELEASE_DATETIME,
} = PROPERTY_TYPE_FQNS;

const formatDataForReleasesList = (
  searchedJailStays :List,
  peopleByJailStayEKID :Map,
  jailsByJailStayEKID :Map
) :List => {

  let releasesData :List = List();

  searchedJailStays.forEach((jailStay :Map) => {
    let release :Map = Map();
    // $FlowFixMe
    const { [PROJECTED_RELEASE_DATETIME]: releaseDateTime } = getEntityProperties(
      jailStay,
      [PROJECTED_RELEASE_DATETIME]
    );
    const releaseDate :string = DateTime.fromISO(releaseDateTime).toLocaleString(DateTime.DATE_SHORT);
    release = release.set('releaseDate', releaseDate);

    const jailStayEKID :UUID = getEKID(jailStay);
    const person :Map = peopleByJailStayEKID.get(jailStayEKID, Map());
    // $FlowFixMe
    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(person, [FIRST_NAME, LAST_NAME]);
    const personName :string = `${firstName} ${lastName}`;
    release = release.set('name', personName);

    const facility :Map = jailsByJailStayEKID.get(jailStayEKID, Map());
    // $FlowFixMe
    const { [NAME]: facilityName } = getEntityProperties(facility, [NAME]);
    release = release.set('releasedFrom', facilityName);
    releasesData = releasesData.push(release);
  });

  return releasesData;
};

/* eslint-disable import/prefer-default-export */
export {
  formatDataForReleasesList,
};
