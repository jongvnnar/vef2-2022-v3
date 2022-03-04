import { body, param } from 'express-validator';
import xss from 'xss';
import { resourceExists } from '../lib/validation-helpers.js';
import { LoginError } from './login-error.js';
import { comparePasswords, findByUsername } from './users.js';
export function validateResourceExists(fetchResource) {
  return [
    param('id').custom(resourceExists(fetchResource)).withMessage('not found'),
  ];
}

export const usernameValidator = body('username')
  .isLength({ min: 1, max: 64 })
  .withMessage('username is required, max 64 characters');

export const nameValidator = body('name')
  .isLength({ min: 1, max: 64 })
  .withMessage('name is required, max 64 characters');

export const passwordValidator = body('password')
  .isLength({ min: 1, max: 256 })
  .withMessage('password is required, min 10 characters, max 256 characters');

export const usernameDoesNotExistValidator = body('username').custom(
  async (username) => {
    const user = await findByUsername(username);

    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  }
);

export const usernameAndPaswordValidValidator = body('username').custom(
  async (username, { req: { body: reqBody } = {} }) => {
    const { password } = reqBody;

    if (!username || !password) {
      return Promise.reject(new Error('skip'));
    }
    let valid = false;
    try {
      const user = await findByUsername(username);
      valid = await comparePasswords(password, user.password);
    } catch (e) {
      console.info(`invalid login attempt for ${username}`);
    }

    if (!valid) {
      return Promise.reject(new LoginError('username or password incorrect'));
    }
    return Promise.resolve();
  }
);

export const adminValidator = body('admin')
  .exists()
  .withMessage('admin is required')
  .isBoolean()
  .withMessage('admin must be a boolean')
  .bail();

export const loginXssSanitization = [
  body('name').customSanitizer((v) => xss(v)),
  body('password').customSanitizer((v) => xss(v)),
];

export const loginSanitization = [
  body('name').trim().escape(),
  body('password').trim().escape(),
];
