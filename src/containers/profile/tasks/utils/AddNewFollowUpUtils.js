// @flow
import {
  List,
  getIn,
  removeIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { isDefined } from '../../../../utils/LangUtils';
import { getValuesFromEntityList } from '../../../../utils/Utils';
import { deleteKeyFromFormData } from '../../../../utils/FormUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { FOLLOW_UPS_CATEGORIES, FOLLOW_UPS_STATUSES } from '../FollowUpsConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  APPEARS_IN,
  ASSIGNED_TO,
  FOLLOW_UPS,
  FULFILLS,
  MEETINGS,
  PEOPLE,
  PROVIDER,
  REENTRY_STAFF,
  REPORTED,
  SUBJECT_OF,
} = APP_TYPE_FQNS;
const {
  CATEGORY,
  DATETIME_COMPLETED,
  DESCRIPTION,
  ENTITY_KEY_ID,
  FIRST_NAME,
  GENERAL_DATETIME,
  GENERAL_NOTES,
  LAST_NAME,
  NAME,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const hydrateNewFollowUpForm = (
  schema :Object,
  reentryStaff :List,
  providersList :List,
  participants ? :List
) :Object => {

  let newSchema :Object = schema;
  const pageSection :string = getPageSectionKey(1, 1);

  const [staffValues, staffLabels] = getValuesFromEntityList(reentryStaff, [FIRST_NAME, LAST_NAME]);
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID), 'enum'],
    staffValues
  );
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID), 'enumNames'],
    staffLabels
  );
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID), 'enum'],
    staffValues
  );
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID), 'enumNames'],
    staffLabels
  );

  const [providersValues, providersLabels] = getValuesFromEntityList(providersList, [NAME]);
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID), 'enum'],
    providersValues
  );
  newSchema = setIn(
    newSchema,
    ['properties', pageSection, 'properties', getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID), 'enumNames'],
    providersLabels
  );

  if (isDefined(participants) && !participants.isEmpty()) {
    const [participantsValues, participantsLabels] = getValuesFromEntityList(participants, [FIRST_NAME, LAST_NAME]);
    newSchema = setIn(
      newSchema,
      ['properties', pageSection, 'properties', getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID), 'enum'],
      participantsValues
    );
    newSchema = setIn(
      newSchema,
      ['properties', pageSection, 'properties', getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID), 'enumNames'],
      participantsLabels
    );
  }

  return newSchema;
};

const preprocessFormData = (formData :Object) :Object => {
  if (!isDefined(formData)) return {};
  let updatedFormData :Object = formData;
  const pageSection :string = getPageSectionKey(1, 1);

  const isMeeting :boolean = getIn(formData, [
    pageSection, getEntityAddressKey(0, FOLLOW_UPS, CATEGORY)
  ]) === FOLLOW_UPS_CATEGORIES.MEETING;
  const dueDate :string = getIn(formData, [pageSection, getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)]);
  const dueDateTime :string = DateTime.fromSQL(dueDate.concat(' ', DateTime.local().toISOTime())).toISO();
  updatedFormData = setIn(
    updatedFormData,
    [pageSection, getEntityAddressKey(0, FOLLOW_UPS, GENERAL_DATETIME)],
    dueDateTime
  );

  updatedFormData = setIn(
    updatedFormData,
    [pageSection, getEntityAddressKey(0, FOLLOW_UPS, STATUS)],
    FOLLOW_UPS_STATUSES.PENDING
  );


  if (isMeeting) {
    updatedFormData = setIn(
      updatedFormData,
      [pageSection, getEntityAddressKey(0, MEETINGS, GENERAL_DATETIME)],
      dueDateTime
    );
    updatedFormData = setIn(
      updatedFormData,
      [pageSection, getEntityAddressKey(0, MEETINGS, GENERAL_NOTES)],
      getIn(updatedFormData, [pageSection, getEntityAddressKey(0, FOLLOW_UPS, DESCRIPTION)])
    );
  }

  return updatedFormData;
};

const getNewFollowUpAssociations = (formData :Object, personEKID :UUID) :Array<Array<*>> => {
  if (!isDefined(formData)) return [];
  const pageSection :string = getPageSectionKey(1, 1);
  const nowISO :string = DateTime.local().toISO();
  const associations :Array<Array<*>> = [];

  // participant:
  associations.push([SUBJECT_OF, personEKID, PEOPLE, 0, FOLLOW_UPS, {
    [DATETIME_COMPLETED.toString()]: [nowISO]
  }]);

  // reporter & assignee:
  const assigneeEKID :UUID = getIn(formData, [pageSection, getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID)]);
  associations.push([ASSIGNED_TO, assigneeEKID, REENTRY_STAFF, 0, FOLLOW_UPS, {
    [GENERAL_DATETIME.toString()]: [nowISO]
  }]);
  const reporterEKID :any = getIn(formData, [pageSection, getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)]);
  if (isDefined(reporterEKID)) associations.push([REPORTED, reporterEKID, REENTRY_STAFF, 0, FOLLOW_UPS, {}]);

  // provider/organization:
  const providerEKID :any = getIn(formData, [pageSection, getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)]);
  if (isDefined(providerEKID)) associations.push([APPEARS_IN, providerEKID, PROVIDER, 0, FOLLOW_UPS, {}]);

  // meetings:
  const category :any = getIn(formData, [pageSection, getEntityAddressKey(0, FOLLOW_UPS, CATEGORY)]);
  if (category === FOLLOW_UPS_CATEGORIES.MEETING) {
    associations.push([SUBJECT_OF, personEKID, PEOPLE, 0, MEETINGS, {
      [DATETIME_COMPLETED.toString()]: [nowISO]
    }]);
    associations.push([ASSIGNED_TO, assigneeEKID, REENTRY_STAFF, 0, MEETINGS, {
      [GENERAL_DATETIME.toString()]: [nowISO]
    }]);
    associations.push([FULFILLS, 0, MEETINGS, 0, FOLLOW_UPS, {}]);

    if (isDefined(reporterEKID)) associations.push([REPORTED, reporterEKID, REENTRY_STAFF, 0, MEETINGS, {}]);
    if (isDefined(providerEKID)) associations.push([APPEARS_IN, providerEKID, PROVIDER, 0, MEETINGS, {}]);
  }

  return associations;
};

const removeEKIDsFromFormData = (formData :Object) :Object => {
  if (!isDefined(formData)) return {};
  const pageSection :string = getPageSectionKey(1, 1);
  let updatedFormData :Object = formData;

  const reporterPath :string[] = [pageSection, getEntityAddressKey(0, REENTRY_STAFF, ENTITY_KEY_ID)];
  const assigneePath :string[] = [pageSection, getEntityAddressKey(1, REENTRY_STAFF, ENTITY_KEY_ID)];
  const providerPath :string[] = [pageSection, getEntityAddressKey(0, PROVIDER, ENTITY_KEY_ID)];
  const personPath :string[] = [pageSection, getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)];

  if (isDefined(getIn(formData, reporterPath))) updatedFormData = deleteKeyFromFormData(updatedFormData, reporterPath);
  if (isDefined(getIn(formData, assigneePath))) updatedFormData = deleteKeyFromFormData(updatedFormData, assigneePath);
  if (isDefined(getIn(formData, providerPath))) updatedFormData = deleteKeyFromFormData(updatedFormData, providerPath);
  if (isDefined(getIn(formData, providerPath))) updatedFormData = deleteKeyFromFormData(updatedFormData, personPath);

  return updatedFormData;
};

const getParticipantEKIDForNewTask = (personEKID :any, formData :Object) => {
  if (isDefined(personEKID)) return personEKID;
  const personEKIDInFormData = getIn(formData, [
    getPageSectionKey(1, 1),
    getEntityAddressKey(0, PEOPLE, ENTITY_KEY_ID)
  ]);
  return personEKIDInFormData;
};

export {
  getNewFollowUpAssociations,
  getParticipantEKIDForNewTask,
  hydrateNewFollowUpForm,
  preprocessFormData,
  removeEKIDsFromFormData,
};
