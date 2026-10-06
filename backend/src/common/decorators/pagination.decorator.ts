import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PaginationParams } from '../types';

export const GetPagination = createParamDecorator(
  (_data, ctx: ExecutionContext): PaginationParams => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = req.query as Record<string, string | undefined>;

    return {
      page: query.page ? Number.parseInt(query.page, 10) : 1,
      pageSize: query.pageSize ? Number.parseInt(query.pageSize, 10) : 100,
    };
  },
);
