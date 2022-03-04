import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import xss from 'xss';
import { query } from '../lib/db.js';

dotenv.config();

const { BCRYPT_ROUNDS: bcryptRounds = 1 } = process.env;

export async function comparePasswords(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function createUser(name, username, password) {
  // Geymum hashað password!
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(bcryptRounds, 10)
  );
  console.log(hashedPassword);
  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await query(q, [xss(name), xss(username), hashedPassword]);
    return result.rows[0];
  } catch (e) {
    console.error('Gat ekki búið til notanda');
  }

  return null;
}

export async function listUsers() {
  const q = `
  SELECT id, name, username, admin FROM users ORDER BY id ASC;
  `;

  try {
    const result = await query(q);
    console.log(result);
    return result.rows;
  } catch (e) {
    console.error('Gat ekki fundið lista af notendum');
  }
  return null;
}
