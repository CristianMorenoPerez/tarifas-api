import { Injectable, Logger } from '@nestjs/common';
import { envs } from '@/config/envs';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter = nodemailer.createTransport({
    host: envs.smtpHost,
    port: envs.smtpPort,
    secure: envs.smtpPort === 587,
    auth: {
      user: envs.smtpUser,
      pass: envs.smtpPass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  async send(options: MailOptions) {
    if (!options.to || !options.subject) return;

    try {
      await this.transporter.sendMail({
        from: envs.emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (err) {
      this.logger.error('Error enviando correo', err);
    }
  }
}
