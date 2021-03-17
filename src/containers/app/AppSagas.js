// @flow
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { push } from 'connected-react-router';
import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import { Types } from 'lattice';
import { AccountUtils, AuthUtils } from 'lattice-auth';
import {
  AppApiActions,
  AppApiSagas,
  DataApiActions,
  DataApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas
} from 'lattice-sagas';
import { DataUtils, LangUtils } from 'lattice-utils';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CURRENT_STAFF,
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  getCurrentStaff,
  initializeApplication,
} from './AppActions';

import Logger from '../../utils/Logger';
import * as Routes from '../../core/router/Routes';
import { submitDataGraph } from '../../core/data/DataActions';
import { submitDataGraphWorker } from '../../core/data/DataSagas';
import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ERR_ORGS_NOT_FOUND } from '../../utils/Errors';
import { APP_NAME } from '../../utils/constants/GeneralConstants';

const { PermissionTypes } = Types;
const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { getOrganization, getUsersWithRole } = OrganizationsApiActions;
const { getOrganizationWorker, getUsersWithRoleWorker } = OrganizationsApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isDefined } = LangUtils;
const {
  COUNTY_ID,
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
} = PROPERTY_TYPE_FQNS;

const LOG = new Logger('AppSagas');

const personGivenNamePTID = 'e9a0b4dc-5298-47c1-8837-20af172379a5';
const personSurnamePTID = '7b038634-a0b4-4ce1-a04f-85d1775937aa';
const idPTID = '5260cfbd-bfa4-40c1-ade5-cd83cc9f99b2';

/*
 *
 * AppActions.getCurrentStaff()
 *
 */

function* getCurrentStaffWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getCurrentStaff.request(action.id));
    const { selectedAppConfig, staffESID } = action.value;

    let response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: staffESID }));
    if (response.error) throw response.error;
    let staff :List = fromJS(response.data);

    const orgId = selectedAppConfig.organization?.id;
    response = yield call(getOrganizationWorker, getOrganization(orgId));
    if (response.error) throw response.error;

    const readRole :?Object = response.data?.roles?.find((role) => role.title?.includes(PermissionTypes.READ));
    const readRoleId :?UUID = readRole?.id;

    response = yield call(getUsersWithRoleWorker, getUsersWithRole({ organizationId: orgId, roleId: readRoleId }));
    if (response.error) throw response.error;

    const authorizedUsers = Set().withMutations((mutator) => {
      response.data.forEach((user) => {
        mutator.add(user);
      });
    }).toList();

    const entityData = {
      [staffESID]: []
    };

    authorizedUsers.forEach((user) => {
      const { email } = user;
      const staffMemberEntity = staff
        .find((staffMember :Map) => email === getPropertyValue(staffMember, [COUNTY_ID, 0]));
      if (!isDefined(staffMemberEntity)) {
        const newStaffEntity = {
          [idPTID]: [email],
          [personGivenNamePTID]: [email],
        };

        if (isDefined(user.given_name)) {
          newStaffEntity[personGivenNamePTID] = [user.given_name];
        }
        else if (isDefined(user.nickname)) {
          newStaffEntity[personGivenNamePTID] = [user.nickname];
        }

        if (isDefined(user.family_name)) {
          newStaffEntity[(personSurnamePTID :UUID)] = [user.family_name];
        }
        entityData[staffESID].push(newStaffEntity);
      }
    });

    if (entityData[staffESID].length) {
      response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData: {}, entityData }));
      if (response.error) throw response.error;
      const { entityKeyIds } = response.data;
      entityKeyIds[staffESID].forEach((staffEntityKeyId, index) => {
        const newStaffMember = Map().withMutations((mutator) => {
          const data = entityData[staffESID][index];
          mutator.set(FIRST_NAME, data[personGivenNamePTID][0]);
          if (data[personSurnamePTID]) mutator.set(LAST_NAME, data[personSurnamePTID][0]);
          mutator.set(COUNTY_ID, data[idPTID][0]);
          mutator.set(ENTITY_KEY_ID, staffEntityKeyId);
        });
        staff = staff.push(newStaffMember);
      });
    }

    const currentUser :Object = AuthUtils.getUserInfo();
    const { email } = currentUser;
    const userEntity :?Map = staff
      .find((staffMember :Map) => getPropertyValue(staffMember, [COUNTY_ID, 0]) === email);
    const currentUserEKID :?UUID = userEntity ? getEntityKeyId(userEntity) : '';

    staff = staff.filter((staffMember :Map) => {
      const userEmail = getPropertyValue(staffMember, [COUNTY_ID, 0]);
      return !userEmail.includes('openlattice');
    });

    yield put(getCurrentStaff.success(action.id, { currentUserEKID, staff }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getCurrentStaff.failure(action.id, error));
  }
  finally {
    yield put(getCurrentStaff.finally(action.id));
  }
}

function* getCurrentStaffWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CURRENT_STAFF, getCurrentStaffWorker);
}

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));
    const [edmResponse, appResponse] :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getAppWorker, getApp(APP_NAME))
    ]);
    if (edmResponse.error) throw edmResponse.error;
    if (appResponse.error) throw appResponse.error;

    const app = appResponse.data;
    const appConfigsResponse = yield call(getAppConfigsWorker, getAppConfigs(app.id));
    if (appConfigsResponse.error) throw appConfigsResponse.error;

    const appConfigs :Object[] = appConfigsResponse.data || [];
    if (!appConfigs.length) throw ERR_ORGS_NOT_FOUND;

    let organizations :Map = Map();
    let entitySetIdsByOrgId :Map = Map();
    let appTypesByOrgId :Map = Map();

    appConfigs.forEach((appConfig :Object) => {
      const { organization } :Object = appConfig;
      const { id: orgId } = organization;

      if (!fromJS(appConfig.config).isEmpty()) {
        organizations = organizations.set(orgId, {
          id: orgId,
          title: organization.title,
        });

        fromJS(APP_TYPE_FQNS).forEach((fqn) => {
          entitySetIdsByOrgId = entitySetIdsByOrgId.setIn(
            [orgId, fqn],
            appConfig.config[fqn]?.entitySetId
          );
          appTypesByOrgId = appTypesByOrgId.setIn(
            [orgId, appConfig.config[fqn]?.entitySetId],
            fqn
          );
        });
      }
    });

    // alphabetize
    entitySetIdsByOrgId = entitySetIdsByOrgId
      .map((orgFqnMap :Map) => orgFqnMap.sortBy((esid :UUID, fqn) => fqn.toString()));

    let selectedOrganizationId :UUID = '';
    if (!organizations.isEmpty() && !selectedOrganizationId.length) {
      selectedOrganizationId = organizations.valueSeq().getIn([0, 'id'], '');
    }
    const storedOrganizationId :?UUID = AccountUtils.retrieveOrganizationId();
    if (storedOrganizationId && organizations.has(storedOrganizationId)) {
      selectedOrganizationId = storedOrganizationId;
    }

    const selectedAppConfig = appConfigs.find((config) => config.organization?.id === selectedOrganizationId);
    const staffESID = entitySetIdsByOrgId.getIn([selectedOrganizationId, 'app.staff']);

    yield call(getCurrentStaffWorker, getCurrentStaff({ selectedAppConfig, staffESID }));

    yield put(initializeApplication.success(action.id, {
      appTypesByOrgId,
      entitySetIdsByOrgId,
      organizations,
      selectedOrganizationId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

function* switchOrganizationWorker(action :Object) :Generator<*, *, *> {
  const { value } = action;
  AccountUtils.storeOrganizationId(value.orgId);
  yield put(push(Routes.ROOT));
  yield call(initializeApplicationWorker, initializeApplication());
}

function* switchOrganizationWatcher() :Generator<*, *, *> {
  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

export {
  getCurrentStaffWatcher,
  getCurrentStaffWorker,
  initializeApplicationWatcher,
  initializeApplicationWorker,
  switchOrganizationWatcher,
  switchOrganizationWorker,
};
