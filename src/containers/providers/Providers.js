// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, CardStack, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddProviderModal from './AddProviderModal';
import ProviderCard from './ProviderCard';
import COLORS from '../../core/style/Colors';
import { GET_PROVIDERS, getProviders } from './ProvidersActions';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { getEKID } from '../../utils/DataUtils';
import { PROVIDERS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { CONTACT_INFO_BY_CONTACT_PERSON_EKID, PROVIDERS_LIST, PROVIDER_NEIGHBOR_MAP } = PROVIDERS;
const { ACTIONS, REQUEST_STATE } = SHARED;

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

type Props = {
  actions :{
    getProviders :RequestSequence;
  };
  contactInfoByContactPersonEKID :Map;
  providerNeighborMap :Map;
  providersList :List;
  requestStates :{
    GET_PROVIDERS :RequestState;
  };
};

const Providers = ({
  actions,
  contactInfoByContactPersonEKID,
  providerNeighborMap,
  providersList,
  requestStates,
} :Props) => {

  const [addModalVisible, setAddModalVisibility] = useState(false);

  useEffect(() => {
    actions.getProviders({ fetchNeighbors: true });
  }, [actions]);

  return (
    <>
      <HeaderRow>
        <Header>Service Providers</Header>
        <Button mode="primary" onClick={() => setAddModalVisibility(true)}>Add a Provider</Button>
      </HeaderRow>
      {
        requestIsPending(requestStates[GET_PROVIDERS])
          ? (
            <Spinner size="2x" />
          )
          : (
            <CardStack>
              {
                providersList.map((provider :Map) => (
                  <ProviderCard
                      key={getEKID(provider)}
                      contactInfoByContactPersonEKID={contactInfoByContactPersonEKID}
                      provider={provider}
                      providerNeighborMap={providerNeighborMap} />
                ))
              }
            </CardStack>
          )
      }
      <AddProviderModal isVisible={addModalVisible} onClose={() => setAddModalVisibility(false)} />
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  return {
    [CONTACT_INFO_BY_CONTACT_PERSON_EKID]: providers.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID),
    [PROVIDERS_LIST]: providers.get(PROVIDERS_LIST),
    [PROVIDER_NEIGHBOR_MAP]: providers.get(PROVIDER_NEIGHBOR_MAP),
    requestStates: {
      [GET_PROVIDERS]: providers.getIn([ACTIONS, GET_PROVIDERS, REQUEST_STATE]),
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
