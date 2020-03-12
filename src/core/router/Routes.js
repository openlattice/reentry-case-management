/*
 * @flow
 */

const ROOT :string = '/';
const LOGIN :string = '/login';

const NEW_INTAKE :string = '/newintake';
const PARTICIPANTS :string = '/participants';
const PROVIDERS :string = '/providers';
const RELEASES :string = '/releases';
const REPORTS :string = '/reports';

const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:participantId`;

export {
  LOGIN,
  NEW_INTAKE,
  PARTICIPANTS,
  PARTICIPANT_PROFILE,
  PROVIDERS,
  RELEASES,
  REPORTS,
  ROOT,
};
