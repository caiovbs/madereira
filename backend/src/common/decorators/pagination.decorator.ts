/* eslint-disable @typescript-eslint/no-base-to-string */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PaginationParams } from '../types';

export const GetPagination = createParamDecorator(
  (_data, ctx: ExecutionContext): PaginationParams => {
    const req: Request = ctx.switchToHttp().getRequest();

    return {
      page: req.query.page ? Number.parseInt(req.query.page.toString(), 10) : 1,
      pageSize: req.query.pageSize
        ? Number.parseInt(req.query.pageSize.toString(), 10)
        : 100,
    };
  },
);
