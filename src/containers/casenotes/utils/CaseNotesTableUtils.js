/*
 * @flow
 */

import { List, Map } from 'immutable';
import { LangUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEKID, getEntityProperties } from '../../../utils/DataUtils';
import { sortEntitiesByDateProperty } from '../../../utils/Utils';

const { isDefined } = LangUtils;
const {
  DATETIME_END,
  FIRST_NAME,
  FUTURE_PLANS,
  GENERAL_NOTES,
  LAST_NAME,
  VISIT_REASON,
} = PROPERTY_TYPE_FQNS;

const formatNotesTableData = (meetings :List, staffByMeetingEKID :Map) :Object[] => {

  const filteredMeetings = meetings.filter((meeting :Map) => isDefined(staffByMeetingEKID.get(getEKID(meeting))));
  const sortedMeetings :List = sortEntitiesByDateProperty(filteredMeetings || List(), [DATETIME_END]);

  const tableData = [];
  sortedMeetings.reverse().forEach((meeting :Map) => {
    const {
      [DATETIME_END]: meetingCompletionDateTime,
      [FUTURE_PLANS]: plansForNextVisit,
      [GENERAL_NOTES]: assessmentNotes,
      [VISIT_REASON]: needsAddressed,
    } = getEntityProperties(meeting, [DATETIME_END, FUTURE_PLANS, GENERAL_NOTES, VISIT_REASON]);
    const date = DateTime.fromISO(meetingCompletionDateTime).toLocaleString(DateTime.DATE_SHORT);

    const meetingEKID :UUID = getEKID(meeting);
    const staffMember :Map = staffByMeetingEKID.get(meetingEKID, Map());
    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
      staffMember,
      [FIRST_NAME, LAST_NAME]
    );
    const staff = `${firstName} ${lastName}`;

    const meetingRow :Object = {
      id: meetingEKID,
      date,
      staff,
      needsAddressed,
      assessmentNotes,
      plansForNextVisit,
    };
    tableData.push(meetingRow);
  });
  return tableData;
};

/* eslint-disable import/prefer-default-export */
export {
  formatNotesTableData,
};
