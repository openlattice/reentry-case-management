/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  DataGrid,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Label,
} from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import EditContactInfoModal from './EditContactInfoModal';
import EditEmergencyContactsModal from './EditEmergencyContactsModal';

import EditButton from '../../../components/buttons/EditButton';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../../utils/constants/GeneralConstants';
import { CardHeaderWithButtons, SmallCardHeaderTitle } from '../styled/GeneralProfileStyles';
import { formatEmergencyContactData, getAddress, getPersonContactData } from '../utils/ContactsUtils';

const { LOCATION } = APP_TYPE_FQNS;
const expandIcon = <FontAwesomeIcon icon={faChevronDown} size="xs" />;
const personLabelMap = Map({
  homePhone: 'Home phone',
  cellPhone: 'Cell phone',
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

const EmergencyContactText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

type Props = {
  emergencyContactInfoByContact :Map;
  participantNeighbors :Map;
  personEKID :UUID;
};

const ContactInfoCard = ({ emergencyContactInfoByContact, participantNeighbors, personEKID } :Props) => {

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
        <SmallCardHeaderTitle>Contact Information</SmallCardHeaderTitle>
        <EditButton onClick={() => setEditModalVisibility(true)}>Edit</EditButton>
      </CardHeaderWithButtons>
      <CardSegment>
        <DataGrid
            columns={3}
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
                {
                  !emergencyContactData.isEmpty() && (
                    <>
                      <EmergencyContactsGrid>
                        <Label subtle>Name</Label>
                        <Label subtle>Phone</Label>
                        <Label subtle>Email</Label>
                        <Label subtle>Relationship</Label>
                      </EmergencyContactsGrid>
                      {
                        emergencyContactData.map((row :Map, index :number) => (
                          <EmergencyContactsGrid key={index.toString()}>
                            <EmergencyContactText>{ row.get('name') }</EmergencyContactText>
                            <EmergencyContactText>{ row.get('phone') }</EmergencyContactText>
                            <EmergencyContactText>{ row.get('email') }</EmergencyContactText>
                            <EmergencyContactText>{ row.get('relationship') }</EmergencyContactText>
                          </EmergencyContactsGrid>
                        ))
                      }
                    </>
                  )
                }
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
          participantNeighbors={participantNeighbors}
          personEKID={personEKID} />
      <EditEmergencyContactsModal
          emergencyContactInfoByContact={emergencyContactInfoByContact}
          isVisible={editEmergencyModalVisible}
          onClose={() => setEditEmergencyVisibility(false)}
          participantNeighbors={participantNeighbors} />
    </Card>
  );
};

export default ContactInfoCard;
