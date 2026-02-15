export interface ApiResponse<T> {
  data: T;
  duration: number;
}

export interface HttpAdapter {
  get<T>(url: string): Promise<ApiResponse<T>>;
}
