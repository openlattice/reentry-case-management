// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  CardStack,
  CheckboxSelect,
  Label,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddProviderModal from './AddProviderModal';
import ProviderCard from './ProviderCard';
import { GET_PROVIDERS, getProviders } from './ProvidersActions';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEKID } from '../../utils/DataUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { PROVIDER_TYPES } from '../../utils/constants/DataConstants';
import { APP, PROVIDERS, SHARED } from '../../utils/constants/ReduxStateConstants';

const { CONTACT_INFO_BY_CONTACT_PERSON_EKID, PROVIDERS_LIST, PROVIDER_NEIGHBOR_MAP } = PROVIDERS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { PROVIDER } = APP_TYPE_FQNS;
const { NAME, TYPE } = PROPERTY_TYPE_FQNS;

const checkboxSelectOptions = PROVIDER_TYPES.map((type :string) => ({ label: type, value: type }));

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const Header = styled.div`
  font-size: 26px;
  font-weight: 600;
  line-height: 35px;
`;

const SelectWrapper = styled.div`
  margin-bottom: 30px;
  max-width: 400px;
`;

type Props = {
  actions :{
    getProviders :RequestSequence;
  };
  contactInfoByContactPersonEKID :Map;
  entitySetIdsByFqn :Map;
  providerNeighborMap :Map;
  providersList :List;
  requestStates :{
    GET_PROVIDERS :RequestState;
  };
};

const Providers = ({
  actions,
  contactInfoByContactPersonEKID,
  entitySetIdsByFqn,
  providerNeighborMap,
  providersList,
  requestStates,
} :Props) => {

  const [addModalVisible, setAddModalVisibility] = useState(false);
  const [selectedTypes, selectType] = useState([]);
  const providerESIDLoaded :boolean = entitySetIdsByFqn.has(PROVIDER);
  useEffect(() => {
    if (providerESIDLoaded) actions.getProviders({ fetchNeighbors: true });
  }, [actions, providerESIDLoaded]);

  const sortedProvidersList = providersList.sortBy((provider :Map) => provider.getIn([NAME, 0]));
  const filterProvidersList = !selectedTypes || !selectedTypes.length
    ? sortedProvidersList
    : sortedProvidersList.filter((provider :Map) => {
      const selectedValues = selectedTypes.map((type :Object) => type.value);
      const providerTypes = provider.get(TYPE);
      let include :boolean = false;
      const typeFound = providerTypes.find((type :string) => selectedValues.includes(type));
      if (typeFound) include = true;
      return include;
    });

  return (
    <>
      <HeaderRow>
        <Header>Service Providers</Header>
        <Button color="primary" onClick={() => setAddModalVisibility(true)}>Add a Provider</Button>
      </HeaderRow>
      <SelectWrapper>
        <Label>Filter by Provider Type:</Label>
        <CheckboxSelect
            onChange={selectType}
            options={checkboxSelectOptions} />
      </SelectWrapper>
      {
        requestIsPending(requestStates[GET_PROVIDERS])
          ? (
            <Spinner size="2x" />
          )
          : (
            <CardStack>
              {
                filterProvidersList.map((provider :Map) => (
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
  const selectedOrgId :string = state.getIn([APP.APP, APP.SELECTED_ORG_ID]);
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  return {
    [CONTACT_INFO_BY_CONTACT_PERSON_EKID]: providers.get(CONTACT_INFO_BY_CONTACT_PERSON_EKID),
    [PROVIDERS_LIST]: providers.get(PROVIDERS_LIST),
    [PROVIDER_NEIGHBOR_MAP]: providers.get(PROVIDER_NEIGHBOR_MAP),
    entitySetIdsByFqn: state.getIn([APP.APP, APP.ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId], Map()),
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
