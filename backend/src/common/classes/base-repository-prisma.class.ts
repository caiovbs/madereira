import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { BaseRepository } from './base-repository.class'

/**
 * Base de acesso a dados com Prisma. Fornece operações comuns (getById, create,
 * format/formatMany) e a paginação herdada de BaseRepository. O `table` é o nome
 * do model no PrismaClient (ex.: 'produto', 'venda').
 *
 * Adaptação do padrão do appzin: NÃO assume soft-delete por `deletedAt`
 * (nosso modelo usa `ativo`); cada repositório filtra `ativo` quando precisar.
 */
export abstract class PrismaRepository<T> extends BaseRepository<T> {
  @Inject()
  protected readonly prismaService: PrismaService

  constructor(
    protected readonly Model: Type<T>,
    protected readonly table: string
  ) {
    super()
  }

  protected get delegate(): any {
    return (this.prismaService as any)[this.table]
  }

  async getById(id: string, options?: any): Promise<T | null> {
    const result = await this.delegate.findUnique({
      where: { id },
      ...options
    })
    return this.format(result)
  }

  async getByIds(ids: string[], options?: any): Promise<T[]> {
    const result = await this.delegate.findMany({
      where: { id: { in: ids } },
      ...options
    })
    return this.formatMany(result)
  }

  format(obj: any): T {
    return obj as T
  }

  formatMany(arr: any[]): T[] {
    return (arr ?? []).map(obj => this.format(obj))
  }
}

export function BaseRepositoryPrisma<T>(
  modelClass: Type<T>,
  table: string
): Type<PrismaRepository<T>> {
  @Injectable()
  class BaseRepositoryPrismaClass extends PrismaRepository<T> {
    constructor() {
      super(modelClass, table)
    }
  }

  return mixin(BaseRepositoryPrismaClass)
}
