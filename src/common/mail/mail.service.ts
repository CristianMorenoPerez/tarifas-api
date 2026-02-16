import { Injectable } from '@nestjs/common';
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
  async send(options: MailOptions) {
    if (!options.to || !options.subject) return;
    try {
      const transporter = nodemailer.createTransport({
        host: envs.smtpHost,
        port: envs.smtpPort,
        secure: envs.smtpPort === 465,
        auth: {
          user: envs.smtpUser,
          pass: envs.smtpPass,
        },
      });
      await transporter.sendMail({
        from: envs.emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (err) {
      console.error('Error enviando correo:', err);
    }
  }
}
