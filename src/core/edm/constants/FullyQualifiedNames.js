/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;
const { OPENLATTICE_ID_FQN } = Constants;

const APP_TYPE_FQNS :Object = {

  APPEARS_IN: new FullyQualifiedName('app.appearsin_new'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  CONTACTED_VIA: new FullyQualifiedName('app.contactedvia'),
  CONTACT_INFO: new FullyQualifiedName('app.contactinformation'),
  COURT_CASES: new FullyQualifiedName('app.courtcases'),
  EDUCATION: new FullyQualifiedName('app.education'),
  EMPLOYEE: new FullyQualifiedName('app.employee'),
  HAS: new FullyQualifiedName('app.has'),
  HEARINGS: new FullyQualifiedName('app.hearings'),
  IS: new FullyQualifiedName('app.is_new'),
  JAILS_PRISONS: new FullyQualifiedName('app.jailsorprisons'),
  JAIL_STAYS: new FullyQualifiedName('app.jailstays'),
  JAIL_STAY_LENGTH: new FullyQualifiedName('app.jailstaylength'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  OF_LENGTH: new FullyQualifiedName('app.oflength'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PART_OF: new FullyQualifiedName('app.partof'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PERSON_DETAILS: new FullyQualifiedName('app.persondetails'),
  PERSON_DETAILS_CRIMINAL_JUSTICE: new FullyQualifiedName('app.person_details_criminal_justice'),
  PROBATION_PAROLE: new FullyQualifiedName('app.probationorparole'),
  PROBATION_PAROLE_OFFICER: new FullyQualifiedName('app.probation_or_parole_officer'),
  PROVIDED: new FullyQualifiedName('app.provided'),
  PROVIDED_TO: new FullyQualifiedName('app.providedto'),
  REFERRAL_REQUEST: new FullyQualifiedName('app.referralrequest'),
  REPRESENTED_BY: new FullyQualifiedName('app.representedby'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
};

const PROPERTY_TYPE_FQNS = {
  CITY: new FullyQualifiedName('location.city'),
  COUNTRY: new FullyQualifiedName('ol.country'),
  DATE: new FullyQualifiedName('general.date'),
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  EMAIL: new FullyQualifiedName('staff.email'),
  ENTITY_KEY_ID: OPENLATTICE_ID_FQN,
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  GENDER: new FullyQualifiedName('person.gender'),
  HIGHEST_EDUCATION_LEVEL: new FullyQualifiedName('person.highesteducation'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  MARITAL_STATUS: new FullyQualifiedName('person.maritalstatus'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  NAME: new FullyQualifiedName('ol.name'),
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
  PERSON_SEX: new FullyQualifiedName('nc.PersonSex'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
  PREFERRED_METHOD_OF_CONTACT: new FullyQualifiedName('ol.preferredmethod'),
  PROJECTED_RELEASE_DATETIME: new FullyQualifiedName('ol.projectedreleasedatetime'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  RECOGNIZED_END_DATETIME: new FullyQualifiedName('ol.recognizedenddate'),
  SEX_OFFENDER: new FullyQualifiedName('ol.sexoffender'),
  SOURCE: new FullyQualifiedName('ol.source'),
  SSN: new FullyQualifiedName('nc.SSN'),
  STREET: new FullyQualifiedName('location.street'),
  TITLE: new FullyQualifiedName('person.title'),
  TYPE: new FullyQualifiedName('ol.type'),
  US_STATE: new FullyQualifiedName('location.state'),
  ZIP: new FullyQualifiedName('location.zip'),
};

export {
  APP_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
