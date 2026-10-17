import { Injectable } from '@nestjs/common'
import { Prisma, VendaStatus } from '@prisma/client'
import { BaseRepositoryPrisma } from '../../../common/classes'
import type { PaginationParams } from '../../../common/types'
import { getPaginationParamsToRepository } from '../../../common/utils'
import { Venda } from '../models'
import type { CreateVendaDto, UpdateVendaDto } from '../dto'

export interface GetVendasFilter {
  status?: VendaStatus
  clienteId?: string
}

const INCLUDE_ITENS = { itens: true } as const

@Injectable()
export class VendaRepository extends BaseRepositoryPrisma(Venda, 'venda') {
  async create(
    input: CreateVendaDto,
    itensComPreco: Array<{
      produtoId: string
      quantidade: number
      precoUnit: number
      cortarParaM?: number
      aparelhar?: boolean
      subtotalLinha: number
    }>
  ): Promise<Venda> {
    const subtotal = itensComPreco.reduce((s, i) => s + i.subtotalLinha, 0)
    const frete = input.frete ?? 0
    const desconto = input.desconto ?? 0
    const total = subtotal + frete - desconto

    const data = await this.delegate.create({
      data: {
        clienteId: input.clienteId ?? null,
        obraRef: input.obraRef ?? null,
        tipoEntrega: input.tipoEntrega ?? 'retirada',
        subtotal,
        frete,
        desconto,
        total,
        itens: {
          create: itensComPreco.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnit: item.precoUnit,
            cortarParaM: item.cortarParaM ?? null,
            aparelhar: item.aparelhar ?? false,
            subtotalLinha: item.subtotalLinha
          }))
        }
      },
      include: INCLUDE_ITENS
    })
    return this.format(data)
  }

  async update(
    id: string,
    input: UpdateVendaDto,
    itensComPreco?: Array<{
      produtoId: string
      quantidade: number
      precoUnit: number
      cortarParaM?: number
      aparelhar?: boolean
      subtotalLinha: number
    }>
  ): Promise<Venda> {
    const data: Prisma.VendaUpdateInput = {}
    if (input.clienteId !== undefined)
      data.cliente = input.clienteId ? { connect: { id: input.clienteId } } : { disconnect: true }
    if (input.obraRef !== undefined) data.obraRef = input.obraRef
    if (input.tipoEntrega !== undefined) data.tipoEntrega = input.tipoEntrega

    if (itensComPreco !== undefined) {
      const subtotal = itensComPreco.reduce((s, i) => s + i.subtotalLinha, 0)
      // Quem não reenviou frete/desconto mantém os valores já gravados no orçamento.
      const current = await this.delegate.findUnique({ where: { id } })
      const frete = input.frete ?? Number(current.frete)
      const desconto = input.desconto ?? Number(current.desconto)
      data.subtotal = subtotal
      data.frete = frete
      data.desconto = desconto
      data.total = subtotal + frete - desconto
      data.itens = {
        deleteMany: {},
        create: itensComPreco.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
          cortarParaM: item.cortarParaM ?? null,
          aparelhar: item.aparelhar ?? false,
          subtotalLinha: item.subtotalLinha
        }))
      }
    } else {
      if (input.frete !== undefined || input.desconto !== undefined) {
        const current = await this.delegate.findUnique({ where: { id } })
        const frete = input.frete ?? Number(current.frete)
        const desconto = input.desconto ?? Number(current.desconto)
        data.frete = frete
        data.desconto = desconto
        data.total = Number(current.subtotal) + frete - desconto
      }
    }

    const result = await this.delegate.update({
      where: { id },
      data,
      include: INCLUDE_ITENS
    })
    return this.format(result)
  }

  async getById(id: string): Promise<Venda | null> {
    const data = await this.delegate.findUnique({
      where: { id },
      include: INCLUDE_ITENS
    })
    return this.format(data)
  }

  async getMany(filter: GetVendasFilter, pagination: PaginationParams): Promise<Venda[]> {
    const where: Prisma.VendaWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.clienteId) where.clienteId = filter.clienteId
    const data = await this.delegate.findMany({
      where,
      include: INCLUDE_ITENS,
      orderBy: { numero: 'desc' },
      ...getPaginationParamsToRepository(pagination)
    })
    return this.formatMany(data)
  }

  async cancelar(id: string): Promise<Venda> {
    const data = await this.delegate.update({
      where: { id },
      data: { status: 'cancelada' },
      include: INCLUDE_ITENS
    })
    return this.format(data)
  }

  format(obj: any): Venda {
    if (!obj) return obj
    return {
      ...obj,
      subtotal: Number(obj.subtotal),
      frete: Number(obj.frete),
      desconto: Number(obj.desconto),
      total: Number(obj.total),
      itens: (obj.itens ?? []).map((item: any) => ({
        ...item,
        precoUnit: Number(item.precoUnit),
        cortarParaM: item.cortarParaM != null ? Number(item.cortarParaM) : null,
        subtotalLinha: Number(item.subtotalLinha)
      }))
    } as Venda
  }
}
