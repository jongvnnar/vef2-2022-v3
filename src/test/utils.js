import crypto from 'crypto';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Nær allt fengið úr sýnilausn hópverkefni 1.
dotenv.config();

const {
  PORT: port = '5000',
  ADMIN_USER: adminUser = '',
  ADMIN_PASS: adminPass = '',
  TEST_USER: testUser = '',
  TEST_PASS: testPass = '',
} = process.env;

const baseUrl = `http://localhost:${port}`;

export function randomValue() {
  return crypto.randomBytes(16).toString('hex');
}

export function getRandomInt(min, max) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin) + ceilMin);
}

export async function methodAndParse(method, path, data = null, token = null) {
  const url = new URL(path, baseUrl);

  const options = { headers: {} };

  if (method !== 'GET') {
    options.method = method;
  }

  if (data) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const result = await fetch(url, options);
  return {
    result: await result.json(),
    status: result.status,
  };
}

export async function fetchAndParse(path, token = null) {
  return methodAndParse('GET', path, null, token);
}

export async function postAndParse(path, data, token = null) {
  return methodAndParse('POST', path, data, token);
}

export async function patchAndParse(path, data, token = null) {
  return methodAndParse('PATCH', path, data, token);
}

export async function deleteAndParse(path, data, token = null) {
  return methodAndParse('DELETE', path, data, token);
}

export async function loginAndReturnToken(data) {
  const { result } = await postAndParse('/users/login', data);
  if (result && result.token) {
    return result.token;
  }

  return null;
}

export async function createRandomUserAndReturnWithToken() {
  const rnd = randomValue();
  const username = `user${rnd}`;
  const name = `user-${rnd}`;
  const password = '1234567890';

  const data = { username, password, name };
  const { result } = await postAndParse('/users/register', data);
  const token = await loginAndReturnToken({ username, password });

  return {
    user: result,
    token,
  };
}

export async function loginAsHardcodedAdminAndReturnToken() {
  const result = await loginAndReturnToken({
    username: adminUser,
    password: adminPass,
  });
  return result;
}

export async function loginAsHardcodedTestUserAndReturnToken() {
  const result = await loginAndReturnToken({
    username: testUser,
    password: testPass,
  });
  return result;
}
