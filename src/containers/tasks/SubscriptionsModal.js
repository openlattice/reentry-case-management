// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import {
  DatePicker,
  Grid,
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

const TIME_ZONES = [
  'PST',
  'MST',
  'CST',
  'EST',
].map((timeZone) => ({ label: timeZone, value: timeZone }));

type Props = {
  isVisible :boolean;
  onClose :() => void;
};

const SubscriptionsModal = ({ isVisible, onClose } :Props) => {

  const [timeZone, setTimeZone] = useState('CST');
  const [expirationDate, setExpirationDate] = useState('');

  const dispatch = useDispatch();

  const withHeader = <ModalHeader onClose={onClose} title="Alerts for Task Assignment" />

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textSecondary="Close"
        viewportScrolling
        withHeader={withHeader}>
      <Typography gutterBottom>
        Receive an email when a task is assigned to you.
      </Typography>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Label>Time Zone</Label>
          <Select
              onChange={setTimeZone}
              options={TIME_ZONES} />
        </Grid>
        <Grid item>
          <Label>Expiration Date</Label>
          <DatePicker onChange={setExpirationDate} />
        </Grid>
      </Grid>
    </Modal>
  );
};

export default SubscriptionsModal;
