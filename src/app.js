import dotenv from 'dotenv';
import express from 'express';
import passport from './auth/passport.js';
import { router as eventsRouter } from './routes/events-routes.js';
import { router as userRouter } from './routes/user-routes.js';

dotenv.config();

const { PORT: port = 3000, DATABASE_URL: connectionString } = process.env;

if (!connectionString) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(passport.initialize());

// Sja til þess að content-type sé json í post og patch requestum, fengið frá sýnilausn hopverkefni 1 2021
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PATCH') {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'] !== 'application/json'
    ) {
      return res.status(400).json({ error: 'body must be json' });
    }
  }
  return next();
});

app.use('/users', userRouter);
app.use('/events', eventsRouter);

// cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
    return res.status(400).json({ error: 'Invalid json' });

  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
