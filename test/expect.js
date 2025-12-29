import { use } from 'chai';

import Matchers from './matchers.js';

// add matchers
use(Matchers);

// expose chai expect
export {
  expect as default
} from 'chai';