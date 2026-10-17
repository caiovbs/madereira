// Popula a API com dados realistas de uma madeireira.
// Uso (API rodando): node scripts/seed.mjs
// Idempotente nos cadastros e produtos (pula o que já existe); compras, vendas e
// despesas só são criadas se ainda não houver movimento "do seed" (ver marcador abaixo).
import { get, post, patch, must, isoDay } from './lib.mjs';

const MARCADOR_OBRA = 'seed';

async function garantir(path, lista, chave, build) {
  const existentes = (await must(get(path), `GET ${path}`)).map((x) => x[chave].toLowerCase());
  const out = [];
  for (const item of lista) {
    if (existentes.includes(item[chave].toLowerCase())) continue;
    out.push(await must(post(path, build ? build(item) : item), `POST ${path}`));
  }
  return out;
}

// ───────────────────────── Cadastros ─────────────────────────
const tipos = ['Pinus', 'Eucalipto', 'Cedrinho', 'Peroba', 'Ipê', 'Angelim', 'Garapeira'];
await garantir('/tipos-madeira', tipos.map((nome) => ({ nome })), 'nome');
const tipoId = Object.fromEntries(
  (await must(get('/tipos-madeira'), 'tipos')).map((t) => [t.nome, t.id]),
);

await garantir('/clientes', [
  { nome: 'Construtora Vale Verde Ltda', telefone: '(11) 3456-7890', endereco: 'Av. das Indústrias, 1200 - Distrito Industrial', documento: '12.345.678/0001-90' },
  { nome: 'Marcenaria Souza & Filhos', telefone: '(11) 98877-1020', endereco: 'Rua dos Marceneiros, 85 - Vila Nova', documento: '23.456.789/0001-01' },
  { nome: 'Antônio Pereira', telefone: '(11) 97766-5544', endereco: 'Rua das Acácias, 310 - Jardim Primavera', documento: '123.456.789-09' },
  { nome: 'Maria Aparecida Lopes', telefone: '(11) 96655-4433', endereco: 'Rua Sete de Setembro, 47 - Centro', documento: '987.654.321-00' },
  { nome: 'JR Reformas e Construções', telefone: '(11) 95544-3322', endereco: 'Estrada do Sítio, km 3 - Zona Rural', documento: '34.567.890/0001-12' },
  { nome: 'Carpintaria Dois Irmãos', telefone: '(11) 94433-2211', endereco: 'Rua Pernambuco, 560 - Vila Operária', documento: '45.678.901/0001-23' },
  { nome: 'Paulo Henrique Ramos', telefone: '(11) 93322-1100', endereco: 'Rua Goiás, 22 - Jardim Europa' },
  { nome: 'Fazenda Boa Esperança', telefone: '(11) 92211-0099', endereco: 'Rodovia SP-270, km 112 - Zona Rural', documento: '56.789.012/0001-34' },
], 'nome');

await garantir('/fornecedores', [
  { nome: 'Serraria Santa Luzia', telefone: '(15) 3322-1000', observacao: 'Pinus e eucalipto; entrega em até 3 dias' },
  { nome: 'Reflorestadora Pinhal Ltda', telefone: '(42) 3555-2020', observacao: 'Pinus tratado; mínimo 2 m³ por pedido' },
  { nome: 'Madeiras Nobres do Pará', telefone: '(91) 3244-8800', observacao: 'Ipê, angelim, garapeira — com DOF' },
  { nome: 'Eucalipto Mineiro S/A', telefone: '(31) 3777-4040' },
], 'nome');

await garantir('/funcionarios', [
  { nome: 'Carlos Oliveira', funcoes: ['motorista', 'carregador'], telefone: '(11) 97777-0000' },
  { nome: 'Roberto Almeida', funcoes: ['motorista'], telefone: '(11) 97777-0001' },
  { nome: 'José Ferreira', funcoes: ['cortador', 'aparelhador'], telefone: '(11) 97777-0002' },
  { nome: 'Marcos Silva', funcoes: ['cortador'], telefone: '(11) 97777-0003' },
  { nome: 'Edson Santos', funcoes: ['aparelhador', 'carregador'], telefone: '(11) 97777-0004' },
  { nome: 'Wagner Costa', funcoes: ['carregador'], telefone: '(11) 97777-0005' },
], 'nome');

await garantir('/caminhoes', [
  { descricao: 'Mercedes-Benz Accelo 815 (baú aberto)', placa: 'FRT-4A21' },
  { descricao: 'Ford Cargo 816 (carroceria)', placa: 'GHJ-7B55' },
  { descricao: 'Fiat Ducato (utilitário)', placa: 'ABC-1D34' },
], 'descricao');

// ───────────────────────── Produtos ─────────────────────────
// [tipo, estado, espessura, largura, comprimento, custo, preço, estoque mínimo]
const catalogo = [
  ['Pinus', 'bruta', 2.5, 10, 3, 14, 22, 30],
  ['Pinus', 'bruta', 2.5, 15, 3, 20, 31, 30],
  ['Pinus', 'bruta', 5, 5, 3, 21, 33, 20],
  ['Pinus', 'bruta', 5, 10, 3, 38, 58, 20],
  ['Pinus', 'bruta', 2.5, 30, 3, 36, 55, 15],
  ['Pinus', 'aparelhada', 2.5, 10, 3, 19, 30, 15],
  ['Eucalipto', 'bruta', 5, 15, 3, 34, 52, 20],
  ['Eucalipto', 'bruta', 7.5, 7.5, 3, 45, 68, 12],
  ['Cedrinho', 'bruta', 2.5, 15, 3, 42, 64, 15],
  ['Cedrinho', 'aparelhada', 2.5, 15, 3, 55, 82, 10],
  ['Cedrinho', 'bruta', 5, 10, 3, 55, 84, 10],
  ['Peroba', 'bruta', 5, 30, 3, 120, 185, 8],
  ['Peroba', 'aparelhada', 5, 15, 3, 95, 145, 8],
  ['Ipê', 'bruta', 5, 15, 3, 210, 320, 6],
  ['Ipê', 'aparelhada', 2.5, 15, 3, 170, 255, 6],
  ['Angelim', 'bruta', 5, 15, 3, 150, 225, 6],
  ['Garapeira', 'bruta', 2.5, 15, 3, 110, 168, 8],
];

const existentes = await must(get('/produtos'), 'produtos');
const mesmaFicha = (p, c) =>
  p.tipoId === tipoId[c[0]] && p.estado === c[1] && +p.espessuraCm === c[2] &&
  +p.larguraCm === c[3] && +p.comprimentoEstoqueM === c[4];

const produtos = [];
for (const c of catalogo) {
  let p = existentes.find((e) => mesmaFicha(e, c));
  if (!p) {
    p = await must(post('/produtos', {
      tipoId: tipoId[c[0]], estado: c[1], espessuraCm: c[2], larguraCm: c[3],
      comprimentoEstoqueM: c[4], custo: c[5], preco: c[6], estoqueMinimo: c[7],
    }), `produto ${c[0]}`);
  }
  produtos.push(p);
}
const prod = (tipo, estado, esp, larg) =>
  produtos.find((p) => p.tipoId === tipoId[tipo] && p.estado === estado && +p.espessuraCm === esp && +p.larguraCm === larg);

// ───────────────────────── Movimento (só uma vez) ─────────────────────────
const jaSemeado = (await must(get('/vendas'), 'vendas')).some((v) => v.obraRef?.includes(`[${MARCADOR_OBRA}]`));
if (jaSemeado) {
  console.log('Movimento do seed já existe — cadastros e produtos conferidos, nada mais a fazer.');
  process.exit(0);
}

const forn = Object.fromEntries((await must(get('/fornecedores'), 'forn')).map((f) => [f.nome, f.id]));
const cli = Object.fromEntries((await must(get('/clientes'), 'cli')).map((c) => [c.nome, c.id]));
const [carlos, roberto] = (await must(get('/funcionarios'), 'func'))
  .filter((f) => f.funcoes.includes('motorista'));
const caminhoes = await must(get('/caminhoes'), 'cam');

// Compras recebidas: formam o estoque e o custo. Duas ficam a prazo (contas a pagar).
async function compra(fornecedorNome, itens, forma, vencDias) {
  const c = await must(post('/compras', {
    fornecedorId: forn[fornecedorNome],
    itens: itens.map(([p, quantidade, custoUnit]) => ({ produtoId: p.id, quantidade, custoUnit })),
  }), 'compra');
  return must(post(`/compras/${c.id}/receber`, {
    formaPagamento: forma,
    ...(forma === 'prazo' ? { vencimento: isoDay(vencDias) } : {}),
  }), 'receber compra');
}

await compra('Serraria Santa Luzia', [
  [prod('Pinus', 'bruta', 2.5, 10), 300, 14], [prod('Pinus', 'bruta', 2.5, 15), 200, 20],
  [prod('Pinus', 'bruta', 5, 5), 150, 21], [prod('Pinus', 'bruta', 5, 10), 120, 38],
  [prod('Pinus', 'bruta', 2.5, 30), 40, 36],
], 'pix');
await compra('Reflorestadora Pinhal Ltda', [
  [prod('Pinus', 'aparelhada', 2.5, 10), 80, 19],
], 'prazo', 21);
await compra('Eucalipto Mineiro S/A', [
  [prod('Eucalipto', 'bruta', 5, 15), 90, 34], [prod('Eucalipto', 'bruta', 7.5, 7.5), 40, 45],
], 'prazo', 12);
await compra('Madeiras Nobres do Pará', [
  [prod('Cedrinho', 'bruta', 2.5, 15), 60, 42], [prod('Cedrinho', 'aparelhada', 2.5, 15), 30, 55],
  [prod('Cedrinho', 'bruta', 5, 10), 30, 55], [prod('Peroba', 'bruta', 5, 30), 20, 120],
  [prod('Peroba', 'aparelhada', 5, 15), 25, 95], [prod('Ipê', 'bruta', 5, 15), 12, 210],
  [prod('Ipê', 'aparelhada', 2.5, 15), 14, 170], [prod('Angelim', 'bruta', 5, 15), 16, 150],
  [prod('Garapeira', 'bruta', 2.5, 15), 24, 110],
], 'pix');

// Um pedido de reposição ainda em aberto (aparece na lista de compras como "pedido").
await must(post('/compras', {
  fornecedorId: forn['Serraria Santa Luzia'],
  itens: [[prod('Pinus', 'bruta', 2.5, 10), 200, 14], [prod('Pinus', 'bruta', 5, 5), 100, 21]]
    .map(([p, quantidade, custoUnit]) => ({ produtoId: p.id, quantidade, custoUnit })),
}), 'pedido aberto');

// Vendas
async function venda({ cliente, obra, tipoEntrega, itens, frete = 0, desconto = 0 }, fechar) {
  const v = await must(post('/vendas', {
    clienteId: cli[cliente], obraRef: `${obra} [${MARCADOR_OBRA}]`, tipoEntrega, frete, desconto,
    itens: itens.map(([p, quantidade, extra]) => ({ produtoId: p.id, quantidade, ...extra })),
  }), `venda ${obra}`);
  if (!fechar) return v;
  return must(post(`/vendas/${v.id}/fechar`, {
    formaPagamento: fechar.forma,
    ...(fechar.forma === 'prazo' ? { vencimento: isoDay(fechar.dias) } : {}),
  }), `fechar ${obra}`);
}

// Orçamentos em aberto
await venda({
  cliente: 'Paulo Henrique Ramos', obra: 'Deck da piscina', tipoEntrega: 'entrega', frete: 80,
  itens: [[prod('Ipê', 'bruta', 5, 15), 8], [prod('Pinus', 'bruta', 5, 5), 20]],
});
await venda({
  cliente: 'Maria Aparecida Lopes', obra: 'Pergolado', tipoEntrega: 'retirada',
  itens: [[prod('Eucalipto', 'bruta', 7.5, 7.5), 6, { cortarParaM: 2.5 }]],
});

// Vendas fechadas — cobrem pátio e entrega em estados diferentes
const vRetirada = await venda({
  cliente: 'Antônio Pereira', obra: 'Cerca do quintal', tipoEntrega: 'retirada',
  itens: [[prod('Pinus', 'bruta', 5, 5), 30], [prod('Pinus', 'bruta', 2.5, 10), 40]], desconto: 20,
}, { forma: 'dinheiro' });

const vEntregue = await venda({
  cliente: 'Construtora Vale Verde Ltda', obra: 'Obra Residencial Aurora - telhado', tipoEntrega: 'entrega', frete: 150,
  itens: [[prod('Eucalipto', 'bruta', 5, 15), 40], [prod('Pinus', 'bruta', 5, 10), 30], [prod('Pinus', 'bruta', 2.5, 15), 60]],
}, { forma: 'prazo', dias: 15 });

const vRota = await venda({
  cliente: 'Marcenaria Souza & Filhos', obra: 'Móveis sob encomenda', tipoEntrega: 'entrega', frete: 60,
  itens: [[prod('Cedrinho', 'aparelhada', 2.5, 15), 12], [prod('Peroba', 'aparelhada', 5, 15), 6]],
}, { forma: 'pix' });

const vCarregado = await venda({
  cliente: 'JR Reformas e Construções', obra: 'Reforma assoalho', tipoEntrega: 'entrega', frete: 90,
  itens: [[prod('Cedrinho', 'bruta', 2.5, 15), 20, { cortarParaM: 2, aparelhar: true }], [prod('Pinus', 'bruta', 2.5, 10), 25]],
}, { forma: 'cartao' });

// Deixadas com pátio pendente (aparecem na fila do pátio)
await venda({
  cliente: 'Carpintaria Dois Irmãos', obra: 'Vigas do galpão', tipoEntrega: 'entrega', frete: 120,
  itens: [[prod('Peroba', 'bruta', 5, 30), 6, { cortarParaM: 2.4 }], [prod('Angelim', 'bruta', 5, 15), 8, { aparelhar: true }]],
}, { forma: 'prazo', dias: 30 });
await venda({
  cliente: 'Fazenda Boa Esperança', obra: 'Curral e porteira', tipoEntrega: 'entrega', frete: 200,
  itens: [[prod('Eucalipto', 'bruta', 7.5, 7.5), 20, { cortarParaM: 2.2 }], [prod('Eucalipto', 'bruta', 5, 15), 25]],
}, { forma: 'pix' });

// Avança o que deve estar mais adiantado
async function concluirPatio(vendaId) {
  const tarefas = await must(get(`/patio/tarefas?vendaId=${vendaId}`), 'tarefas');
  for (const t of tarefas.filter((x) => x.status === 'pendente')) {
    await must(post(`/patio/tarefas/${t.id}/concluir`), 'concluir tarefa');
  }
}
async function entregaDe(vendaId) {
  return (await must(get(`/entregas?vendaId=${vendaId}`), 'entrega'))[0];
}
async function avancar(entrega, vezes) {
  for (let i = 0; i < vezes; i++) await must(post(`/entregas/${entrega.id}/avancar`), 'avançar');
}

for (const [v, motorista, cam, vezes, data, turno] of [
  [vEntregue, carlos, caminhoes[0], 3, isoDay(-3), 'manha'],
  [vRota, roberto, caminhoes[1], 2, isoDay(0), 'manha'],
  [vCarregado, carlos, caminhoes[0], 1, isoDay(0), 'tarde'],
]) {
  await concluirPatio(v.id);
  const e = await entregaDe(v.id);
  await must(patch(`/entregas/${e.id}`, {
    motoristaId: motorista.id, caminhaoId: cam.id, dataAgendada: data, turno,
  }), 'agendar entrega');
  await avancar(e, vezes);
}
await concluirPatio(vRetirada.id);

// Despesas avulsas (e o saldo de abertura do caixa, já que o estoque foi comprado à vista)
for (const d of [
  { sentido: 'entrada', descricao: 'Saldo inicial de caixa', categoria: 'outro', valor: 60000, vencimento: isoDay(-30) },
  { sentido: 'saida', descricao: 'Diesel dos caminhões - semana', categoria: 'combustivel', valor: 780, vencimento: isoDay(-2) },
  { sentido: 'saida', descricao: 'Conta de energia - serra e galpão', categoria: 'energia', valor: 1340.5, vencimento: isoDay(6) },
  { sentido: 'saida', descricao: 'Manutenção da serra de fita', categoria: 'manutencao', valor: 420, vencimento: isoDay(-5) },
  { sentido: 'saida', descricao: 'Folha de pagamento', categoria: 'salario', valor: 9800, vencimento: isoDay(10) },
]) {
  const l = await must(post('/financeiro/lancamentos', d), `lançamento ${d.descricao}`);
  if (d.vencimento < isoDay(0)) await must(post(`/financeiro/lancamentos/${l.id}/realizar`), 'realizar');
}

console.log('Seed concluído.');
