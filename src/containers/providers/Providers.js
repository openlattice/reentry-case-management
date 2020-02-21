// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  Colors,
  DataGrid,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddProviderModal from './AddProviderModal';
import COLORS from '../../core/style/Colors';
import { GET_PROVIDERS, getProviders } from '../profile/events/EventActions';
import { getListOfContacts } from './utils/ProvidersUtils';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { getAddress } from '../../utils/FormattingUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EVENT, PROVIDERS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS } = Colors;
const { LOCATION, PROVIDER_STAFF } = APP_TYPE_FQNS;
const {
  DESCRIPTION,
  NAME,
  TYPE
} = PROPERTY_TYPE_FQNS;
const { CONTACT_INFO_BY_CONTACT_PERSON_EKID, PROVIDER_NEIGHBOR_MAP } = PROVIDERS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const labels = Map({
  name: 'Name',
  phone: 'Phone',
  email: 'Email'
});

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const Header = styled.div`
  color: ${COLORS.GRAY_01};
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const ProviderHeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ProviderHeader = styled(Header)`
  font-size: 20px;
  line-height: 27px;
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

type Props = {
  actions :{
    getProviders :RequestSequence;
  };
  contactInfoByContactPersonEKID :Map;
  providerNeighborMap :Map;
  providers :List;
  requestStates :{
    GET_PROVIDERS :RequestState;
  };
};

const Providers = ({
  actions,
  contactInfoByContactPersonEKID,
  providerNeighborMap,
  providers,
  requestStates,
} :Props) => {

  const [addModalVisible, setAddModalVisibility] = useState(false);

  useEffect(() => {
    actions.getProviders({ fetchNeighbors: true });
  }, [actions]);

  if (requestIsPending(requestStates[GET_PROVIDERS])) {
    return (
      <Spinner size="2x" />
    );
  }

  return (
    <>
      <HeaderRow>
        <Header>Service Providers</Header>
        <Button mode="primary" onClick={() => setAddModalVisibility(true)}>Add a Provider</Button>
      </HeaderRow>
      <CardStack>
        {
          providers.map((provider :Map) => {
            const providerEKID :UUID = getEKID(provider);
            const { [DESCRIPTION]: description, [NAME]: providerName, [TYPE]: types } = getEntityProperties(
              provider,
              [DESCRIPTION, NAME, TYPE]
            );
            const address :Map = providerNeighborMap.getIn([providerEKID, LOCATION, 0], Map());
            const formattedAddress = getAddress(address);
            const providerStaff :List = providerNeighborMap.getIn([providerEKID, PROVIDER_STAFF], List());
            const pointsOfContact :List = getListOfContacts(providerStaff, contactInfoByContactPersonEKID);
            return (
              <Card key={providerEKID}>
                <CardSegment padding="40px" vertical>
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
                  { !address.isEmpty() && (<Description>{ formattedAddress }</Description>) }
                  { description && (<Description>{ description }</Description>) }
                  {
                    !pointsOfContact.isEmpty() && (
                      <>
                        <PointOfContactTitle>Point of Contact</PointOfContactTitle>
                        {
                          pointsOfContact.map((contact :Map) => (
                            <DataGrid
                                key={contact.get('id')}
                                data={contact}
                                labelMap={labels} />
                          ))
                        }
                      </>
                    )
                  }
                </CardSegment>
              </Card>
            );
          })
        }
      </CardStack>
      <AddProviderModal isVisible={addModalVisible} onClose={() => setAddModalVisibility(false)} />
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const events :Map = state.get(EVENT.EVENT);
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  return {
    [CONTACT_INFO_BY_CONTACT_PERSON_EKID]: providers.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID),
    [EVENT.PROVIDERS]: events.get(EVENT.PROVIDERS),
    [PROVIDER_NEIGHBOR_MAP]: providers.get(PROVIDER_NEIGHBOR_MAP),
    requestStates: {
      [GET_PROVIDERS]: events.getIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getProviders,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Providers);
