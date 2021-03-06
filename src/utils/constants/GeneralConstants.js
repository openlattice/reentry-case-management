/*
 * @flow
 */

const APP_NAME = 'reentry case management';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
const DATA_URL_IMG_PNG_PREFIX :string = 'data:image/png;base64,';
// NOTE: this regex has only been tested for png, which has a different encoding format than jpeg and webp
const DATA_URL_PREFIX_REGEX :RegExp = /^data:image\/[a-z]+;base64,/;

const DST :string = 'dst';
const SRC :string = 'src';

const EMPTY_FIELD :string = '----';
const SPACED_STRING :string = ' ';

export {
  APP_NAME,
  DATA_URL_IMG_PNG_PREFIX,
  DATA_URL_PREFIX_REGEX,
  DST,
  EMPTY_FIELD,
  SPACED_STRING,
  SRC,
};
