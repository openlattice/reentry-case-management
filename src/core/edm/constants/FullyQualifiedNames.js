/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

const APP_TYPE_FQNS :Object = {
  CONTACTED_VIA: new FullyQualifiedName('app.contactedvia'),
  CONTACT_INFO: new FullyQualifiedName('app.contactinformation'),
  EDUCATION: new FullyQualifiedName('app.education'),
  HAS: new FullyQualifiedName('app.has'),
  HEARINGS: new FullyQualifiedName('app.hearings'),
  JAIL_STAYS: new FullyQualifiedName('app.jailstays'),
  JAIL_STAY_LENGTH: new FullyQualifiedName('app.jailstaylength'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  OF_LENGTH: new FullyQualifiedName('app.oflength'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PERSON_DETAILS: new FullyQualifiedName('app.persondetails'),
  PERSON_DETAILS_CRIMINAL_JUSTICE: new FullyQualifiedName('app.person_details_criminal_justice'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
};

const PROPERTY_TYPE_FQNS = {
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
};

export {
  APP_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
