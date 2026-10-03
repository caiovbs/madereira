import { HttpStatus } from '@nestjs/common';
import { ObjectType } from '../types';
import { DomainError } from './domain.error';

interface ObjectNotFoundErrorMetadata {
  objectType: ObjectType;
  field?: string;
}

export class ObjectNotFoundError extends DomainError<
  'object_not_found',
  ObjectNotFoundErrorMetadata
> {
  constructor(readonly metadata: ObjectNotFoundErrorMetadata) {
    super({
      code: 'object_not_found',
      message: `${metadata.objectType} não encontrado(a)`,
      status: HttpStatus.NOT_FOUND,
    });
  }
}
