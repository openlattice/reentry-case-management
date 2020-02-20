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
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EVENT } from '../../utils/constants/ReduxStateConstants';

const { NEUTRALS } = Colors;
const { NAME, TYPE } = PROPERTY_TYPE_FQNS;
const { PROVIDERS } = EVENT;

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

type Props = {
  actions :{
    getProviders :RequestSequence;
  };
  providers :List;
};

const Providers = ({ actions, providers } :Props) => {

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
            // $FlowFixMe
            const { [NAME]: providerName } = getEntityProperties(provider, [NAME]);
            const types = provider.get(TYPE);
            return (
              <Card key={getEKID(provider)}>
                <CardSegment padding="40px">
                  <ProviderHeaderRow>
                    <ProviderHeader>{ providerName }</ProviderHeader>
                    { types.map((type :string) => <TypeTag key={type}>{ type }</TypeTag>) }
                  </ProviderHeaderRow>
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
  return {
    [PROVIDERS]: events.get(PROVIDERS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getProviders,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(Providers);
