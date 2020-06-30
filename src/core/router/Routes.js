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
const TASKS :string = '/tasks';

const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:participantId`;
const PARTICIPANT_TASK_MANAGER :string = `${PARTICIPANT_PROFILE}/tasks`;
const EDIT_PARTICIPANT :string = `${PARTICIPANT_PROFILE}/edit`;

export {
  EDIT_PARTICIPANT,
  LOGIN,
  NEW_INTAKE,
  PARTICIPANTS,
  PARTICIPANT_PROFILE,
  PARTICIPANT_TASK_MANAGER,
  PROVIDERS,
  RELEASES,
  REPORTS,
  ROOT,
  TASKS,
};
