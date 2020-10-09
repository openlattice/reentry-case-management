// @flow

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;
const { OPENLATTICE_ID_FQN } = Constants;

const APP_TYPE_FQNS :Object = {
  ADDRESSES: new FullyQualifiedName('app.addresses'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin_new'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  ATTORNEYS: new FullyQualifiedName('app.attorneys'), // general.person
  ATTORNEY_CONTACT_INFO: new FullyQualifiedName('app.attorneycontactinformation'),
  CONTACTED_VIA: new FullyQualifiedName('app.contactedvia'),
  CONTACT_INFO: new FullyQualifiedName('app.contactinformation'),
  COUNTY_ID: new FullyQualifiedName('app.countyids'),
  COURT_CASES: new FullyQualifiedName('app.courtcases'),
  EDUCATION: new FullyQualifiedName('app.education'),
  EMERGENCY_CONTACT: new FullyQualifiedName('app.emergencycontact'), // general.person
  EMERGENCY_CONTACT_INFO: new FullyQualifiedName('app.emergencycontactinformation'),
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
  IS_EMERGENCY_CONTACT_FOR: new FullyQualifiedName('app.isemergencycontactfor'),
  IS_REGISTERED_SEX_OFFENDER_IN: new FullyQualifiedName('app.isregisteredsexoffenderin'),
  JAILS_PRISONS: new FullyQualifiedName('app.jailsorprisons'),
  JAIL_STAYS: new FullyQualifiedName('app.jailstays'),
  JAIL_STAY_LENGTH: new FullyQualifiedName('app.jailstaylength'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_ASSIGNED_TO: new FullyQualifiedName('app.manualassignedto'),
  MANUAL_JAILS_PRISONS: new FullyQualifiedName('app.manualjailsprisons'),
  MANUAL_JAIL_STAYS: new FullyQualifiedName('app.manualjailstays'),
  MANUAL_JAIL_STAYS_LENGTH: new FullyQualifiedName('app.manualjailstaylength'),
  MANUAL_LOCATED_AT: new FullyQualifiedName('app.manuallocatedat'),
  MANUAL_OF_LENGTH: new FullyQualifiedName('app.manualoflength'),
  MANUAL_SUBJECT_OF: new FullyQualifiedName('app.manualsubjectof'),
  MEETINGS: new FullyQualifiedName('app.meetings'),
  NEEDS_ASSESSMENT: new FullyQualifiedName('app.needsassessment'), // ol.referralrequest
  OFFICERS: new FullyQualifiedName('app.officer'), // general.person
  OFFICER_CONTACT_INFO: new FullyQualifiedName('app.officercontactinformation'),
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
  PROVIDER_ADDRESS: new FullyQualifiedName('app.provideraddress'),
  PROVIDER_CONTACT_INFO: new FullyQualifiedName('app.providercontactinformation'),
  PROVIDER_EMPLOYEES: new FullyQualifiedName('app.serviceprovideremployees'), // ol.employee
  PROVIDER_STAFF: new FullyQualifiedName('app.serviceproviderstaff'), // general.person
  RECORDED_BY: new FullyQualifiedName('app.recordedby'),
  REENTRY_EMPLOYEES: new FullyQualifiedName('app.staff_employee'), // ol.employee
  REENTRY_STAFF: new FullyQualifiedName('app.staff'), // general.person
  REFERRAL_REQUEST: new FullyQualifiedName('app.referralrequest'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  REPORTED: new FullyQualifiedName('app.reported'),
  REPRESENTED_BY: new FullyQualifiedName('app.representedby'),
  SEX_OFFENDER: new FullyQualifiedName('app.sexoffender'),
  SEX_OFFENDER_REGISTRATION_LOCATION: new FullyQualifiedName('app.sexoffenderregistrationlocation'), // ol.location
  STATE_ID: new FullyQualifiedName('app.identification'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
};

const PROPERTY_TYPE_FQNS = {
  CATEGORY: new FullyQualifiedName('ol.category'),
  CITY: new FullyQualifiedName('location.city'),
  COUNTRY: new FullyQualifiedName('ol.country'),
  COUNTY: new FullyQualifiedName('ol.county'),
  COUNTY_ID: new FullyQualifiedName('nc.SubjectIdentification'),
  DATA_SOURCE: new FullyQualifiedName('ol.datasource'),
  DATE: new FullyQualifiedName('general.date'),
  DATETIME_COMPLETED: new FullyQualifiedName('date.completeddatetime'),
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  EFFECTIVE_DATE: new FullyQualifiedName('ol.effectivedate'),
  EMAIL: new FullyQualifiedName('staff.email'),
  ENTITY_KEY_ID: OPENLATTICE_ID_FQN,
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  FUTURE_PLANS: new FullyQualifiedName('ol.futureplans'),
  GENDER: new FullyQualifiedName('person.gender'),
  GENERAL_DATETIME: new FullyQualifiedName('general.datetime'),
  GENERAL_NOTES: new FullyQualifiedName('general.notes'),
  GENERAL_STATUS: new FullyQualifiedName('general.status'),
  HIGHEST_EDUCATION_LEVEL: new FullyQualifiedName('person.highesteducation'),
  IS_CELL_PHONE: new FullyQualifiedName('contact.cellphone'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  LEVEL: new FullyQualifiedName('ol.level'),
  MARITAL_STATUS: new FullyQualifiedName('person.maritalstatus'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  NAME: new FullyQualifiedName('ol.name'),
  NOTES: new FullyQualifiedName('ol.notes'),
  OL_DATETIME: new FullyQualifiedName('ol.datetime'),
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
  OL_TITLE: new FullyQualifiedName('ol.title'),
  PERSON_SEX: new FullyQualifiedName('nc.PersonSex'),
  PERSON_SUFFIX: new FullyQualifiedName('nc.PersonSuffix'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
  PREFERRED_METHOD_OF_CONTACT: new FullyQualifiedName('ol.preferredmethod'),
  PROJECTED_RELEASE_DATETIME: new FullyQualifiedName('ol.projectedreleasedatetime'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  REASON: new FullyQualifiedName('ol.reason'),
  RECOGNIZED_END_DATETIME: new FullyQualifiedName('ol.recognizedenddate'),
  REGISTERED_FLAG: new FullyQualifiedName('ol.registeredflag'),
  RELATIONSHIP: new FullyQualifiedName('ol.relationship'),
  RELEASE_DATETIME: new FullyQualifiedName('ol.releasedatetime'),
  SEX_OFFENDER: new FullyQualifiedName('ol.sexoffender'),
  SOURCE: new FullyQualifiedName('ol.source'),
  SSN: new FullyQualifiedName('nc.SSN'),
  STATUS: new FullyQualifiedName('ol.status'),
  STREET: new FullyQualifiedName('location.street'),
  STRING_NUMBER: new FullyQualifiedName('ol.stringnumber'),
  TITLE: new FullyQualifiedName('person.title'),
  TYPE: new FullyQualifiedName('ol.type'),
  US_STATE: new FullyQualifiedName('location.state'),
  VISIT_REASON: new FullyQualifiedName('visit.reason'),
  ZIP: new FullyQualifiedName('location.zip'),
};

export {
  APP_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
