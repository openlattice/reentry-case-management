// @flow
import { List, Map, get } from 'immutable';

import { EMPTY_FIELD, getPersonFullName } from '../../../utils/FormattingUtils';
import { getEKID } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { EMAIL, PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

const getListOfContacts = (staffEntities :List, contactInfoByContactPersonEKID :Map) :List => {
  let data :List = List();

  staffEntities.forEach((staff :Map) => {
    let dataObj :Map = Map({
      name: EMPTY_FIELD,
      phone: EMPTY_FIELD,
      email: EMPTY_FIELD,
    });
    const name :string = getPersonFullName(staff);
    dataObj = dataObj.set('name', name);
    const staffEKID :UUID = getEKID(staff);
    const contacts :List = contactInfoByContactPersonEKID.get(staffEKID, List());
    const phoneEntity :any = contacts.find((contact :Map) => isDefined(get(contact, PHONE_NUMBER)));
    if (isDefined(phoneEntity)) dataObj = dataObj.set('phone', get(phoneEntity, PHONE_NUMBER));
    const emailEntity :any = contacts.find((contact :Map) => isDefined(get(contact, EMAIL)));
    if (isDefined(emailEntity)) dataObj = dataObj.set('email', get(emailEntity, PHONE_NUMBER));
    dataObj = dataObj.set('id', staffEKID);
    data = data.push(dataObj);
  });
  return data;
};

export {
  getListOfContacts,
};
