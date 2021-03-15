// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  get,
  getIn,
} from 'immutable';
import {
  Button,
  Colors,
  DatePicker,
  Label,
  Modal,
  Select,
  Typography,
} from 'lattice-ui-kit';
import {
  DateTimeUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import {
  CREATE_SUBSCRIPTION,
  EXPIRE_SUBSCRIPTION,
  createSubscription,
  expireSubscription,
} from './TasksActions';

import ModalHeader from '../../components/modal/ModalHeader';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getSearchTerm } from '../../utils/SearchUtils';
import { EMPTY_FIELD } from '../../utils/constants/GeneralConstants';
import {
  APP,
  EDM,
  SHARED,
  TASK_MANAGER,
} from '../../utils/constants/ReduxStateConstants';

const { CURRENT_USER_EKID, ENTITY_SET_IDS_BY_ORG_ID, SELECTED_ORG_ID } = APP;
const { TYPE_IDS_BY_FQN, PROPERTY_TYPES } = EDM;
const { ACTIONS } = SHARED;
const { SUBSCRIPTIONS } = TASK_MANAGER;
const { FOLLOW_UPS } = APP_TYPE_FQNS;
const { ASSIGNEE_ID } = PROPERTY_TYPE_FQNS;
const { GREEN, NEUTRAL } = Colors;
const { isDefined } = LangUtils;
const { formatAsDate } = DateTimeUtils;
const { isPending } = ReduxUtils;

const TIME_ZONES = [
  'PST',
  'MST',
  'CST',
  'EST',
].map((timezone) => ({ label: timezone, value: timezone }));

const TextGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 10px 0;
  margin: 10px 0;
`;

const SubscriptionStatusWrapper = styled.div`
  align-items: center;
  color: ${(props) => (props.subscribed ? GREEN.G200 : NEUTRAL.N900)};
  display: grid;
  text-transform: uppercase;
  grid-template-columns: 20px 1fr;
  grid-gap: 0 5px;
`;

const ButtonGrid = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 20px 0;
  width: 100%;

  button {
    margin-left: 10px;
  }
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
};

const SubscriptionsModal = ({ isVisible, onClose } :Props) => {

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([APP.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    APP.APP,
    ENTITY_SET_IDS_BY_ORG_ID,
    selectedOrgId
  ], Map()));
  const followUpsESID = entitySetIds.get(FOLLOW_UPS);
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn([
    EDM.EDM,
    TYPE_IDS_BY_FQN,
    PROPERTY_TYPES
  ], Map()));
  const assigneeIdPTID = propertyTypeIds.get(ASSIGNEE_ID);
  const currentUserEKID = useSelector((store :Map) => store.getIn([APP.APP, CURRENT_USER_EKID]));
  const query :string = getSearchTerm(assigneeIdPTID, currentUserEKID);

  const subscriptions :List = useSelector((store) => store.getIn([TASK_MANAGER.TASK_MANAGER, SUBSCRIPTIONS]));
  const taskAssignmentSubscription = subscriptions.find((subscription) => {
    const subscriptionQuery = subscription.getIn(['constraints', 'constraints', 0, 'constraints', 0, 'searchTerm']);
    return subscriptionQuery === query;
  });
  const isSubscribed :boolean = isDefined(taskAssignmentSubscription);
  const subscriptionTimezone = getIn(taskAssignmentSubscription, ['alertMetadata', 'timezone']);
  const subscriptionExpirationISO = get(taskAssignmentSubscription, 'expiration');
  const expirationDefault = subscriptionExpirationISO ? DateTime.fromISO(subscriptionExpirationISO).toISODate() : '';

  const [timezone, setTimezone] = useState(subscriptionTimezone || 'CST');
  const [expiration, setExpiration] = useState(expirationDefault);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onExpirationDateChange = (date :string) => {
    const eodAsISO = DateTime.fromISO(date).endOf('day').toISO();
    setExpiration(eodAsISO);
  };

  const dispatch = useDispatch();

  const onSubscribe = () => {
    dispatch(createSubscription({
      expiration,
      type: 'CARE_ISSUE_ALERT',
      constraints: {
        entitySetIds: [followUpsESID],
        start: 0,
        maxHits: 10000,
        constraints: [{
          constraints: [{
            searchTerm: query,
            fuzzy: false
          }]
        }]
      },
      alertMetadata: {
        alertName: 'Reentry Task Assignment',
        timezone: timezone.value,
      }
    }));
  };
  const onCancel = () => {
    const id = taskAssignmentSubscription.get('id');
    dispatch(expireSubscription(id));
  };

  const createRequestState = useRequestState([TASK_MANAGER.TASK_MANAGER, ACTIONS, CREATE_SUBSCRIPTION]);
  const cancelRequestState = useRequestState([TASK_MANAGER.TASK_MANAGER, ACTIONS, EXPIRE_SUBSCRIPTION]);

  const withHeader = <ModalHeader onClose={onClose} title="Alerts for Task Assignment" />;

  const renderButtons = () => {
    if (isSubscribed) {
      if (isEditing) {
        return (
          <ButtonGrid>
            <Button onClick={() => setIsEditing(false)}>Discard</Button>
            <Button onClick={() => {}}>Save</Button>
          </ButtonGrid>
        );
      }
      return (
        <ButtonGrid>
          <Button isLoading={isPending(cancelRequestState)} onClick={onCancel}>Cancel Alert</Button>
          <Button color="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
        </ButtonGrid>
      );
    }

    if (isCreating) {
      return (
        <ButtonGrid>
          <Button onClick={() => setIsCreating(false)}>Discard</Button>
          <Button color="primary" isLoading={isPending(createRequestState)} onClick={onSubscribe}>Subscribe</Button>
        </ButtonGrid>
      );
    }
    return (
      <ButtonGrid>
        <Button color="secondary" onClick={() => setIsCreating(true)}>Edit</Button>
      </ButtonGrid>
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        viewportScrolling
        withHeader={withHeader}>
      <TextGrid>
        <Typography>
          Receive an email when a task is assigned to you.
        </Typography>
        <SubscriptionStatusWrapper subscribed={isSubscribed}>
          {
            isSubscribed
              ? <FontAwesomeIcon color={GREEN.G200} icon={faCheckCircle} />
              : <FontAwesomeIcon color={NEUTRAL.N800} icon={faTimesCircle} />
          }
          <Typography color="inherit">{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</Typography>
        </SubscriptionStatusWrapper>
      </TextGrid>
      <Label>Time Zone</Label>
      {
        isCreating
          ? (
            <Select
                onChange={setTimezone}
                options={TIME_ZONES}
                value={timezone} />
          )
          : (<Typography>{subscriptionTimezone || EMPTY_FIELD}</Typography>)
      }
      <Label>Expiration Date</Label>
      {
        isCreating || isEditing
          ? <DatePicker onChange={onExpirationDateChange} value={expiration} />
          : (
            <Typography>
              {subscriptionExpirationISO
                ? formatAsDate(subscriptionExpirationISO)
                : EMPTY_FIELD}
            </Typography>
          )
      }
      {renderButtons()}
    </Modal>
  );
};

export default SubscriptionsModal;
