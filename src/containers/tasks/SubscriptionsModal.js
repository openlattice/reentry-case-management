// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';
import {
  Button,
  Colors,
  DatePicker,
  Label,
  Modal,
  Select,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import ModalHeader from '../../components/modal/ModalHeader';
import {
  APP,
  PARTICIPANT_FOLLOW_UPS,
  SHARED,
  TASK_MANAGER,
} from '../../utils/constants/ReduxStateConstants';

const { STAFF_MEMBERS } = APP;
const { SUBSCRIPTIONS } = TASK_MANAGER;
const { GREEN, NEUTRAL } = Colors;

const TIME_ZONES = [
  'PST',
  'MST',
  'CST',
  'EST',
].map((timeZone) => ({ label: timeZone, value: timeZone }));

const TextGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 10px 0;
  margin: 10px 0;
`;

const SubscriptionStatusWrapper = styled.div`
  align-items: center;
  color: ${(props) => (props.subscribed ? GREEN.G300 : NEUTRAL.N900)};
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

  const [timeZone, setTimeZone] = useState('CST');
  const [expirationDate, setExpirationDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useDispatch();

  const subscriptions :List = useSelector((store) => store.getIn([TASK_MANAGER.TASK_MANAGER, SUBSCRIPTIONS]));
  const isSubscribed :boolean = !subscriptions.isEmpty();

  const withHeader = <ModalHeader onClose={onClose} title="Alerts for Task Assignment" />;

  const renderButtons = () => {
    if (!subscriptions.isEmpty()) {
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
          <Button onClick={() => {}}>Cancel</Button>
          <Button color="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
        </ButtonGrid>
      );
    }

    if (isEditing) {
      return (
        <ButtonGrid>
          <Button onClick={() => setIsEditing(false)}>Discard</Button>
          <Button color="primary" onClick={() => {}}>Subscribe</Button>
        </ButtonGrid>
      );
    }
    return (
      <ButtonGrid>
        <Button color="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
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
        <SubscriptionStatusWrapper>
          {
            isSubscribed
              ? <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} />
              : <FontAwesomeIcon color={NEUTRAL.N800} icon={faTimesCircle} />
          }
          <Typography>{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</Typography>
        </SubscriptionStatusWrapper>
      </TextGrid>
      <Label>Time Zone</Label>
      <Select
          disabled={!isEditing}
          onChange={setTimeZone}
          options={TIME_ZONES} />
      <Label>Expiration Date</Label>
      <DatePicker disabled={!isEditing} onChange={setExpirationDate} />
      {renderButtons()}
    </Modal>
  );
};

export default SubscriptionsModal;
