/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  ActionModal,
  Breadcrumbs,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { UUID } from 'lattice';

import { DELETE_PARTICIPANT_AND_NEIGHBORS, deleteParticipantAndNeighbors } from './ProfileActions';

import ModalHeader from '../../components/modal/ModalHeader';
import { PARTICIPANTS } from '../../core/router/Routes';
import { PROFILE, SHARED } from '../../utils/constants/ReduxStateConstants';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { PURPLE, RED } = Colors;

const DeleteMessage = styled(CardSegment)`
  max-width: 500px;
  padding: 30px 0;
`;

const Warning = styled.div`
  color: ${RED.R300};
  margin-top: 20px;
`;

const BreadcrumbsWrapper = styled.div`
  margin-top: 20px;
`;

const Breadcrumb = styled(NavLink)`
  color: ${PURPLE.P300};
  text-decoration: none;
`;

const standByComponent = (
  <DeleteMessage>
    <div>Are you sure you want to delete this profile?</div>
    <Warning>This action cannot be undone and will remove all records related to this person.</Warning>
  </DeleteMessage>
);

const successComponent = (
  <DeleteMessage>
    <div>Success!</div>
    <BreadcrumbsWrapper>
      <Breadcrumbs>
        <Breadcrumb to={PARTICIPANTS}>Back to participants</Breadcrumb>
      </Breadcrumbs>
    </BreadcrumbsWrapper>
  </DeleteMessage>
);

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
  const requestStateComponents = {
    STANDBY: standByComponent,
    SUCCESS: successComponent,
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
