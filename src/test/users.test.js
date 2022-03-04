import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';
import {
  fetchAndParse,
  loginAndReturnToken,
  postAndParse,
  randomValue,
} from './utils.js';

dotenv.config();
const { TOKEN_LIFETIME: tokenLifetime = '3600' } = process.env;
describe('users', () => {
  // Random username for all the following tests, highly unlikely we'll create
  // the same user twice
  const rnd = randomValue();
  const name = 'test-user';
  const username = `user${rnd}`;
  const password = '1234567890';

  test('Create user, missing data', async () => {
    const data = null;
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(2);
  });

  test('Create user, missing name & password', async () => {
    const data = { username };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
  });

  test('Create user, username too long', async () => {
    const data = { username: 'x'.repeat(257), password, name };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual(
      'username is required, max 64 characters'
    );
  });

  test('Create user, too short password', async () => {
    const data = { username, password: '123', name };
    const { result, status } = await postAndParse('/users/register', data);
    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual(
      'password is required, min 6 characters, max 256 characters'
    );
  });

  test('Create user, success', async () => {
    const data = { username, password, name };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(201);
    expect(result.username).toBe(username);
    expect(result.name).toBe(name);
    expect(result.password).toBeUndefined();
  });

  test('Create user, exists', async () => {
    const data = { username, password, name };
    const { result, status } = await postAndParse('/users/register', data);

    // Assumes tests run in order
    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('username already exists');
  });

  test('Login user, no data', async () => {
    const data = null;
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(2);
  });

  test('Login user, username & no pass', async () => {
    const data = { username: 'foobar' };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toBe(
      'password is required, min 6 characters, max 256 characters'
    );
  });

  test('Login user, invalid username & pass', async () => {
    const data = { username: 'foobar', password: 'x'.repeat(10) };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(401);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toBe('username or password incorrect');
  });

  test('Login user, success', async () => {
    const data = { username, password };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(200);
    expect(result.expiresIn).toBe(parseInt(tokenLifetime, 10));
    expect(result.token.length).toBeGreaterThanOrEqual(20); // 20 is random
    expect(result.user.admin).toBe(false);
    expect(result.user.name).toBe(name);
    expect(result.user.username).toBe(username);
    expect(result.user.password).toBeUndefined();
  });

  test('Logged in user data on /users/me', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users/me', token);

    expect(status).toBe(200);
    expect(result.admin).toBe(false);
    expect(result.name).toBe(name);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });

  test('No data if not logged in on on /users/me', async () => {
    const { result, status } = await fetchAndParse('/users/me');

    expect(status).toBe(401);
    expect(result.error).toBe('invalid token');
  });

  test('Create user that already exists (admin)', async () => {
    const data = {
      username: 'admin',
      password: 'x'.repeat(10),
      name: 'admin@example.org',
    };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('username already exists');
  });
});
