import express from 'express';
import jwt from 'jsonwebtoken';
import { jwtOptions, tokenOptions } from '../auth/passport.js';
import { createUser, findById, findByUsername } from '../auth/users.js';
import {
  loginSanitization,
  loginXssSanitization,
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameValidator,
} from '../auth/validation.js';
import { catchErrors } from '../lib/catch-errors.js';
import { validationCheck } from '../lib/validation-helpers.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */

export const router = express.Router();

async function registerRoute(req, res) {
  const { username, email, password = '' } = req.body;

  const result = await createUser(username, email, password);

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

// router.post(
//   '/users/register',
//   usernameValidator,
//   emailValidator,
//   passwordValidator,
//   usernameDoesNotExistValidator,
//   validationCheck,
//   catchErrors(registerRoute)
// );

router.post(
  '/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  loginXssSanitization,
  loginSanitization,
  catchErrors(loginRoute)
);

// router.get('/users/me', requireAuthentication, catchErrors(currentUserRoute));

// router.patch(
//   '/users/me',
//   requireAuthentication,
//   passwordValidator,
//   emailDoesNotExistValidator,
//   atLeastOneBodyValueValidator(['email', 'password']),
//   validationCheck,
//   catchErrors(updateCurrentUserRoute)
// );
