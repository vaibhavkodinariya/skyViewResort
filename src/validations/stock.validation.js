const Joi = require("joi");

const updateStock = Joi.object({
  itemId: Joi.string().messages({
    "string.base": "Item ID must be a string.",
    "any.required": "Item ID is required.",
  }),
  newQuantity: Joi.number().integer().min(0).messages({
    "number.base": "New quantity must be a number.",
    "number.integer": "New quantity must be an integer.",
    "number.min": "New quantity must be at least 0.",
    "any.required": "New quantity is required.",
  }),
  measure: Joi.string().valid("grams", "kilograms", "liters").messages({
    "any.only": 'Measure must be one of ["grams", "kilograms", "liters"].',
    "any.required": "Measure is required.",
  }),
});

const updatedThreshold = Joi.object({
  itemId: Joi.string().required().messages({
    "string.base": "Item ID must be a string.",
    "any.required": "Item ID is required.",
  }),
  newThreshold: Joi.number().integer().min(0).required().messages({
    "number.base": "New threshold must be a number.",
    "number.integer": "New threshold must be an integer.",
    "number.min": "New threshold must be at least 0.",
    "any.required": "New threshold is required.",
  }),
});

const addStock = Joi.object({
  itemName: Joi.string().required().messages({
    "string.base": "Item name must be a string.",
    "any.required": "Item name is required.",
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number.",
    "number.integer": "Quantity must be an integer.",
    "number.min": "Quantity must be at least 0.",
    "any.required": "Quantity is required.",
  }),
  threshold: Joi.number().integer().min(0).required().messages({
    "number.base": "Threshold must be a number.",
    "number.integer": "Threshold must be an integer.",
    "number.min": "Threshold must be at least 0.",
    "any.required": "Threshold is required.",
  }),
  measure: Joi.string()
    .valid("grams", "kilograms", "liters")
    .required()
    .messages({
      "any.only": 'Measure must be one of ["grams", "kilograms", "liters"].',
      "any.required": "Measure is required.",
    }),
});

module.exports = { updateStock, updatedThreshold, addStock };
