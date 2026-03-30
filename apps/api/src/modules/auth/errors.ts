export class AuthError extends Error {
  statusCode: number;
  expose: boolean;
  code?: string;

  constructor(
    message: string,
    options?: { statusCode?: number; expose?: boolean; code?: string },
  ) {
    super(message);
    this.name = "AuthError";
    this.statusCode = options?.statusCode ?? 401;
    this.expose = options?.expose ?? false;
    this.code = options?.code;
  }
}

export const isAuthError = (error: unknown): error is AuthError =>
  error instanceof AuthError;
