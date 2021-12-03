import { describeResource } from '../../../../build/development/index.js';
import { getUserById } from '../services';

const UserResource = describeResource('User', {
  get: async identity => (await getUserById(identity)) || null,
});

export default UserResource;
