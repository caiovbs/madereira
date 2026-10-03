import { PaginatedList } from '../models';
import { PaginationParams } from '../types';

interface CreatePaginatedListPayload<T> {
  page: number;
  pageSize: number;
  /** total de itens na query */
  count: number;
  data: T[];
}

export abstract class BaseRepository<T> {
  protected defaultPage = 1;

  protected defaultPageSize = 100;

  protected getPage(page?: number): number {
    return page ? (page < 1 ? this.defaultPage : page) : this.defaultPage;
  }

  protected getPageSize(pageSize?: number): number {
    return pageSize
      ? pageSize < 1
        ? this.defaultPageSize
        : pageSize
      : this.defaultPageSize;
  }

  protected createPaginationPayload({
    data,
    page: _page,
    pageSize: _pageSize,
    count,
  }: CreatePaginatedListPayload<T>): PaginatedList<T> {
    const pageSize = this.getPageSize(_pageSize);
    const page = this.getPage(_page);
    const pageCount = Math.ceil(count / pageSize);
    return {
      count,
      items: data,
      pageInfo: {
        currentPage: page,
        hasNextPage: page < pageCount,
        hasPreviousPage: page > 1,
        itemCount: count,
        perPage: pageSize,
        pageCount,
      },
    };
  }

  protected getPaginationOffset({ page, pageSize }: PaginationParams): number {
    return page && pageSize ? (page - 1) * pageSize : 0;
  }
}
