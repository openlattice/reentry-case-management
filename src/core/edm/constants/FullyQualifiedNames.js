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
  CITY: new FullyQualifiedName('location.city'),
  COUNTRY: new FullyQualifiedName('ol.country'),
  DATE: new FullyQualifiedName('general.date'),
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  EMAIL: new FullyQualifiedName('staff.email'),
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  GENDER: new FullyQualifiedName('bhr.gender'),
  HIGHEST_EDUCATION_LEVEL: new FullyQualifiedName('person.highesteducation'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  MARITAL_STATUS: new FullyQualifiedName('person.maritalstatus'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
  PREFERRED_METHOD_OF_CONTACT: new FullyQualifiedName('ol.preferredmethod'),
  PROJECTED_RELEASE_DATETIME: new FullyQualifiedName('ol.projectedreleasedatetime'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  SEX_OFFENDER: new FullyQualifiedName('ol.sexoffender'),
  SSN: new FullyQualifiedName('nc.SSN'),
  STREET: new FullyQualifiedName('location.street'),
  TYPE: new FullyQualifiedName('ol.type'),
  US_STATE: new FullyQualifiedName('location.state'),
  ZIP: new FullyQualifiedName('location.zip'),
};

export {
  APP_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
