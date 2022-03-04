import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { listEvents, listRegistered } from '../lib/db.js';

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

router.get('', catchErrors(getEventsRoute));
