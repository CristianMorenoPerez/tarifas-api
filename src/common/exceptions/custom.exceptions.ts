import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} con id ${id} no fue encontrado`
      : `${resource} no fue encontrado`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'No autorizado') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Acceso denegado') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationFailedException extends HttpException {
  constructor(
    message: string,
    public errors?: any,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ExternalApiException extends HttpException {
  constructor(
    message: string,
    public externalService?: string,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message,
        externalService,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
