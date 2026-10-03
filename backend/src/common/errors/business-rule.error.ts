import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain.error';

/**
 * Erro de regra de negócio (ex.: estoque insuficiente, entrega travada pelo pátio).
 */
export class BusinessRuleError extends DomainError<'business_rule', Record<string, any>> {
  constructor(message: string, readonly metadata?: Record<string, any>) {
    super({
      code: 'business_rule',
      message,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  }
}
