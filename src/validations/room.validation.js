const Joi = require("joi");

const roomValidationSchema = Joi.object({
  roomNumber: Joi.number().required().messages({
    "any.required": "Room number is required.",
    "number.empty": "Room number must not be empty.",
    "string.base": "Room number must be a number.",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive value.",
    "number.empty": "Price must not be empty.",
    "any.required": "Price is required.",
  }),
  photos: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required().messages({
          "string.uri": "Each photo URL must be a valid URI.",
          "any.required": "Photo URL is required for each photo.",
        }),
      })
    )
    .min(1) // Ensures at least one photo is provided
    .messages({
      "array.base": "Photos should be an array of objects with URLs.",
      "array.min": "At least one photo is required.",
    }),
});

const roomUpdateValidationSchema = Joi.object({
  price: Joi.number().positive().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive value.",
    "number.empty": "Price must not be empty.",
    "any.required": "Price is required.",
  }),
  photos: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().messages({
          "string.uri": "Each photo URL must be a valid URI.",
          "any.required": "Photo URL is required for each photo.",
        }),
      })
    )
    .min(1) // Ensures at least one photo is provided
    .messages({
      "array.base": "Photos should be an array of objects with URLs.",
      "array.min": "At least one photo is required.",
    }),
});

module.exports = { roomValidationSchema, roomUpdateValidationSchema };
