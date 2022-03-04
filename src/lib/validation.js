import { body, param } from 'express-validator';
import xss from 'xss';
import { listEventByName } from './db.js';
import { resourceExists } from './validation-helpers.js';
// Endurnýtum mjög líka validation

export function registrationValidationMiddleware(textField) {
  return [
    body('name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Nafn má ekki vera tómt'),
    body('name')
      .isLength({ max: 64 })
      .withMessage('Nafn má að hámarki vera 64 stafir'),
    body(textField)
      .isLength({ max: 400 })
      .withMessage(
        `${
          textField === 'comment' ? 'Athugasemd' : 'Lýsing'
        } má að hámarki vera 400 stafir`
      ),
  ];
}

export function idValidator(idName) {
  return [
    param(idName)
      .isInt({ min: 1 })
      .withMessage(`${idName} must be an integer larger than 0`),
  ];
}

export const noDuplicateEventsValidator = body('name').custom(async (value) => {
  const eventExists = await listEventByName(value);
  if (eventExists) {
    return Promise.reject(
      new Error('Viðburður með þessu nafni er nú þegar til')
    );
  }
  return Promise.resolve();
});

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(fields) {
  return fields.map((field) => body(field).customSanitizer((v) => xss(v)));
}

export function sanitizationMiddleware(fields) {
  return fields.map((field) => body(field).trim().escape());
}

export function atLeastOneBodyValueValidator(fields) {
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;

    let valid = false;

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];

      if (field in reqBody && reqBody[field] != null) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return Promise.reject(
        new Error(`require at least one value of: ${fields.join(', ')}`)
      );
    }
    return Promise.resolve();
  });
}

export function validateResourceExists(fetchResource) {
  return [
    param('id').custom(resourceExists(fetchResource)).withMessage('not found'),
  ];
}

export function validateResourceNotExists(fetchResource) {
  return [
    param('id')
      .not()
      .custom(resourceExists(fetchResource))
      .withMessage('already exists'),
  ];
}
