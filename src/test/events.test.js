import { describe, expect, test } from '@jest/globals';
import {
  deleteAndParse,
  fetchAndParse,
  loginAsHardcodedAdminAndReturnToken,
  loginAsHardcodedTestUserAndReturnToken,
  patchAndParse,
  postAndParse,
} from './utils.js';

describe('events', () => {
  test('GET /events returns page of events', async () => {
    const { result, status } = await fetchAndParse('/events');
    expect(status).toBe(200);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Forritarahittingur í febrúar');
    expect(result[0].description).toBe(
      'Forritarar hittast í febrúar og forrita saman eitthvað frábært.'
    );
  });
  test('POST /events creates an event if logged in', async () => {
    const token = await loginAsHardcodedTestUserAndReturnToken();
    const event = { name: 'test-name', description: 'test-description' };
    const { result, status } = await postAndParse('/events', event, token);
    expect(status).toBe(200);
    expect(result.name).toBe(event.name);
    expect(result.description).toBe(event.description);
  });
  test('GET /events/:id returns page of single event', async () => {
    const { result, status } = await fetchAndParse('/events/1');
    expect(status).toBe(200);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Forritarahittingur í febrúar');
    expect(result.description).toBe(
      'Forritarar hittast í febrúar og forrita saman eitthvað frábært.'
    );
  });
  test('PATCH /events/:id updates event if created by user', async () => {
    const token = await loginAsHardcodedTestUserAndReturnToken();
    const event = { name: 'test-name2', description: 'test-description' };
    const { result, status } = await patchAndParse('/events/2', event, token);
    expect(status).toBe(200);
    expect(result.name).toBe(event.name);
    expect(result.description).toBe(event.description);
  });
  test('PATCH /events/:id updates event if admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    const event = { name: 'test-name3', description: 'test-description' };
    const { result, status } = await patchAndParse('/events/2', event, token);
    expect(status).toBe(200);
    expect(result.name).toBe(event.name);
    expect(result.description).toBe(event.description);
  });
  test('POST /events/:id/register registers to event', async () => {
    const token = await loginAsHardcodedTestUserAndReturnToken();
    const { result, status } = await postAndParse(
      '/events/4/register',
      null,
      token
    );
    expect(status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.registration.registrant).toBe(2);
  });
  test('DELETE /events/:id/register registers to event', async () => {
    const token = await loginAsHardcodedTestUserAndReturnToken();
    const { result, status } = await deleteAndParse(
      '/events/4/register',
      null,
      token
    );
    expect(status).toBe(200);
    expect(result.success).toBe(true);
  });
  test('DELETE /events/:id deletes event if created by user', async () => {
    const token = await loginAsHardcodedTestUserAndReturnToken();
    const { result, status } = await deleteAndParse('/events/2', null, token);
    expect(status).toBe(200);
    expect(result.success).toBe(true);
  });
  test('DELETE /events/:id updates event if admin', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    const { result, status } = await deleteAndParse('/events/3', null, token);
    expect(status).toBe(200);
    expect(result.success).toBe(true);
  });
});
