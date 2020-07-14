// @flow
import { dataSchema, uiSchema } from '../../../tasks/schemas/FollowUpSchemas';

const data = JSON.parse(JSON.stringify(dataSchema));
const ui = JSON.parse(JSON.stringify(uiSchema));

export {
  data as schema,
  ui as uiSchema,
};
