import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  BREVO_API_KEY: string;
  BREVO_API_URL: string;
  API_TARIFA: string;
  API_TIMEOUT: number;
  API_RETRIES: number;
  EMAIL_FROM: string;
  EMAIL_TO: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_REFRESH_SECRET: joi.string().required(),
    BREVO_API_KEY: joi.string().required(),
    BREVO_API_URL: joi.string().required(),
    API_TARIFA: joi.string().required(),
    API_TIMEOUT: joi.number().default(30000),
    API_RETRIES: joi.number().default(3),
    EMAIL_FROM: joi.string().email().required(),
    EMAIL_TO: joi.string().email().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbUrl: envVars.DATABASE_URL,
  jwtSecret: envVars.JWT_SECRET,
  jwtRefreshSecret: envVars.JWT_REFRESH_SECRET,
  apiTarifa: envVars.API_TARIFA,
  apiTimeout: envVars.API_TIMEOUT,
  apiRetries: envVars.API_RETRIES,
  brevoApiKey: envVars.BREVO_API_KEY,
  brevoApiUrl: envVars.BREVO_API_URL,
  emailFrom: envVars.EMAIL_FROM,
  emailTo: envVars.EMAIL_TO,
};
