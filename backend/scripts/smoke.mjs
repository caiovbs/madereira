// Teste de integração via HTTP (API + banco rodando): node scripts/smoke.mjs
// Usa um tipo/produto próprio ("ZZ Teste") para não mexer nos dados reais.
// Como a API não tem DELETE, as vendas/compras de teste ficam no histórico.
import { get, post, patch, call, must, isoDay } from './lib.mjs';

let falhas = 0;
let total = 0;
function check(nome, cond, detalhe = '') {
  total++;
  if (cond) console.log(`  ok   ${nome}`);
  else { falhas++; console.log(`  FALHA ${nome} ${detalhe}`); }
}
const rejeita = async (nome, promise, status, trecho) => {
  const r = await promise;
  check(nome, r.status === status && (!trecho || JSON.stringify(r.body).includes(trecho)),
    `(recebido ${r.status}: ${JSON.stringify(r.body)})`);
};
const prod = async (id) => (await must(get(`/produtos/${id}`), 'produto'));
const caixa = async () => (await must(get('/financeiro/caixa'), 'caixa'));

console.log('Preparação');
let tipo = (await must(get('/tipos-madeira?search=ZZ Teste'), 'tipos')).find((t) => t.nome === 'ZZ Teste');
tipo ??= await must(post('/tipos-madeira', { nome: 'ZZ Teste' }), 'tipo');
let p = (await must(get(`/produtos?tipoId=${tipo.id}`), 'produtos'))[0];
p ??= await must(post('/produtos', {
  tipoId: tipo.id, estado: 'bruta', espessuraCm: 5, larguraCm: 10, comprimentoEstoqueM: 3,
  custo: 10, preco: 20, estoqueMinimo: 5,
}), 'produto');
const base = (await prod(p.id)).qtdAtual;

console.log('Validação de entrada');
await rejeita('produto sem tipoId é recusado', post('/produtos', { preco: 1 }), 400);
await rejeita('cliente sem nome é recusado', post('/clientes', { telefone: '1' }), 400);
await rejeita('venda com quantidade 0 é recusada', post('/vendas', { itens: [{ produtoId: p.id, quantidade: 0 }] }), 400);
await rejeita('GET de id inexistente dá 404', get('/produtos/00000000-0000-4000-8000-000000000000'), 404);
await rejeita('tipo duplicado é recusado', post('/tipos-madeira', { nome: 'ZZ Teste' }), 409);

console.log('Compra → estoque, custo e a pagar');
const compra = await must(post('/compras', { itens: [{ produtoId: p.id, quantidade: 100, custoUnit: 12 }] }), 'compra');
check('compra nasce como pedido', compra.status === 'pedido');
check('pedido ainda não mexe no estoque', (await prod(p.id)).qtdAtual === base);
await rejeita('receber a prazo exige vencimento', post(`/compras/${compra.id}/receber`, { formaPagamento: 'prazo' }), 422);
const saldoAntes = await caixa();
const recebida = await must(post(`/compras/${compra.id}/receber`, { formaPagamento: 'prazo', vencimento: isoDay(10) }), 'receber');
check('compra recebida', recebida.status === 'recebida');
check('estoque somou 100', (await prod(p.id)).qtdAtual === base + 100);
check('custo do produto atualizou para 12', (await prod(p.id)).custo === 12);
check('compra a prazo não mexe no caixa realizado', (await caixa()).saldo === saldoAntes.saldo);
const aPagar = await must(get('/financeiro/lancamentos?origemTipo=compra&situacao=previsto'), 'lançamentos');
check('gerou conta a pagar de R$ 1.200', aPagar.some((l) => l.compraId === compra.id && l.valor === 1200 && l.sentido === 'saida'));
await rejeita('receber duas vezes é recusado', post(`/compras/${compra.id}/receber`, { formaPagamento: 'pix' }), 422);
const pedido2 = await must(post('/compras', { itens: [{ produtoId: p.id, quantidade: 1, custoUnit: 1 }] }), 'compra2');
check('pedido pode ser cancelado', (await must(post(`/compras/${pedido2.id}/cancelar`), 'cancelar')).status === 'cancelada');
await rejeita('compra recebida não pode ser cancelada', post(`/compras/${compra.id}/cancelar`), 422);

console.log('Venda → orçamento');
const orc = await must(post('/vendas', {
  obraRef: 'smoke test', tipoEntrega: 'entrega', frete: 30, desconto: 10,
  itens: [{ produtoId: p.id, quantidade: 10, cortarParaM: 1.5 }],
}), 'orçamento');
check('orçamento: subtotal 10×20 = 200 e total 220', orc.subtotal === 200 && orc.total === 220, JSON.stringify(orc));
check('orçamento não baixa estoque', (await prod(p.id)).qtdAtual === base + 100);
const edit = await must(patch(`/vendas/${orc.id}`, { itens: [{ produtoId: p.id, quantidade: 15, cortarParaM: 1.5 }] }), 'editar');
check('editar itens recalcula (15×20 + 30 − 10 = 320)', edit.total === 320, `total=${edit.total}`);
const cancelavel = await must(post('/vendas', { itens: [{ produtoId: p.id, quantidade: 1 }] }), 'orc2');
check('orçamento pode ser cancelado', (await must(post(`/vendas/${cancelavel.id}/cancelar`), 'cancelar')).status === 'cancelada');

console.log('Venda → estoque insuficiente');
const grande = await must(post('/vendas', { itens: [{ produtoId: p.id, quantidade: 999999 }] }), 'orc grande');
await rejeita('fechar acima do estoque é recusado', post(`/vendas/${grande.id}/fechar`, { formaPagamento: 'pix' }), 422, 'Estoque insuficiente');
check('estoque intacto após recusa', (await prod(p.id)).qtdAtual === base + 100);
await must(post(`/vendas/${grande.id}/cancelar`), 'cancelar grande');

console.log('Venda → fechar (cascata)');
await rejeita('fechar a prazo exige vencimento', post(`/vendas/${orc.id}/fechar`, { formaPagamento: 'prazo' }), 422);
const caixaAntes = await caixa();
const fechada = await must(post(`/vendas/${orc.id}/fechar`, { formaPagamento: 'pix' }), 'fechar');
check('venda fechada e paga', fechada.status === 'fechada' && fechada.statusPagamento === 'pago');
check('baixou 15 do estoque', (await prod(p.id)).qtdAtual === base + 85);
check('caixa subiu R$ 320', (await caixa()).saldo === caixaAntes.saldo + 320);
const tarefas = await must(get(`/patio/tarefas?vendaId=${orc.id}`), 'tarefas');
check('pátio: 1 separar + 1 preparar (corte)', tarefas.length === 2 &&
  tarefas.some((t) => t.tipo === 'separar') && tarefas.some((t) => t.tipo === 'preparar'), JSON.stringify(tarefas.map((t) => t.tipo)));
await rejeita('fechar de novo é recusado', post(`/vendas/${orc.id}/fechar`, { formaPagamento: 'pix' }), 422);
await rejeita('fechada não pode ser cancelada', post(`/vendas/${orc.id}/cancelar`), 422);

console.log('Entrega → trava do pátio e fluxo de status');
const entrega = (await must(get(`/entregas?vendaId=${orc.id}`), 'entrega'))[0];
check('entrega criada em a_carregar', entrega?.status === 'a_carregar');
await rejeita('não avança com pátio pendente', post(`/entregas/${entrega.id}/avancar`), 422, 'pendente');
for (const t of tarefas) await must(post(`/patio/tarefas/${t.id}/concluir`), 'concluir');
await rejeita('tarefa concluída não conclui de novo', post(`/patio/tarefas/${tarefas[0].id}/concluir`), 422);
const mot = (await must(get('/funcionarios?funcao=motorista'), 'motoristas'))[0];
const cam = (await must(get('/caminhoes'), 'caminhões'))[0];
await must(patch(`/entregas/${entrega.id}`, { motoristaId: mot?.id, caminhaoId: cam?.id, dataAgendada: isoDay(1), turno: 'tarde' }), 'agendar');
const seq = [];
for (let i = 0; i < 3; i++) seq.push((await must(post(`/entregas/${entrega.id}/avancar`), 'avançar')).status);
check('a_carregar → carregado → em_rota → entregue', seq.join('>') === 'carregado>em_rota>entregue', seq.join('>'));
await rejeita('entrega concluída não avança', post(`/entregas/${entrega.id}/avancar`), 422);

console.log('Financeiro');
const aPrazo = await must(post('/vendas', { itens: [{ produtoId: p.id, quantidade: 2 }] }), 'venda prazo');
await must(post(`/vendas/${aPrazo.id}/fechar`, { formaPagamento: 'prazo', vencimento: isoDay(20) }), 'fechar prazo');
const aReceber = (await must(get('/financeiro/lancamentos?origemTipo=venda&situacao=previsto'), 'a receber'))
  .find((l) => l.vendaId === aPrazo.id);
check('venda a prazo gera conta a receber prevista', aReceber?.valor === 40);
const c0 = await caixa();
await must(post(`/financeiro/lancamentos/${aReceber.id}/realizar`), 'realizar');
check('realizar recebimento soma no caixa', (await caixa()).saldo === c0.saldo + 40);
await rejeita('realizar duas vezes é recusado', post(`/financeiro/lancamentos/${aReceber.id}/realizar`), 422);
await rejeita('despesa avulsa com valor negativo é recusada',
  post('/financeiro/lancamentos', { sentido: 'saida', descricao: 'x', valor: -5 }), 400);

console.log('Rota do dia (mapa e ordem das paradas)');
const dia = isoDay(60 + Math.floor(Math.random() * 3000)); // dia futuro aleatório: isolado, não mexe na rota de hoje
const comEndereco = (await must(get('/clientes'), 'clientes')).filter((c) => c.endereco && /Jundiaí/.test(c.endereco)).slice(0, 3);
const criadas = [];
let qtdRota = 0;
for (const [i, c] of comEndereco.entries()) {
  const qtd = i === 1 ? 40 : 1; // a 2ª é uma entrega grande: deve levar mais tempo para descarregar
  qtdRota += qtd;
  const v = await must(post('/vendas', { clienteId: c.id, tipoEntrega: 'entrega', itens: [{ produtoId: p.id, quantidade: qtd }] }), 'venda rota');
  await must(post(`/vendas/${v.id}/fechar`, { formaPagamento: 'pix' }), 'fechar rota');
  const e = (await must(get(`/entregas?vendaId=${v.id}`), 'entrega rota'))[0];
  await must(patch(`/entregas/${e.id}`, { dataAgendada: dia, turno: i === 0 ? 'tarde' : 'manha' }), 'agendar rota');
  criadas.push(e.id);
}
const semEnd = await must(post('/vendas', { tipoEntrega: 'entrega', itens: [{ produtoId: p.id, quantidade: 1 }] }), 'venda sem endereço');
await must(post(`/vendas/${semEnd.id}/fechar`, { formaPagamento: 'pix' }), 'fechar sem endereço');
const eSem = (await must(get(`/entregas?vendaId=${semEnd.id}`), 'entrega sem'))[0];
await must(patch(`/entregas/${eSem.id}`, { dataAgendada: dia }), 'agendar sem');

const rota = await must(get(`/entregas/rota?data=${dia}`), 'rota');
check('rota tem as 3 paradas localizadas', rota.paradas.length === 3 && criadas.every((id) => rota.paradas.some((x) => x.entregaId === id)), `paradas=${rota.paradas.length}`);
check('1ª chamada sugere ordem (ainda não salva)', rota.origemOrdem === 'otimizada');
check('turno é regra: a parada da tarde fica por último', rota.paradas.at(-1).entregaId === criadas[0], rota.paradas.map((x) => x.turno).join('>'));
check('ordem numerada 1..n', rota.paradas.every((x, i) => x.ordem === i + 1));
check('distância, tempo e retorno à madeireira calculados', rota.total.distanciaKm > 0 && rota.total.duracaoMin > 0 && rota.retorno.distanciaKm > 0);
check('traçado pelas ruas tem muitos pontos', rota.geometria.length > 10 || rota.aproximado);
const hm = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const paradaGrande = rota.paradas.find((x) => x.entregaId === criadas[1]);
const pequenas = rota.paradas.filter((x) => x.entregaId !== criadas[1]);
check('descarga é proporcional ao tamanho da entrega', pequenas.every((x) => x.descargaMin > 0 && x.descargaMin < paradaGrande.descargaMin), `grande=${paradaGrande.descargaMin} pequenas=${pequenas.map((x) => x.descargaMin)}`);
check('a entrega só conclui depois de descarregar (fim = chegada + descarga)', rota.paradas.every((x) => hm(x.fimPrevisto) - hm(x.chegadaPrevista) === x.descargaMin));
check('a descarga empurra as paradas seguintes', rota.paradas.every((x, i) => i === 0 || hm(x.chegadaPrevista) >= hm(rota.paradas[i - 1].fimPrevisto) + x.duracaoMin));
check('parada da tarde não chega antes das 13:00', hm(rota.paradas.at(-1).chegadaPrevista) >= 13 * 60);
check('jornada = viagem + descarga + espera + retorno', rota.total.jornadaMin === rota.paradas.reduce((s, x) => s + x.duracaoMin + x.descargaMin + x.esperaMin, 0) + rota.retorno.duracaoMin);
check('horário de saída é respeitado', (await must(get(`/entregas/rota?data=${dia}&saida=07:00`), 'saida')).paradas[0].chegadaPrevista < rota.paradas[0].chegadaPrevista);
await rejeita('horário de saída inválido é recusado', get(`/entregas/rota?data=${dia}&saida=25:99`), 400);
check('entrega sem endereço vai para "sem localização"', rota.semLocalizacao.some((x) => x.entregaId === eSem.id && x.motivo.includes('Sem endereço')));
check('parada fica perto da madeireira (geocodificação sã)', rota.paradas.every((x) => Math.abs(x.latitude - rota.deposito.latitude) < 0.5 && Math.abs(x.longitude - rota.deposito.longitude) < 0.5));

const invertida = [...rota.paradas].reverse().map((x) => x.entregaId);
check('salvar ordem manual', (await must(call('PUT', '/entregas/rota/ordem', { ids: invertida }), 'salvar ordem')).salvas === 3);
const salva = await must(get(`/entregas/rota?data=${dia}`), 'rota salva');
check('ordem salva é respeitada', salva.origemOrdem === 'salva' && salva.paradas.map((x) => x.entregaId).join() === invertida.join());
const sug = await must(get(`/entregas/rota?data=${dia}&otimizar=true`), 'rota otimizar');
check('otimizar=true ignora a salva e não grava', sug.origemOrdem === 'otimizada' &&
  (await must(get(`/entregas/rota?data=${dia}`), 'de novo')).paradas.map((x) => x.entregaId).join() === invertida.join());

const alvo = rota.paradas[0];
await must(patch(`/entregas/${alvo.entregaId}`, { latitude: -23.2, longitude: -46.9 }), 'mover pino');
const movida = (await must(get(`/entregas/rota?data=${dia}`), 'rota movida')).paradas.find((x) => x.entregaId === alvo.entregaId);
check('arrastar o pino grava a nova posição sem perder a ordem salva', movida.latitude === -23.2 && movida.longitude === -46.9);
await must(patch(`/entregas/${alvo.entregaId}`, { endereco: 'Avenida Jundiaí, 1200 - Jundiaí - SP' }), 'novo endereço');
const regeo = (await must(get(`/entregas/rota?data=${dia}`), 'rota regeo')).paradas.find((x) => x.entregaId === alvo.entregaId);
check('mudar o endereço refaz a geocodificação', regeo && regeo.latitude !== -23.2);
await rejeita('data inválida é recusada', get('/entregas/rota?data=amanha'), 400);
await rejeita('salvar ordem com entrega inexistente é recusado', call('PUT', '/entregas/rota/ordem', { ids: ['00000000-0000-4000-8000-000000000000'] }), 422);
const vazio = await must(get('/entregas/rota?data=2099-01-01'), 'rota vazia');
check('dia sem entregas devolve rota vazia', vazio.paradas.length === 0 && vazio.total.paradas === 0);

console.log('Estoque e movimentos');
const final = await prod(p.id);
check('estoque final = base + 100 − 15 − 2 − (vendas da rota)', final.qtdAtual === base + 83 - qtdRota - 1, `qtd=${final.qtdAtual} base=${base}`);

console.log(`\n${total - falhas}/${total} verificações passaram.`);
process.exit(falhas ? 1 : 0);
