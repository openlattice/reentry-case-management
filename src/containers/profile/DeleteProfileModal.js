// @flow
import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ActionModal, CardSegment, Colors } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { DELETE_PARTICIPANT_AND_NEIGHBORS, deleteParticipantAndNeighbors } from './ProfileActions';

import ModalHeader from '../../components/modal/ModalHeader';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { RED } = Colors;

const DeleteMessage = styled(CardSegment)`
  max-width: 500px;
`;

const Warning = styled.div`
  color: ${RED.R300};
  margin-top: 20px;
`;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  personEKID :UUID;
};

const DeleteProfileModal = ({ isVisible, onClose, personEKID } :Props) => {
  const deleteRequestState = useSelector((store :Map) => store.getIn([
    PROFILE.PROFILE,
    ACTIONS,
    DELETE_PARTICIPANT_AND_NEIGHBORS,
    REQUEST_STATE
  ]));
  const standbyComponent = (
    <DeleteMessage padding="30px 0">
      <div>Are you sure you want to delete this profile?</div>
      <Warning>This action cannot be undone and will remove all records of this person.</Warning>
    </DeleteMessage>
  );
  const requestStateComponents = {
    STANDBY: standbyComponent
  };
  const withHeader = <ModalHeader onClose={onClose} title="Delete Person Profile" />;

  const dispatch = useDispatch();
  const deleteProfile = () => {
    dispatch(deleteParticipantAndNeighbors(personEKID));
  };
  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={deleteProfile}
        onClose={onClose}
        requestState={deleteRequestState}
        requestStateComponents={requestStateComponents}
        withHeader={withHeader} />
  );
};

export default DeleteProfileModal;
