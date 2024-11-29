const Joi = require("joi");

const bookingSchema = Joi.object({
  customerName: Joi.string().min(3).max(50).required().messages({
    "string.base": "Customer name must be a string",
    "string.empty": "Customer name cannot be empty",
    "string.min": "Customer name should be at least 3 characters",
    "string.max": "Customer name should not exceed 50 characters",
    "any.required": "Customer name is required",
  }),
  adhaarCard: Joi.string()
    .length(12) // Aadhaar card must be 12 characters long
    .pattern(/^[0-9]{12}$/) // Only numeric values allowed
    .required() // Mark as required if necessary
    .messages({
      "any.required": "Adhaarcard is required",
      "string.length": "Aadhaar card number must be exactly 12 digits.",
      "string.pattern.base": "Aadhaar card number must contain only digits.",
    }),
  paymentMethod: Joi.string()
    .valid("cash", "upi", "account")
    .messages({
      "string.base": "Payment method must be a string.",
      "any.only": "Payment method must be one of ['cash', 'upi', 'account'].",
    })
    .optional(),
  discount: Joi.number().min(0).optional().messages({
    "number.min": "Discount amount must be positive",
  }),
  customerPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Customer phone must be a 10-digit number",
      "string.empty": "Customer phone cannot be empty",
      "any.required": "Customer phone is required",
    }),

  room: Joi.array().items(Joi.number()).min(1).messages({
    "any.min": "Must Contain One Room",
  }),

  checkInDate: Joi.date().iso().required().messages({
    "date.base": "Check-in date must be a valid date",
    "date.iso": "Check-in date must be in ISO format (YYYY-MM-DD)",
    "any.required": "Check-in date is required",
  }),

  checkOutDate: Joi.date()
    .iso()
    .min(Joi.ref("checkInDate"))
    .required()
    .messages({
      "date.base": "Check-out date must be a valid date",
      "date.iso": "Check-out date must be in ISO format (YYYY-MM-DD)",
      "date.min": "Check-out date must be after the check-in date",
      "any.required": "Check-out date is required",
    }),
});

const updateBookingSchema = Joi.object({
  customerName: Joi.string().min(3).max(50).messages({
    "string.base": "Customer name must be a string",
    "string.empty": "Customer name cannot be empty",
    "string.min": "Customer name should be at least 3 characters",
    "string.max": "Customer name should not exceed 50 characters",
  }),
  adhaarCard: Joi.string()
    .length(12) // Aadhaar card must be 12 characters long
    .pattern(/^[0-9]{12}$/) // Only numeric values allowed
    .messages({
      "string.length": "Aadhaar card number must be exactly 12 digits.",
      "string.pattern.base": "Aadhaar card number must contain only digits.",
    }),

  discount: Joi.number().min(0).messages({
    "number.min": "Discount amount must be positive",
  }),
  paymentMethod: Joi.string()
    .valid("cash", "upi", "account")
    .messages({
      "string.base": "Payment method must be a string.",
      "any.only": "Payment method must be one of ['cash', 'upi', 'account'].",
    })
    .optional(),
  customerPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Customer phone must be a 10-digit number",
      "string.empty": "Customer phone cannot be empty",
    }),
  roomNumbers: Joi.array().items(Joi.number()).optional(),
  checkInDate: Joi.date().iso().messages({
    "date.base": "Check-in date must be a valid date",
    "date.iso": "Check-in date must be in ISO format (YYYY-MM-DD)",
  }),

  checkOutDate: Joi.date().iso().min(Joi.ref("checkInDate")).messages({
    "date.base": "Check-out date must be a valid date",
    "date.iso": "Check-out date must be in ISO format (YYYY-MM-DD)",
    "date.min": "Check-out date must be after the check-in date",
  }),
})
  .or(
    "customerName",
    "customerPhone",
    "checkInDate",
    "checkOutDate",
    "discount"
  )
  .messages({
    "object.missing":
      "At least one of customerName, customerPhone, checkInDate, or checkOutDate is required",
  });

const validateBookingId = Joi.object({
  bookingId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/, "ObjectId")
    .required()
    .messages({
      "string.base": "Booking ID must be a string.",
      "string.pattern.name": "Booking ID must be a valid ObjectId.",
      "any.required": "Booking ID is required.",
    }),
});

module.exports = {
  bookingSchema,
  updateBookingSchema,
  validateBookingId,
};
