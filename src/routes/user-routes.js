import express from 'express';
import jwt from 'jsonwebtoken';
import {
  jwtOptions,
  requireAdmin,
  requireAuthentication,
  tokenOptions,
} from '../auth/passport.js';
import {
  createUser,
  findById,
  findByUsername,
  listUsers,
} from '../auth/users.js';
import {
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../auth/validation.js';
import { catchErrors } from '../lib/catch-errors.js';
import { validationCheck } from '../lib/validation-helpers.js';
import {
  idValidator,
  sanitizationMiddleware,
  xssSanitizationMiddleware,
} from '../lib/validation.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */

export const router = express.Router();

// TODO breyta þessu í paging.
async function usersRoute(_req, res) {
  const userList = await listUsers();
  return res.status(200).json(userList);
}

async function userRoute(req, res) {
  const { params: { userId } = {} } = req;
  const user = await findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

async function registerRoute(req, res) {
  const { name, username, password = '' } = req.body;

  const result = await createUser(name, username, password);

  delete result.password;

  return res.status(201).json(result);
}

async function loginRoute(req, res) {
  const { username } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    console.error('Unable to find user', username);
    return res.status(500).json({});
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;

  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

async function currentUserRoute(req, res) {
  const { user: { id } = {} } = req;

  const user = await findById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

const registrationFields = ['username', 'password', 'name'];
router.post(
  '/register',
  usernameValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  xssSanitizationMiddleware(registrationFields),
  sanitizationMiddleware(registrationFields),
  catchErrors(registerRoute)
);

const loginFields = ['username', 'password'];
router.post(
  '/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  xssSanitizationMiddleware(loginFields),
  sanitizationMiddleware(loginFields),
  catchErrors(loginRoute)
);

router.get('', requireAuthentication, requireAdmin, catchErrors(usersRoute));

router.get('/me', requireAuthentication, catchErrors(currentUserRoute));

router.get(
  '/:userId',
  requireAuthentication,
  requireAdmin,
  idValidator('userId'),
  validationCheck,
  catchErrors(userRoute)
);
