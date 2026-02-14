import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { HttpAdapter } from '@/common/interfaces/http-adapter.interface';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(url: string): Promise<T> {
    const { data } = await this.axios.get<T>(url);
    return data;
  }
}
