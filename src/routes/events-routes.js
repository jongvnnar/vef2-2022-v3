import express from 'express';
import { requireAuthentication } from '../auth/passport.js';
import { catchErrors } from '../lib/catch-errors.js';
import {
  createEvent,
  getUserEventRegistration,
  listEventByID,
  listEvents,
  listRegistered,
  register,
  removeEvent,
  removeUserRegistration,
  updateEvent,
} from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { validationCheck } from '../lib/validation-helpers.js';
import {
  atLeastOneBodyValueValidator,
  bookingValidationMiddleware,
  idValidator,
  noDuplicateEventsValidator,
  registrationValidationMiddleware,
  sanitizationMiddleware,
  validateResourceExists,
  validateResourceNotExists,
  xssSanitizationMiddleware,
} from '../lib/validation.js';

export const router = express.Router();

async function getEventsRoute(req, res) {
  const events = await listEvents();
  if (!events) {
    return res.status(500).json({ error: 'No events found' });
  }
  const result = await Promise.all(
    events.map(async (event) => {
      const registered = await listRegistered(event.id);
      return { ...event, registered };
    })
  );

  return res.json(result);
}

async function postEventsRoute(req, res) {
  const { name, description } = req.body;
  const { id = null } = req.user;
  const slug = slugify(name);
  const created = await createEvent({ name, slug, description, id });

  return res.json(created);
}

function returnResource(req, res) {
  return res.json(req.resource);
}

async function getEventRoute(_, req) {
  const { params: { id } = {} } = req;
  const event = await listEventByID(id);
  if (!event) return null;
  const registered = await listRegistered(event.id);
  return { ...event, registered };
}

async function updateRoute(req, res) {
  const { name, description } = req.body;
  const { id } = req.params;
  const { admin, id: userId } = req.user;

  const event = await listEventByID(id);

  const newSlug = slugify(name);
  if (event.createdby !== userId && !admin) {
    return res.status(401).json({ error: 'Unauthorized to update event' });
  }

  const updated = await updateEvent(event.id, {
    name,
    slug: newSlug,
    description,
  });

  if (updated) {
    return res.json(updated);
  }

  return res.status(500).json({ error: 'server error' });
}

async function deleteRoute(req, res) {
  const { id } = req.params;
  const { admin, id: userId } = req.user;

  const event = await listEventByID(id);

  if (event.createdby !== userId && !admin) {
    return res.status(401).json({ error: 'Unauthorized to delete event' });
  }

  const deleted = await removeEvent(event.id);
  if (deleted) {
    return res.json({ success: true, deletedEvent: deleted });
  }

  return res.status(304).json({ success: false });
}

async function getRegistration(_, req) {
  const { params: { id } = {}, user: { id: userId } = {} } = req;
  const registration = await getUserEventRegistration(id, userId);
  return registration;
}

async function registerRoute(req, res) {
  const { comment } = req.body;
  const { id } = req.params;
  const { id: userId, name, username } = req.user;
  const event = await listEventByID(id);

  const registered = await register({
    registrant: userId,
    comment,
    event: event.id,
  });

  if (registered) {
    const registration = { name, username, ...registered };
    return res.json({ success: true, registration });
  }

  return res.status(500).json({ error: 'Server error' });
}

async function deleteRegistrationRoute(req, res) {
  const { id } = req.params;
  const { id: userId, name, username } = req.user;
  const deleted = await removeUserRegistration(id, userId);
  if (deleted) {
    const deletedRegistration = { name, username, ...deleted };
    return res.json({ success: true, deletedRegistration });
  }

  return res.json({ success: false });
}

router.get('', catchErrors(getEventsRoute));
router.post(
  '',
  requireAuthentication,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware(['name', 'description']),
  noDuplicateEventsValidator,
  validationCheck,
  sanitizationMiddleware(['name', 'description']),
  catchErrors(postEventsRoute)
);

router.get(
  '/:id',
  idValidator('id'),
  validateResourceExists(getEventRoute),
  validationCheck,
  returnResource
);

router.patch(
  '/:id',
  requireAuthentication,
  idValidator('id'),
  atLeastOneBodyValueValidator(['name', 'description']),
  validateResourceExists(getEventRoute),
  noDuplicateEventsValidator,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware(['name', 'description']),
  validationCheck,
  sanitizationMiddleware(['name', 'description']),
  catchErrors(updateRoute)
);

router.delete(
  '/:id',
  requireAuthentication,
  idValidator('id'),
  validateResourceExists(getEventRoute),
  validationCheck,
  catchErrors(deleteRoute)
);

router.post(
  '/:id/register',
  requireAuthentication,
  idValidator('id'),
  validateResourceExists(getEventRoute),
  validateResourceNotExists(getRegistration),
  bookingValidationMiddleware,
  xssSanitizationMiddleware(['comment']),
  validationCheck,
  sanitizationMiddleware(['comment']),
  catchErrors(registerRoute)
);

router.delete(
  '/:id/register',
  requireAuthentication,
  validateResourceExists(getEventRoute),
  validateResourceExists(getRegistration),
  validationCheck,
  catchErrors(deleteRegistrationRoute)
);
