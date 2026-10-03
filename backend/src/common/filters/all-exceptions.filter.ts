/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger as NestLogger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DomainError } from '../errors';

export interface ErrorResponse {
  status: false;
  statusCode: number;
  message: string;
  errorMessage: string;
  code: string;
  subCode?: string;
  metadata?: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const isHttpException = exception instanceof HttpException;
    const isDomainError = exception instanceof DomainError;
    const isExpectedError = isHttpException || isDomainError;

    if (!isExpectedError) {
      NestLogger.error(
        exception?.message,
        exception?.stack,
        'AllExceptionsFilter',
      );
    }

    const httpStatus = isExpectedError
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: ErrorResponse = {
      status: false,
      statusCode: httpStatus,
      code: isExpectedError
        ? this.getExceptionCode(exception, httpStatus)
        : 'unknown',
      message: isExpectedError
        ? exception.message
        : 'Algo inesperado aconteceu. Tente novamente.',
      errorMessage: exception?.message,
    };

    if (isDomainError) {
      responseBody.metadata = exception.metadata;
      responseBody.subCode = exception.subCode;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getExceptionCode(exception: any, statusCode: HttpStatus): string {
    if (exception.code) return exception.code;
    return HttpStatus[statusCode]?.toLowerCase() ?? 'error';
  }
}
