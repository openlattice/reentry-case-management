// @flow

// People

const SEXES :string[] = [
  'Male',
  'Female',
  'Unknown',
  'Decline to State',
  'Other',
  'Not Asked',
];

const GENDERS :string[] = [
  'Male',
  'Female',
  'Non-Binary',
  'Transgender (Male to Female)',
  'Transgender (Female to Male)',
  SEXES[2],
  SEXES[3],
  SEXES[4],
  SEXES[5],
];

const RACES :string[] = [
  'Asian',
  'Black',
  'Native American',
  'Pacific Islander',
  'White',
  'Multi-Racial',
  SEXES[4],
  SEXES[2],
];

const ETHNICITIES = [
  'Hispanic or Latino',
  'Not Hispanic or Latino',
  SEXES[2],
  SEXES[4],
];

const MARITAL_STATUSES :string[] = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Divorced',
  'Domestic Partner',
  'Common Law',
];

const EDUCATION_LEVELS :string[] = [
  'Elementary or High school, no diploma',
  '9th grade, no diploma',
  '10th grade, no diploma',
  '11th grade, no diploma',
  '12th grade, no diploma',
  'Elementary or High school, GED',
  'High school diploma',
  'College, no degree',
  'Associate\'s Degree',
  'Bachelor\'s Degree',
  'Postsecondary',
];

// Contact

const PREFERRED_COMMUNICATION_METHODS :string[] = [
  'Home Phone',
  'Cell Phone',
  'Text Message (Cell)',
  'Email',
];

const PREFERRED_COMMUNICATION_TIMES :string[] = [
  'Morning',
  'Afternoon',
  'Evening',
];

const CONTACT_RELATIONSHIPS :string[] = [
  'Spouse',
  'Mother',
  'Father',
  'Child',
  'Relative',
  'Partner',
  'Friend',
  'Other',
];

// Jail

const REFERRAL_SOURCES :string[] = [
  'NC DPS Prison',
  'NC DPS Probation/Parole',
  'County Jail (NC)',
  'Another State',
  'Community Agency',
  'Self-referral',
  'Relative/Friend',
];

// Parole/Probation

const PAROLE_PROBATION_CONSTS :Object = {
  PAROLE: 'Parole',
  PAROLE_OFFICER: 'Parole Officer',
  PROBATION: 'Probation',
  PROBATION_OFFICER: 'Probation Officer',
};

// Locations

const US_STATES :string[] = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
];

// Hearing Types

// source: http://www.occourts.org/directory/criminal/appearances-in-court/hearing-types.html
const HEARING_TYPES = [
  'Court Trial',
  'Formal/Informal Probation',
  'Held to Answer/Arraignment',
  'Jury Trial',
  'Motions',
  'Pre-Trial',
  'Preliminary Hearing',
  'Probation Modification',
  'Probation Violation Arraignment/Hearing',
  'Sentencing',
  'Terminal disposition',
  'Trial Setting Conference',
];

// Provider Types
const PROVIDER_TYPES :string[] = [
  'Housing Assistance',
  'Food & Provisions',
  'Employment Assistance',
  'Substance Abuse Treatment',
  'Mental Health Treatment',
  'Child Care',
  'Clothing',
  'Education / Vocational Training',
  'Family Support',
];

export {
  CONTACT_RELATIONSHIPS,
  EDUCATION_LEVELS,
  ETHNICITIES,
  GENDERS,
  HEARING_TYPES,
  MARITAL_STATUSES,
  PAROLE_PROBATION_CONSTS,
  PREFERRED_COMMUNICATION_METHODS,
  PREFERRED_COMMUNICATION_TIMES,
  PROVIDER_TYPES,
  RACES,
  REFERRAL_SOURCES,
  SEXES,
  US_STATES,
};
