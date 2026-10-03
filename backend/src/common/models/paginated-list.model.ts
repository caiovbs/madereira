import { PageInfo } from './page-info.model';

export abstract class PaginatedList<T> {
  pageInfo: PageInfo;

  count: number;

  abstract items: T[];
}
