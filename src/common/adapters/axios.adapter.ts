import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

import {
  HttpAdapter,
  ApiResponse,
} from '@/common/interfaces/http-adapter.interface';
import { envs } from '@/config/envs';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly axios: AxiosInstance;
  private readonly logger = new Logger(AxiosAdapter.name);

  constructor() {
    this.axios = axios.create({
      timeout: envs.apiTimeout,
      maxRedirects: 0,
      httpAgent: new HttpAgent({ keepAlive: true }),
      httpsAgent: new HttpsAgent({ keepAlive: true }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'tarifas-api/1.0',
      },
    });
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    let startAttemptTime = 0;

    for (let attempt = 1; attempt <= envs.apiRetries; attempt++) {
      try {
        startAttemptTime = Date.now();

        const { data } = await this.axios.get<T>(url);

        const duration = Date.now() - startAttemptTime;
        void duration;

        return { data, duration };
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startAttemptTime;
        void duration;

        // Retry solo para errores de red o 5xx. En 4xx salir rápido.
        const shouldRetry =
          !(error as any)?.response ||
          (((error as any)?.response?.status ?? 0) >= 500 &&
            ((error as any)?.response?.status ?? 0) < 600);

        if (!shouldRetry || attempt >= envs.apiRetries) {
          this.logger.error(
            ` Todos los intentos fallaron: ${lastError.message}`,
          );
          break;
        }

        // Backoff rápido con jitter y tope corto para producción.
        const base = 500;
        const maxWait = 1500;
        const waitTime =
          Math.min(base * Math.pow(2, attempt - 1), maxWait) +
          Math.floor(Math.random() * 250);
        this.logger.warn(
          ` Error intento ${attempt}: ${lastError.message}. Reintentando en ${waitTime}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw (
      lastError ||
      new Error('No se pudo conectar a la API después de múltiples intentos')
    );
  }


  async post<T>(url: string, body: any, config?: any): Promise<ApiResponse<T>> {
  const start = Date.now();
  const { data } = await this.axios.post<T>(url, body, config);
  return { data, duration: Date.now() - start };
}

}
