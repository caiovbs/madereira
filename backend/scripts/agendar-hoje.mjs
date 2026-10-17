// Prepara o painel de rota: endereços reais da região de Jundiaí para os clientes do seed e
// agenda para HOJE as entregas em aberto (vendas "entrega" do seed). Rodável em qualquer dia.
// Uso (API rodando): node scripts/agendar-hoje.mjs
import { get, patch, must, isoDay } from './lib.mjs';

const ENDERECOS = {
  'Construtora Vale Verde Ltda': 'Avenida Jundiaí, 1200 - Anhangabaú, Jundiaí - SP',
  'Marcenaria Souza & Filhos': 'Rua Barão de Jundiaí, 85 - Centro, Jundiaí - SP',
  'Antônio Pereira': 'Avenida Antônio Frederico Ozanan, 310 - Jundiaí - SP',
  'Maria Aparecida Lopes': 'Rua do Rosário, 47 - Centro, Jundiaí - SP',
  'Carpintaria Dois Irmãos': 'Avenida Nove de Julho, 560 - Vila Rio Branco, Jundiaí - SP',
  'JR Reformas e Construções': 'Rua Rangel Pestana, 300 - Centro, Jundiaí - SP',
  'Paulo Henrique Ramos': 'Avenida União dos Ferroviários, 22 - Jundiaí - SP',
  'Fazenda Boa Esperança': 'Avenida Humberto Cereser, 900 - Jundiaí - SP',
};

const clientes = await must(get('/clientes'), 'clientes');
for (const c of clientes) {
  if (ENDERECOS[c.nome] && c.endereco !== ENDERECOS[c.nome]) {
    await must(patch(`/clientes/${c.id}`, { endereco: ENDERECOS[c.nome] }), `cliente ${c.nome}`);
  }
}

const vendas = new Map((await must(get('/vendas'), 'vendas')).map((v) => [v.id, v]));
const caminhoes = await must(get('/caminhoes'), 'caminhões');
const motoristas = await must(get('/funcionarios?funcao=motorista'), 'motoristas');
const emAberto = (await must(get('/entregas'), 'entregas'))
  .filter((e) => e.status !== 'entregue' && e.status !== 'cancelada')
  .filter((e) => vendas.get(e.vendaId)?.tipoEntrega === 'entrega' && vendas.get(e.vendaId)?.obraRef?.includes('[seed]'));

const hoje = isoDay(0);
const turnos = ['manha', 'manha', 'tarde', 'manha', 'tarde', 'tarde'];
let i = 0;
for (const e of emAberto) {
  await must(patch(`/entregas/${e.id}`, {
    dataAgendada: hoje,
    turno: turnos[i % turnos.length],
    caminhaoId: caminhoes[0].id,
    motoristaId: motoristas[0].id,
  }), 'agendar');
  i++;
}
console.log(`${emAberto.length} entregas agendadas para ${hoje}.`);
