/* eslint-disable @typescript-eslint/no-unused-vars */
import { body, param, query, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
  ],
  email: body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  name: body("name").isLength({ min: 1 }).withMessage("Name is required"),
};

export const ValidateSignup = validate([
  commonValidations.name,
  commonValidations.email,
  commonValidations.pagination
]);
