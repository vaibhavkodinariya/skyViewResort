const Joi = require("joi");

const createOrder = Joi.object({
  tableNumber: Joi.string().required().messages({
    "string.pattern.base": "Table number must be numeric.",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        menuItem: Joi.string()
          .pattern(/^[a-fA-F0-9]{24}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Menu item ID must be a valid 24-character hexadecimal string.",
            "any.required": "Menu item ID is required.",
          }),
        quantity: Joi.number().integer().positive().required().messages({
          "number.base": "Quantity must be a number.",
          "number.integer": "Quantity must be an integer.",
          "number.positive": "Quantity must be a positive number.",
          "any.required": "Quantity is required.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one item is required.",
      "any.required": "Items are required.",
    }),
});

const updateOrder = Joi.object({
  tableNumber: Joi.string(),
  discount: Joi.number().min(0).messages({
    "number.min": "Discount amount must be positive",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        menuItem: Joi.string()
          .pattern(/^[a-fA-F0-9]{24}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Menu item ID must be a valid 24-character hexadecimal string.",
            "any.required": "Menu item ID is required.",
          }),
        quantity: Joi.number().integer().positive().required().messages({
          "number.base": "Quantity must be a number.",
          "number.integer": "Quantity must be an integer.",
          "number.positive": "Quantity must be a positive number.",
          "any.required": "Quantity is required.",
        }),
      })
    )
    .min(1)
    .messages({
      "array.min": "At least one item is required.",
    }),
});

const updateStatus = Joi.object({
  status: Joi.string().valid("Pending", "Completed").messages({
    "any.only": "Status must be either 'Pending' or 'Completed'.",
    "string.base": "Status must be a string.",
  }),
});

module.exports = { createOrder, updateOrder, updateStatus };
