import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BusinessRuleError } from '../../../common/errors';
import { GeocodingService } from './geocoding.service';
import { RoutingService } from './routing.service';
import { ordenarCaminho } from './ordenacao';
import { getDeposito, getSaidaPadrao, getTurnos } from './rota.config';
import { estimarDescarga, paraHora, paraMinutos } from './descarga';

export interface ParadaRota {
  ordem: number;
  entregaId: string;
  vendaNumero: number;
  cliente: string;
  endereco: string;
  turno: string | null;
  status: string;
  caminhaoId: string | null;
  motoristaId: string | null;
  latitude: number;
  longitude: number;
  /** distância e tempo de deslocamento do ponto anterior até esta parada */
  distanciaKm: number;
  duracaoMin: number;
  /** tempo estimado para descarregar (proporcional ao tamanho da entrega) */
  descargaMin: number;
  pecas: number;
  volumeM3: number;
  /** minutos parado esperando o turno da tarde começar */
  esperaMin: number;
  chegadaPrevista: string;
  /** a entrega só termina depois de descarregar */
  fimPrevisto: string;
  /** turno da manhã que termina depois do fim da manhã */
  passaDoTurno: boolean;
}

export interface SemLocalizacao {
  entregaId: string;
  vendaNumero: number;
  cliente: string;
  endereco: string | null;
  motivo: string;
}

export interface RotaDoDia {
  data: string;
  deposito: ReturnType<typeof getDeposito>;
  paradas: ParadaRota[];
  semLocalizacao: SemLocalizacao[];
  retorno: { distanciaKm: number; duracaoMin: number };
  total: {
    paradas: number;
    distanciaKm: number;
    /** só dirigindo */
    duracaoMin: number;
    descargaMin: number;
    esperaMin: number;
    /** da saída ao retorno: dirigindo + descarregando + esperas */
    jornadaMin: number;
    saida: string;
    retornoPrevisto: string;
  };
  /** 'otimizada' = sugestão calculada agora (ainda não salva); 'salva' = ordem já aplicada pelo usuário */
  origemOrdem: 'otimizada' | 'salva';
  /** true quando o OSRM não respondeu e distâncias/traçado são estimativas em linha reta */
  aproximado: boolean;
  geometria: Array<[number, number]>;
}

export interface FiltroRota {
  data: string;
  caminhaoId?: string;
  motoristaId?: string;
  otimizar?: boolean;
  /** horário de saída do caminhão (HH:MM) */
  saida?: string;
}

@Injectable()
export class RotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
    private readonly routing: RoutingService,
  ) {}

  async montar({ data, caminhaoId, motoristaId, otimizar, saida }: FiltroRota): Promise<RotaDoDia> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data ?? '')) {
      throw new BadRequestException('Informe a data no formato AAAA-MM-DD.');
    }
    if (saida !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(saida)) {
      throw new BadRequestException('Informe o horário de saída no formato HH:MM.');
    }
    const saidaMin = paraMinutos(saida ?? getSaidaPadrao());
    const deposito = getDeposito();

    // Só entregas que o caminhão faz: retirada no balcão e já entregues/canceladas ficam de fora.
    const entregas = await this.prisma.entrega.findMany({
      where: {
        dataAgendada: new Date(data),
        status: { notIn: ['entregue', 'cancelada'] },
        venda: { tipoEntrega: 'entrega' },
        ...(caminhaoId ? { caminhaoId } : {}),
        ...(motoristaId ? { motoristaId } : {}),
      },
      include: { venda: { include: { cliente: true, itens: { include: { produto: true } } } } },
      orderBy: { createdAt: 'asc' },
    });

    const localizadas: Array<{ e: (typeof entregas)[number]; lat: number; lng: number; endereco: string; cliente: string }> = [];
    const semLocalizacao: SemLocalizacao[] = [];

    for (const e of entregas) {
      const cliente = e.venda.cliente?.nome ?? 'Sem cliente';
      const endereco = e.endereco ?? e.venda.cliente?.endereco ?? null;
      let lat = e.latitude;
      let lng = e.longitude;

      if ((lat === null || lng === null) && endereco) {
        const achado = await this.geocoding.localizar(endereco);
        if (achado) {
          lat = achado.latitude;
          lng = achado.longitude;
          await this.prisma.entrega.update({ where: { id: e.id }, data: { latitude: lat, longitude: lng } });
        }
      }

      if (lat === null || lng === null || !endereco) {
        semLocalizacao.push({
          entregaId: e.id,
          vendaNumero: e.venda.numero,
          cliente,
          endereco,
          motivo: endereco ? 'Endereço não localizado no mapa' : 'Sem endereço informado',
        });
      } else {
        localizadas.push({ e, lat, lng, endereco, cliente });
      }
    }

    const vazia = (): RotaDoDia => ({
      data, deposito, paradas: [], semLocalizacao,
      retorno: { distanciaKm: 0, duracaoMin: 0 },
      total: {
        paradas: 0, distanciaKm: 0, duracaoMin: 0, descargaMin: 0, esperaMin: 0, jornadaMin: 0,
        saida: paraHora(saidaMin), retornoPrevisto: paraHora(saidaMin),
      },
      origemOrdem: 'salva', aproximado: false, geometria: [],
    });
    if (!localizadas.length) return vazia();

    // Ordem: a salva, se todas as paradas já têm posição; senão a sugerida.
    const todasSalvas = localizadas.every((l) => l.e.ordemRota !== null);
    const usarSalva = !otimizar && todasSalvas;
    let ordenadas = localizadas;
    let aproximado = false;

    if (usarSalva) {
      ordenadas = [...localizadas].sort((a, b) => a.e.ordemRota! - b.e.ordemRota!);
    } else {
      const pontos = [
        { latitude: deposito.latitude, longitude: deposito.longitude },
        ...localizadas.map((l) => ({ latitude: l.lat, longitude: l.lng })),
      ];
      const { distancia, aproximado: aprox } = await this.routing.matriz(pontos);
      aproximado = aprox;
      const custo = (a: number, b: number) => distancia[a][b];

      // Turno é regra, distância é critério: manhã (e sem turno) primeiro, depois a tarde;
      // dentro de cada bloco, a menor distância. A rota termina de volta na madeireira.
      const idx = (l: (typeof localizadas)[number]) => localizadas.indexOf(l) + 1;
      const blocos = [
        localizadas.filter((l) => l.e.turno !== 'tarde'),
        localizadas.filter((l) => l.e.turno === 'tarde'),
      ].filter((b) => b.length);

      const ordemIdx: number[] = [];
      let inicio = 0;
      blocos.forEach((bloco, i) => {
        const ultimo = i === blocos.length - 1;
        const parte = ordenarCaminho(inicio, bloco.map(idx), ultimo ? 0 : null, custo);
        ordemIdx.push(...parte);
        inicio = parte[parte.length - 1];
      });
      ordenadas = ordemIdx.map((i) => localizadas[i - 1]);
    }

    const caminho = [
      { latitude: deposito.latitude, longitude: deposito.longitude },
      ...ordenadas.map((l) => ({ latitude: l.lat, longitude: l.lng })),
      { latitude: deposito.latitude, longitude: deposito.longitude },
    ];
    const tracado = await this.routing.tracado(caminho);

    type Basica = Omit<ParadaRota, 'descargaMin' | 'pecas' | 'volumeM3' | 'esperaMin' | 'chegadaPrevista' | 'fimPrevisto' | 'passaDoTurno'>;
    const basicas: Basica[] = ordenadas.map((l, i) => ({
      ordem: i + 1,
      entregaId: l.e.id,
      vendaNumero: l.e.venda.numero,
      cliente: l.cliente,
      endereco: l.endereco,
      turno: l.e.turno,
      status: l.e.status,
      caminhaoId: l.e.caminhaoId,
      motoristaId: l.e.motoristaId,
      latitude: l.lat,
      longitude: l.lng,
      distanciaKm: tracado.trechos[i].distanciaKm,
      duracaoMin: tracado.trechos[i].duracaoMin,
    }));

    // Linha do tempo do dia: dirige → (espera o turno da tarde) → descarrega → segue.
    // A entrega só termina depois de descarregar, então a descarga empurra todas as paradas seguintes.
    const { manhaFim, tardeInicio } = getTurnos();
    let relogio = saidaMin;
    let descargaTotal = 0;
    let esperaTotal = 0;
    const paradas: ParadaRota[] = basicas.map((b, i) => {
      relogio += b.duracaoMin;
      const espera = b.turno === 'tarde' ? Math.max(0, paraMinutos(tardeInicio) - relogio) : 0;
      relogio += espera;
      const chegada = relogio;
      const descarga = estimarDescarga(ordenadas[i].e.venda.itens);
      relogio += descarga.minutos;
      descargaTotal += descarga.minutos;
      esperaTotal += espera;
      return {
        ...b,
        descargaMin: descarga.minutos,
        pecas: descarga.pecas,
        volumeM3: descarga.volumeM3,
        esperaMin: espera,
        chegadaPrevista: paraHora(chegada),
        fimPrevisto: paraHora(relogio),
        passaDoTurno: b.turno === 'manha' && relogio > paraMinutos(manhaFim),
      };
    });
    const retorno = tracado.trechos[tracado.trechos.length - 1];
    relogio += retorno.duracaoMin;
    const soma = (k: 'distanciaKm' | 'duracaoMin') =>
      Math.round(tracado.trechos.reduce((s, t) => s + t[k], 0) * 10) / 10;

    return {
      data, deposito, paradas, semLocalizacao, retorno,
      total: {
        paradas: paradas.length,
        distanciaKm: soma('distanciaKm'),
        duracaoMin: soma('duracaoMin'),
        descargaMin: descargaTotal,
        esperaMin: esperaTotal,
        jornadaMin: relogio - saidaMin,
        saida: paraHora(saidaMin),
        retornoPrevisto: paraHora(relogio),
      },
      origemOrdem: usarSalva ? 'salva' : 'otimizada',
      aproximado: aproximado || tracado.aproximado,
      geometria: tracado.geometria,
    };
  }

  /** Grava a sequência definida pelo usuário (1 = primeira parada). */
  async salvarOrdem(ids: string[]): Promise<{ salvas: number }> {
    const unicos = new Set(ids);
    if (unicos.size !== ids.length) throw new BusinessRuleError('A lista de entregas tem itens repetidos.');
    const existentes = await this.prisma.entrega.count({ where: { id: { in: ids } } });
    if (existentes !== ids.length) throw new BusinessRuleError('Alguma das entregas informadas não existe.');

    await this.prisma.$transaction(
      ids.map((id, i) => this.prisma.entrega.update({ where: { id }, data: { ordemRota: i + 1 } })),
    );
    return { salvas: ids.length };
  }
}
