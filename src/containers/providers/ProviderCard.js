// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  EditButton,
  Label,
} from 'lattice-ui-kit';

import EditProviderModal from './EditProviderModal';
import COLORS from '../../core/style/Colors';
import { getAddress } from '../../utils/FormattingUtils';
import { getListOfContacts } from './utils/ProvidersUtils';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NEUTRALS } = Colors;
const { PROVIDER_ADDRESS, PROVIDER_STAFF } = APP_TYPE_FQNS;
const {
  DESCRIPTION,
  NAME,
  STREET,
  TYPE
} = PROPERTY_TYPE_FQNS;
const labels :string[] = [
  'Name',
  'Phone',
  'Email'
];

const Header = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const RowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ProviderHeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ProviderHeader = styled(Header)`
  font-size: 20px;
  line-height: 27px;
`;

const ContactLabelsRow = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: row;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 20px 30px;
`;

const TypeTag = styled.div`
  align-items: center;
  background-color: ${COLORS.GRAY_02};
  border-radius: 2px;
  color: ${NEUTRALS[0]};
  display: flex;
  font-size: 11px;
  font-weight: bold;
  justify-content: center;
  line-height: 15px;
  margin-left: 10px;
  padding: 5px 10px;
  text-transform: uppercase;
`;

const PointOfContactTitle = styled.div`
  color: ${COLORS.GRAY_01};
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  margin: 35px 0 27px;
`;

const Description = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 16px;
  line-height: 22px;
  margin-top: 20px;
`;

const ListText = styled(Description)`
  margin: 0;
`;

type Props = {
  contactInfoByContactPersonEKID :Map;
  provider :Map;
  providerNeighborMap :Map;
};

const ProviderCard = ({
  contactInfoByContactPersonEKID,
  provider,
  providerNeighborMap,
} :Props) => {

  const [editModalVisible, setEditModalVisibility] = useState(false);

  const providerEKID :UUID = getEKID(provider);
  const { [DESCRIPTION]: description, [NAME]: providerName, [TYPE]: types } = getEntityProperties(
    provider,
    [DESCRIPTION, NAME, TYPE]
  );
  const address :Map = providerNeighborMap.getIn([providerEKID, PROVIDER_ADDRESS, 0], Map());
  const addressIsEmpty :boolean = address.count() === 2 && address.getIn([STREET, 0]) === '';
  const formattedAddress = getAddress(address);
  const providerStaff :List = providerNeighborMap.getIn([providerEKID, PROVIDER_STAFF], List());
  const pointsOfContact :List = getListOfContacts(providerStaff, contactInfoByContactPersonEKID);

  return (
    <Card key={providerEKID}>
      <CardSegment padding="40px" vertical>
        <RowWrapper>
          <ProviderHeaderRow>
            <ProviderHeader>{ providerName }</ProviderHeader>
            {
              typeof types === 'string'
                ? (
                  <TypeTag>{ types }</TypeTag>
                )
                : (
                  types.map((type :string) => <TypeTag key={type}>{ type }</TypeTag>)
                )
            }
          </ProviderHeaderRow>
          <EditButton onClick={() => setEditModalVisibility(true)} />
        </RowWrapper>
        { !addressIsEmpty && (<Description>{ formattedAddress }</Description>) }
        { description && (<Description>{ description }</Description>) }
        {
          !pointsOfContact.isEmpty() && (
            <>
              <PointOfContactTitle>Point of Contact</PointOfContactTitle>
              <ContactLabelsRow>
                {
                  labels.map((label :string) => (
                    <Label key={label} subtle>{ label }</Label>
                  ))
                }
              </ContactLabelsRow>
              {
                pointsOfContact.map((contact :Map) => (
                  <ContactLabelsRow key={contact.get('id')}>
                    <ListText>{ contact.get('name') }</ListText>
                    <ListText>{ contact.get('phone') }</ListText>
                    <ListText>{ contact.get('email') }</ListText>
                  </ContactLabelsRow>
                ))
              }
            </>
          )
        }
      </CardSegment>
      <EditProviderModal
          address={address}
          contactInfoByContactPersonEKID={contactInfoByContactPersonEKID}
          isVisible={editModalVisible}
          onClose={() => setEditModalVisibility(false)}
          provider={provider}
          providerStaff={providerStaff} />
    </Card>
  );
};

export default ProviderCard;
