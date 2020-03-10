/*
 * @flow
 */

const ROOT :string = '/';
const LOGIN :string = '/login';

const RELEASES :string = '/releases';
const NEW_INTAKE :string = '/newintake';
const PARTICIPANTS :string = '/participants';
const PROVIDERS :string = '/providers';

const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:participantId`;
const PARTICIPANT_TASK_MANAGER :string = `${PARTICIPANT_PROFILE}/tasks`;

export {
  LOGIN,
  NEW_INTAKE,
  PARTICIPANTS,
  PARTICIPANT_PROFILE,
  PARTICIPANT_TASK_MANAGER,
  PROVIDERS,
  RELEASES,
  ROOT,
};
