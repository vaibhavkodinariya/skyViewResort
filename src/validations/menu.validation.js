const Joi = require("joi");

const addMenuSchema = Joi.object({
  photo: Joi.object({
    url: Joi.string().uri().messages({
      "string.uri": "Each photo URL must be a valid URI.",
      "any.required": "Photo URL is required for each photo.",
    }),
  }),

  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name should have at least 3 characters.",
    "string.max": "Name should have at most 50 characters.",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
    "number.precision": "Price can have at most 2 decimal places.",
    "any.required": "Price is required.",
  }),

  category: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Category is required.",
    "string.min": "Category should have at least 3 characters.",
    "string.max": "Category should have at most 30 characters.",
  }),

  cuisine: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Cuisine is required.",
    "string.min": "Cuisine should have at least 3 characters.",
    "string.max": "Cuisine should have at most 30 characters.",
  }),
});

const updateMenuSchema = Joi.object({
  photo: Joi.object({
    url: Joi.string().uri().messages({
      "string.uri": "Each photo URL must be a valid URI.",
      "any.required": "Photo URL is required for each photo.",
    }),
  }),

  name: Joi.string().min(3).max(50).messages({
    "string.min": "Name should have at least 3 characters.",
    "string.max": "Name should have at most 50 characters.",
  }),

  price: Joi.number().positive().precision(2).messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
    "number.precision": "Price can have at most 2 decimal places.",
    "any.required": "Price is required.",
  }),

  category: Joi.string().min(3).max(30).messages({
    "string.min": "Category should have at least 3 characters.",
    "string.max": "Category should have at most 30 characters.",
  }),

  cuisine: Joi.string().min(3).max(30).messages({
    "string.min": "Cuisine should have at least 3 characters.",
    "string.max": "Cuisine should have at most 30 characters.",
  }),
});

module.exports = { addMenuSchema, updateMenuSchema };
