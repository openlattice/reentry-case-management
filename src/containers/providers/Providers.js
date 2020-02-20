// @flow
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  Colors,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import COLORS from '../../core/style/Colors';
import { getProviders } from '../profile/events/EventActions';
import { getEKID, getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EVENT, PROVIDERS } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS } = Colors;
const { LOCATION, PROVIDER_STAFF } = APP_TYPE_FQNS;
const {
  DESCRIPTION,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  TYPE
} = PROPERTY_TYPE_FQNS;
const { PROVIDER_NEIGHBOR_MAP } = PROVIDERS;

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
  margin-top: 40px;
`;

const Address = styled(Description)`
  margin-top: 20px;
`;

type Props = {
  actions :{
    getProviders :RequestSequence;
  };
  providerNeighborMap :Map;
  providers :List;
};

const Providers = ({ actions, providerNeighborMap, providers } :Props) => {

  useEffect(() => {
    actions.getProviders({ fetchNeighbors: true });
  }, [actions]);

  return (
    <>
      <HeaderRow>
        <Header>Service Providers</Header>
        <Button mode="primary" onClick={() => {}}>Add a Provider</Button>
      </HeaderRow>
      <CardStack>
        {
          providers.map((provider :Map) => {
            const providerEKID :UUID = getEKID(provider);
            // $FlowFixMe
            const { [DESCRIPTION]: description, [NAME]: providerName } = getEntityProperties(
              provider,
              [DESCRIPTION, NAME]
            );
            const types = provider.get(TYPE);
            const address :Map = providerNeighborMap.getIn([providerEKID, LOCATION, 0], Map());
            const firstProviderStaff :Map = providerNeighborMap.getIn([providerEKID, PROVIDER_STAFF, 0], Map());
            // $FlowFixMe
            const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
              firstProviderStaff,
              [FIRST_NAME, LAST_NAME]
            );
            // { `${firstName} ${lastName}`}
            return (
              <Card key={providerEKID}>
                <CardSegment padding="40px" vertical>
                  <ProviderHeaderRow>
                    <ProviderHeader>{ providerName }</ProviderHeader>
                    { types.map((type :string) => <TypeTag key={type}>{ type }</TypeTag>) }
                  </ProviderHeaderRow>
                  { address && (<Address></Address>) }
                  { description && (<Description>{ description }</Description>) }
                  {
                    (firstName && lastName) && (
                      <PointOfContactTitle>Point of Contact</PointOfContactTitle>
                    )
                  }
                </CardSegment>
              </Card>
            );
          })
        }
      </CardStack>
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const events :Map = state.get(EVENT.EVENT);
  const providers :Map = state.get(PROVIDERS.PROVIDERS);
  return {
    [EVENT.PROVIDERS]: events.get(EVENT.PROVIDERS),
    [PROVIDER_NEIGHBOR_MAP]: providers.get(PROVIDER_NEIGHBOR_MAP),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getProviders,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Providers);
