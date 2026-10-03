import { PaginationParams } from '../types';

export function getPaginationParamsToRepository(paginationParams?: PaginationParams) {
  if (!paginationParams?.page || !paginationParams?.pageSize) {
    return { skip: undefined, take: undefined };
  }
  return {
    skip: (paginationParams.page - 1) * paginationParams.pageSize,
    take: paginationParams.pageSize,
  };
}
