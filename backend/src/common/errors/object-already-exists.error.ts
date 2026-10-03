import { HttpStatus } from '@nestjs/common';
import { ObjectType } from '../types';
import { DomainError } from './domain.error';

interface ObjectAlreadyExistsErrorMetadata {
  objectType: ObjectType;
  field: string;
}

export class ObjectAlreadyExistsError extends DomainError<
  'object_already_exists',
  ObjectAlreadyExistsErrorMetadata
> {
  constructor(readonly metadata: ObjectAlreadyExistsErrorMetadata) {
    super({
      code: 'object_already_exists',
      message: `${metadata.objectType} com ${metadata.field} já existe`,
      status: HttpStatus.CONFLICT,
    });
  }
}
