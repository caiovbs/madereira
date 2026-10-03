import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../types';

export interface DomainErrorParams<Err extends ErrorCode> {
  message: string;
  code: Err;
  /**
   * @default HttpStatus.BAD_REQUEST
   */
  status?: HttpStatus;
}

export class DomainError<
  Err extends ErrorCode,
  TMetadata extends Record<string, any> | undefined = undefined,
> extends HttpException {
  readonly metadata?: TMetadata;

  readonly name: string;

  readonly code: Err;

  readonly subCode?: string;

  constructor({ message, code, status = HttpStatus.BAD_REQUEST }: DomainErrorParams<Err>) {
    super(message, status);
    this.name = this.constructor.name;
    this.code = code;
  }
}
