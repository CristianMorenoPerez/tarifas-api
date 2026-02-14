import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  API_TARIFA: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  EMAIL_TO: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_REFRESH_SECRET: joi.string().required(),
    API_TARIFA: joi.string().required(),
    SMTP_HOST: joi.string().required(),
    SMTP_PORT: joi.number().required(),
    SMTP_USER: joi.string().required(),
    SMTP_PASS: joi.string().required(),
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
  smtpHost: envVars.SMTP_HOST,
  smtpPort: envVars.SMTP_PORT,
  smtpUser: envVars.SMTP_USER,
  smtpPass: envVars.SMTP_PASS,
  emailFrom: envVars.EMAIL_FROM,
  emailTo: envVars.EMAIL_TO,
};
