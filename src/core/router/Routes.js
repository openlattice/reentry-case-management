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

const NEW_INTAKE_FORM :string = `${NEW_INTAKE}/form`;

const PARTICIPANT_ID :':participantId' = ':participantId';

const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/${PARTICIPANT_ID}`;
const PARTICIPANT_TASK_MANAGER :string = `${PARTICIPANT_PROFILE}/tasks`;
const EDIT_PARTICIPANT :string = `${PARTICIPANT_PROFILE}/edit`;

const EDIT_RELEASE_INFO :string = `${PARTICIPANT_PROFILE}/releaseinfo/edit`;

export {
  EDIT_PARTICIPANT,
  EDIT_RELEASE_INFO,
  LOGIN,
  NEW_INTAKE,
  NEW_INTAKE_FORM,
  PARTICIPANTS,
  PARTICIPANT_ID,
  PARTICIPANT_PROFILE,
  PARTICIPANT_TASK_MANAGER,
  PROVIDERS,
  RELEASES,
  REPORTS,
  ROOT,
  TASKS,
};
