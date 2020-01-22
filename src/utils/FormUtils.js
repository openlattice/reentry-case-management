// @flow
import { removeIn, setIn } from 'immutable';

import { isDefined } from './LangUtils';

const deleteKeyFromFormData = (formData :Object, path :string[]) :Object => {

  let updatedFormData :Object = formData;
  if (isDefined(formData) && path) {
    updatedFormData = removeIn(updatedFormData, path);
  }
  return updatedFormData;
};

const updateFormData = (
  formData :Object,
  path :string[],
  value :any
) :Object => {

  let updatedFormData :Object = formData;
  if (isDefined(formData) && path && isDefined(value)) {
    updatedFormData = setIn(
      updatedFormData,
      path,
      value
    );
  }
  return updatedFormData;
};

export {
  deleteKeyFromFormData,
  updateFormData,
};
