const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    BASEURL: Joi.string().required().description("Base url required"),
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    HOTELGST: Joi.string().required().description("Hotel GST Value Required"),
    FOODGST: Joi.string()
      .required()
      .description("Restaurent GST Value Required"),
    MONGO_URI: Joi.string().required().description("Mongo DB url"),
    MONGOUSER: Joi.string().required().description("Mongo User"),
    MONGOPWD: Joi.string().required().description("Mongo Password"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    SKY_VIEW_GST_NO: Joi.string().required().description("GST Number required"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  baseUrl: envVars.BASEURL,
  gst: {
    foodGst: envVars.FOODGST,
    hotelGst: envVars.HOTELGST,
  },
  skyViewGSTNo: envVars.SKY_VIEW_GST_NO,
  mongoose: {
    url: envVars.MONGO_URI + (envVars.NODE_ENV === "test" ? "-test" : ""),
    username: envVars.MONGOUSER,
    password: envVars.MONGOPWD,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
};
