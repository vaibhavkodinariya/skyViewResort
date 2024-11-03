const Joi = require("joi");
const status = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  // Pick only the relevant parts of the schema (params, query, body)
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema)); // Pick the corresponding values from the request

  // Validate each part of the schema if it exists
  const errors = [];

  // Validate params if they exist
  if (validSchema.params) {
    const { value, error } = Joi.compile(validSchema.params)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object.params);

    if (error) {
      errors.push(...error.details.map((details) => details.message));
      // Use Object.assign to include validated value in req.params
      Object.assign(req.params, value);
    }
  }

  // Validate query if they exist
  if (validSchema.query) {
    const { value, error } = Joi.compile(validSchema.query)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object.query);

    if (error) {
      errors.push(...error.details.map((details) => details.message));
      Object.assign(req.query, value);
    }
  }

  // Validate body if it exists
  if (validSchema.body) {
    const { value, error } = Joi.compile(validSchema.body)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object.body);

    if (error) {
      errors.push(...error.details.map((details) => details.message));
      Object.assign(req.body, value);
    }
  }

  // If there are any errors, throw an ApiError
  if (errors.length > 0) {
    return next(new ApiError(status.BAD_REQUEST, errors.join(", ")));
  }

  return next();
};

module.exports = validate;
