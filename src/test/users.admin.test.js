import { describe, expect, test } from '@jest/globals';
import { fetchAndParse, loginAsHardcodedAdminAndReturnToken } from './utils.js';

describe('users - admin', () => {
  test('/users returns page of users if user is admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    const { result, status } = await fetchAndParse('/users', token);
    expect(status).toBe(200);
    expect(result[0].id).toBe(1);
    expect(result[0].username).toBe('admin');
    expect(result[0].admin).toBe(true);
  });
  test('/users/:id returns page of user if user is admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    const { result, status } = await fetchAndParse('/users/1', token);
    expect(status).toBe(200);
    expect(result.id).toBe(1);
    expect(result.username).toBe('admin');
    expect(result.admin).toBe(true);
  });
});
