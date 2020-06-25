// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  DataGrid,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  EditButton,
  Label,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';

import EditContactInfoModal from './EditContactInfoModal';
import EditEmergencyContactsModal from './EditEmergencyContactsModal';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { formatEmergencyContactData, getAddress, getPersonContactData } from '../utils/ContactsUtils';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { LOCATION } = APP_TYPE_FQNS;
const expandIcon = <FontAwesomeIcon icon={faChevronDown} size="xs" />;
const personLabelMap = Map({
  phone: 'Phone number',
  email: 'Email',
  preferredMethod: 'Preferred method',
  preferredTime: 'Preferred time',
});

const AddressWrapper = styled.div`
  margin: 30px 0;
`;

const EmergencyContactsGrid = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: row;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 20px 30px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

type Props = {
  emergencyContactInfoByContact :Map;
  participantNeighbors :Map;
};

const ContactInfoCard = ({ emergencyContactInfoByContact, participantNeighbors } :Props) => {

  const [editModalVisible, setEditModalVisibility] = useState(false);
  const [editEmergencyModalVisible, setEditEmergencyVisibility] = useState(false);
  const contactData :Map = getPersonContactData(participantNeighbors);
  const addressList :List = participantNeighbors.get(LOCATION, List());
  const address :Map = addressList.get(0);
  const addressString :string = getAddress(address);

  const emergencyContactData :List = formatEmergencyContactData(emergencyContactInfoByContact, participantNeighbors);

  return (
    <Card>
      <CardHeaderWithButtons padding="30px" vertical={false}>
        <SmallCardHeaderTitle>Contacts</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
      <CardSegment>
        <DataGrid
            data={contactData}
            emptyString={EMPTY_FIELD}
            labelMap={personLabelMap}
            truncate />
        <AddressWrapper>
          <Label subtle>Address</Label>
          <div>{ addressString }</div>
        </AddressWrapper>
        <div>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={expandIcon}>
              <div>Emergency Contacts</div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <CardSegment padding="0">
                <EmergencyContactsGrid>
                  <Label subtle>Name</Label>
                  <Label subtle>Phone</Label>
                  <Label subtle>Email</Label>
                  <Label subtle>Relationship</Label>
                  {
                    emergencyContactData.map((row :Map, index :number) => (
                      <div key={index.toString()}>
                        <div>{ row.get('name') }</div>
                        <div>{ row.get('phone') }</div>
                        <div>{ row.get('email') }</div>
                        <div>{ row.get('relationship') }</div>
                      </div>
                    ))
                  }
                </EmergencyContactsGrid>
                <ButtonRow>
                  <Button onClick={() => setEditEmergencyVisibility(true)}>Edit</Button>
                </ButtonRow>
              </CardSegment>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </CardSegment>
      <EditContactInfoModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          participantNeighbors={participantNeighbors} />
      <EditEmergencyContactsModal
          isVisible={editEmergencyModalVisible}
          onClose={() => setEditEmergencyVisibility(false)}
          participantNeighbors={participantNeighbors} />
    </Card>
  );
};

export default ContactInfoCard;
