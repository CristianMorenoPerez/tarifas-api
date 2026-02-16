import { envs } from "@/config/envs";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosAdapter } from "../adapters/axios.adapter";
interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly http: AxiosAdapter) {}

  async send(options: MailOptions) {
    if (!options.to || !options.subject) return;

    try {
      await this.http.post(
        envs.brevoApiUrl,
        {
          sender: { email: envs.emailFrom },
          to: [{ email: options.to }],
          subject: options.subject,
          textContent: options.text,
          htmlContent: options.html,
        },
        {
          headers: {
            'api-key': envs.brevoApiKey,
          },
        },
      );
    } catch (error) {
      this.logger.error('Error enviando correo con API Brevo', error);
    }
  }
}
