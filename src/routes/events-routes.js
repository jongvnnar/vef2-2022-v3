import express from 'express';
import { requireAuthentication } from '../auth/passport.js';
import { catchErrors } from '../lib/catch-errors.js';
import { createEvent, listEvents, listRegistered } from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { validationCheck } from '../lib/validation-helpers.js';
import {
  noDuplicateEventsValidator,
  registrationValidationMiddleware,
  sanitizationMiddleware,
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
