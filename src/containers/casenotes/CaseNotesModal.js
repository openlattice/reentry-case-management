// @flow
import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { CardSegment, Label, Modal } from 'lattice-ui-kit';

import ModalHeader from '../../components/modal/ModalHeader';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../utils/DataUtils';

const {
  FIRST_NAME,
  FUTURE_PLANS,
  GENERAL_NOTES,
  LAST_NAME,
  VISIT_REASON,
} = PROPERTY_TYPE_FQNS;

const ModalCardSegment = styled(CardSegment)`
  max-width: 600px;
`;

const NotesAndHeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

type Props = {
  isVisible :boolean;
  meeting :Map;
  onClose :() => void;
  staffMember :Map;
};

const CaseNotesModal = ({
  isVisible,
  meeting,
  onClose,
  staffMember,
} :Props) => {

  const {
    [FUTURE_PLANS]: plansForNextVisit,
    [GENERAL_NOTES]: assessmentNotes,
    [VISIT_REASON]: needsAddressed,
  } = getEntityProperties(meeting, [FUTURE_PLANS, GENERAL_NOTES, VISIT_REASON]);

  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
    staffMember,
    [FIRST_NAME, LAST_NAME]
  );

  const renderHeader = () => (<ModalHeader onClose={onClose} title="Case Management Notes" />);
  return (
    <Modal
        isVisible={isVisible}
        onClickSecondary={onClose}
        onClose={onClose}
        textSecondary="Close"
        viewportScrolling
        withHeader={renderHeader}>
      <ModalCardSegment padding="30px 0 0">
        <NotesAndHeaderBlock>
          <Label subtle>Needs Addressed</Label>
          <div>{ needsAddressed }</div>
        </NotesAndHeaderBlock>
        <NotesAndHeaderBlock>
          <Label subtle>Assessment Notes</Label>
          <div>{ assessmentNotes }</div>
        </NotesAndHeaderBlock>
        <NotesAndHeaderBlock>
          <Label subtle>Plans for Next Visit</Label>
          <div>{ plansForNextVisit }</div>
        </NotesAndHeaderBlock>
        <NotesAndHeaderBlock>
          <Label subtle>Notes completed by</Label>
          <div>{ `${firstName} ${lastName}` }</div>
        </NotesAndHeaderBlock>
      </ModalCardSegment>
    </Modal>
  );
};

export default CaseNotesModal;
