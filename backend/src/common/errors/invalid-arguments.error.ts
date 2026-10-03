import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain.error';

export interface FieldConstraint {
  type: string;
  message: string;
}

export interface InvalidArgumentField {
  name: string;
  message: string;
  constraints: FieldConstraint[];
}

interface InvalidArgumentsErrorMetadata {
  fields: InvalidArgumentField[];
}

export class InvalidArgumentsError extends DomainError<
  'invalid_arguments',
  InvalidArgumentsErrorMetadata
> {
  constructor(readonly metadata: InvalidArgumentsErrorMetadata) {
    super({
      code: 'invalid_arguments',
      message: 'Argumentos inválidos',
      status: HttpStatus.BAD_REQUEST,
    });
  }
}
