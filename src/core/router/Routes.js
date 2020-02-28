/*
 * @flow
 */

const ROOT :string = '/';
const LOGIN :string = '/login';

const RELEASES :string = '/releases';
const NEW_INTAKE :string = '/newintake';
const PARTICIPANTS :string = '/participants';
const REPORTS :string = '/reports';

const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:participantId`;

export {
  LOGIN,
  NEW_INTAKE,
  PARTICIPANTS,
  PARTICIPANT_PROFILE,
  RELEASES,
  REPORTS,
  ROOT,
};
