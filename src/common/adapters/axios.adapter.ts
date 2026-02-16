import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

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
      headers: {
        'Content-Type': 'application/json',
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

        return { data, duration };
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startAttemptTime;
        void duration;
        if (attempt < envs.apiRetries) {
          const waitTime = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          this.logger.warn(
            ` Error en intento ${attempt}: ${lastError.message}. Reintentando en ${waitTime}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          this.logger.error(
            ` Todos los intentos fallaron. Último error: ${lastError.message}`,
          );
        }
      }
    }

    throw (
      lastError ||
      new Error('No se pudo conectar a la API después de múltiples intentos')
    );
  }
}
