// @flow

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;
const { OPENLATTICE_ID_FQN } = Constants;

const APP_TYPE_FQNS :Object = {
  ADDRESSES: new FullyQualifiedName('app.addresses'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin_new'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  ATTORNEYS: new FullyQualifiedName('app.attorneys'), // general.person
  CONTACTED_VIA: new FullyQualifiedName('app.contactedvia'),
  CONTACT_INFO: new FullyQualifiedName('app.contactinformation'),
  COURT_CASES: new FullyQualifiedName('app.courtcases'),
  EDUCATION: new FullyQualifiedName('app.education'),
  EMPLOYED_BY: new FullyQualifiedName('app.employedby'),
  EMPLOYEE: new FullyQualifiedName('app.employee'),
  EMPLOYMENT: new FullyQualifiedName('app.employment'),
  ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  FOLLOW_UPS: new FullyQualifiedName('app.issue'),
  FULFILLS: new FullyQualifiedName('app.fulfills'),
  HAS: new FullyQualifiedName('app.has'),
  HEARINGS: new FullyQualifiedName('app.hearings'),
  INMATES: new FullyQualifiedName('app.inmate'),
  IS: new FullyQualifiedName('app.is_new'),
  IS_REGISTERED_SEX_OFFENDER_IN: new FullyQualifiedName('app.isregisteredsexoffenderin'),
  JAILS_PRISONS: new FullyQualifiedName('app.jailsorprisons'),
  JAIL_STAYS: new FullyQualifiedName('app.jailstays'),
  JAIL_STAY_LENGTH: new FullyQualifiedName('app.jailstaylength'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_JAILS_PRISONS: new FullyQualifiedName('app.manualjailsprisons'),
  MANUAL_JAIL_STAYS: new FullyQualifiedName('app.manualjailstays'),
  MANUAL_JAIL_STAYS_LENGTH: new FullyQualifiedName('app.manualjailstaylength'),
  MANUAL_LOCATED_AT: new FullyQualifiedName('app.manuallocatedat'),
  MANUAL_OF_LENGTH: new FullyQualifiedName('app.manualoflength'),
  MANUAL_SUBJECT_OF: new FullyQualifiedName('app.manualsubjectof'),
  MEETINGS: new FullyQualifiedName('app.meetings'),
  NEEDS_ASSESSMENT: new FullyQualifiedName('app.needsassessment'), // ol.referralrequest
  OFFICERS: new FullyQualifiedName('app.officer'), // general.person
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
  PROVIDER: new FullyQualifiedName('app.organization'),
  PROVIDER_EMPLOYEES: new FullyQualifiedName('app.serviceprovideremployees'), // ol.employee
  PROVIDER_STAFF: new FullyQualifiedName('app.serviceproviderstaff'), // general.person
  REENTRY_EMPLOYEES: new FullyQualifiedName('app.staff_employee'), // ol.employee
  REENTRY_STAFF: new FullyQualifiedName('app.staff'), // general.person
  REFERRAL_REQUEST: new FullyQualifiedName('app.referralrequest'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  REPORTED: new FullyQualifiedName('app.reported'),
  REPRESENTED_BY: new FullyQualifiedName('app.representedby'),
  SEX_OFFENDER: new FullyQualifiedName('app.sexoffender'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
};

const PROPERTY_TYPE_FQNS = {
  CITY: new FullyQualifiedName('location.city'),
  COUNTRY: new FullyQualifiedName('ol.country'),
  COUNTY: new FullyQualifiedName('ol.county'),
  DATE: new FullyQualifiedName('general.date'),
  DATETIME_COMPLETED: new FullyQualifiedName('date.completeddatetime'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
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
  NOTES: new FullyQualifiedName('ol.notes'),
  OL_DATETIME: new FullyQualifiedName('ol.datetime'),
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
  PERSON_SEX: new FullyQualifiedName('nc.PersonSex'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
  PREFERRED_METHOD_OF_CONTACT: new FullyQualifiedName('ol.preferredmethod'),
  PROJECTED_RELEASE_DATETIME: new FullyQualifiedName('ol.projectedreleasedatetime'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  REASON: new FullyQualifiedName('ol.reason'),
  RECOGNIZED_END_DATETIME: new FullyQualifiedName('ol.recognizedenddate'),
  REGISTERED_FLAG: new FullyQualifiedName('ol.registeredflag'),
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
