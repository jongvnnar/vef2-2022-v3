import { readFile } from 'fs/promises';
import pg from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_DATA_FILE = './sql/insert.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function insertData(insertFile = INSERT_DATA_FILE) {
  const data = await readFile('./sql/insert.sql');
  const insert = await query(data.toString('utf-8'));
  return insert;
}

export async function createEvent({ name, slug, description, id } = {}) {
  const q = `
    INSERT INTO events
      (name, slug, description,createdBy)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, description, id];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

// Updatear ekki description, erum ekki að útfæra partial update
export async function updateEvent(id, { name, slug, description } = {}) {
  const q = `
    UPDATE events
      SET
        name = $1,
        slug = $2,
        description = $3,
        updated = CURRENT_TIMESTAMP
    WHERE
      id = $4
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, description, id];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function register({ registrant, comment, event } = {}) {
  const q = `
    INSERT INTO registrations
      (registrant, comment, event)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, registrant, comment, event;
  `;
  const values = [registrant, comment, event];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listEvents() {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
  `;

  const result = await query(q);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function listEvent(slug) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE slug = $1
  `;

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listEventByID(id) {
  const q = `
    SELECT
      id, name, slug, description, created, updated, createdBy
    FROM
      events
    WHERE id = $1
  `;
  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }
  return null;
}

// TODO gætum fellt þetta fall saman við það að ofan
export async function listEventByName(name) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE name = $1
  `;

  const result = await query(q, [name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listRegistered(event) {
  const q = `
    SELECT
      registrations.id as registrationId, registrations.registrant as userId,users.name, users.username, registrations.comment, registrations.created
    FROM
      registrations, users
    WHERE event = $1 AND users.id = registrations.registrant ORDER BY registrations.created ASC
  `;

  const result = await query(q, [event]);

  if (result) {
    return result.rows;
  }

  return [];
}

export async function end() {
  await pool.end();
}

export async function removeEvent(id) {
  const q = `
  DELETE FROM events WHERE id = $1 RETURNING id, name, slug, description
  `;

  const result = await query(q, [id]);
  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function getUserEventRegistration(event, user) {
  const q = `
  SELECT id, event, registrant, comment, created FROM registrations WHERE event = $1 AND registrant = $2
  `;

  const result = await query(q, [event, user]);
  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function removeUserRegistration(event, user) {
  const q = `
  DELETE FROM registrations WHERE registrant = $1 AND event = $2 returning id, event, registrant, comment, created
  `;
  const result = await query(q, [user, event]);
  if (result && result.rowCount === 1) {
    return result.rows[0];
  }
  return null;
}
