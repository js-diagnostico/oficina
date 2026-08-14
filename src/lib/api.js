import { supabase } from '../supabaseClient';
import { CATEGORIAS_SERVICO } from './constants';

export async function inserirPerfilComRetry(id, nome, papel, tentativas = 5, delayMs = 500) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    const { error } = await supabase.from('profiles').insert({ id, nome, papel });
    if (!error) return;
    ultimoErro = error;
    // 23503 = violação de chave estrangeira (o usuário do Auth ainda não "assentou" no banco) — vale tentar de novo
    if (error.code !== '23503') break;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw ultimoErro;
}

// ---------- mapeamento OS ----------
function osRowToObj(row) {
  return {
    id: row.id,
    numero: row.numero,
    status: row.status,
    cliente: row.cliente || { nome: '', telefone: '' },
    veiculo: row.veiculo || { placa: '', modelo: '', ano: '', km: '' },
    problema: row.problema || '',
    laudoTecnico: row.laudo_tecnico || '',
    formaPagamento: row.forma_pagamento || '',
    garantiaDias: row.garantia_dias || '',
    nivelCombustivel: row.nivel_combustivel || '',
    checklist: row.checklist || [],
    servicos: row.servicos || [],
    pecas: row.pecas || [],
    observacoes: row.observacoes || '',
    mecanicoId: row.mecanico_id || '',
    vendedorId: row.vendedor_id || '',
    dataEntrada: row.data_entrada || '',
    previsao: row.previsao || '',
    dataConclusao: row.data_conclusao,
    estoqueBaixado: !!row.estoque_baixado,
    createdAt: row.created_at,
  };
}
function osObjToRow(os) {
  return {
    numero: os.numero,
    status: os.status,
    cliente: os.cliente,
    veiculo: os.veiculo,
    problema: os.problema || null,
    laudo_tecnico: os.laudoTecnico || null,
    forma_pagamento: os.formaPagamento || null,
    garantia_dias: os.garantiaDias || null,
    nivel_combustivel: os.nivelCombustivel || null,
    checklist: os.checklist || [],
    servicos: os.servicos || [],
    pecas: os.pecas || [],
    observacoes: os.observacoes || null,
    mecanico_id: os.mecanicoId || null,
    vendedor_id: os.vendedorId || null,
    data_entrada: os.dataEntrada || null,
    previsao: os.previsao || null,
    data_conclusao: os.dataConclusao || null,
    estoque_baixado: !!os.estoqueBaixado,
  };
}

export async function fetchOrdens() {
  const { data, error } = await supabase.from('ordens_servico').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(osRowToObj);
}
export async function proximoNumeroOS() {
  const { count, error } = await supabase.from('ordens_servico').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return 'OS-' + String((count || 0) + 1).padStart(4, '0');
}
export async function criarOS(os) {
  const numero = os.numero || (await proximoNumeroOS());
  const { data, error } = await supabase.from('ordens_servico').insert({ ...osObjToRow(os), numero }).select().single();
  if (error) throw error;
  return osRowToObj(data);
}
export async function atualizarOS(id, os) {
  const { data, error } = await supabase.from('ordens_servico').update(osObjToRow(os)).eq('id', id).select().single();
  if (error) throw error;
  return osRowToObj(data);
}
export async function excluirOS(id) {
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Clientes ----------
function clienteRowToObj(row) {
  return { id: row.id, nome: row.nome, telefone: row.telefone || '', documento: row.documento || '', endereco: row.endereco || '', veiculos: row.veiculos || [] };
}
function clienteObjToRow(c) {
  return { nome: c.nome, telefone: c.telefone || null, documento: c.documento || null, endereco: c.endereco || null, veiculos: c.veiculos || [] };
}
export async function fetchClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
  if (error) throw error;
  return (data || []).map(clienteRowToObj);
}
export async function salvarClienteApi(cliente) {
  if (cliente.id) {
    const { data, error } = await supabase.from('clientes').update(clienteObjToRow(cliente)).eq('id', cliente.id).select().single();
    if (error) throw error;
    return clienteRowToObj(data);
  }
  const { data, error } = await supabase.from('clientes').insert(clienteObjToRow(cliente)).select().single();
  if (error) throw error;
  return clienteRowToObj(data);
}
export async function excluirClienteApi(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Estoque ----------
function pecaRowToObj(row) {
  return { id: row.id, codigo: row.codigo || '', descricao: row.descricao, categoria: row.categoria || '', custo: row.custo, preco: row.preco, estoqueAtual: row.estoque_atual, estoqueMin: row.estoque_min };
}
function pecaObjToRow(p) {
  return { codigo: p.codigo || null, descricao: p.descricao, categoria: p.categoria || null, custo: parseFloat(p.custo) || 0, preco: parseFloat(p.preco) || 0, estoque_atual: parseFloat(p.estoqueAtual) || 0, estoque_min: parseFloat(p.estoqueMin) || 0 };
}
export async function fetchEstoque() {
  const { data, error } = await supabase.from('estoque').select('*').order('descricao', { ascending: true });
  if (error) throw error;
  return (data || []).map(pecaRowToObj);
}
export async function salvarPecaApi(peca) {
  if (peca.id) {
    const { data, error } = await supabase.from('estoque').update(pecaObjToRow(peca)).eq('id', peca.id).select().single();
    if (error) throw error;
    return pecaRowToObj(data);
  }
  const { data, error } = await supabase.from('estoque').insert(pecaObjToRow(peca)).select().single();
  if (error) throw error;
  return pecaRowToObj(data);
}
export async function ajustarEstoqueApi(id, delta) {
  const { data: atual, error: e1 } = await supabase.from('estoque').select('estoque_atual').eq('id', id).single();
  if (e1) throw e1;
  const novo = (parseFloat(atual.estoque_atual) || 0) + delta;
  const { error: e2 } = await supabase.from('estoque').update({ estoque_atual: novo }).eq('id', id);
  if (e2) throw e2;
}
export async function excluirPecaApi(id) {
  const { error } = await supabase.from('estoque').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Catálogo de serviços ----------
function servicoCatRowToObj(row) {
  return { id: row.id, nome: row.nome, categoria: row.categoria, valorPadrao: row.valor_padrao, descricao: row.descricao || '' };
}
function servicoCatObjToRow(s) {
  return { nome: s.nome, categoria: s.categoria, valor_padrao: parseFloat(s.valorPadrao) || 0, descricao: s.descricao || null };
}
export async function fetchCatalogoServicos() {
  const { data, error } = await supabase.from('catalogo_servicos').select('*').order('categoria', { ascending: true });
  if (error) throw error;
  return (data || []).map(servicoCatRowToObj);
}
export async function salvarServicoCatalogoApi(servico) {
  if (servico.id) {
    const { data, error } = await supabase.from('catalogo_servicos').update(servicoCatObjToRow(servico)).eq('id', servico.id).select().single();
    if (error) throw error;
    return servicoCatRowToObj(data);
  }
  const { data, error } = await supabase.from('catalogo_servicos').insert(servicoCatObjToRow(servico)).select().single();
  if (error) throw error;
  return servicoCatRowToObj(data);
}
export async function excluirServicoCatalogoApi(id) {
  const { error } = await supabase.from('catalogo_servicos').delete().eq('id', id);
  if (error) throw error;
}
export async function semearCatalogoSeVazio() {
  const { count, error } = await supabase.from('catalogo_servicos').select('id', { count: 'exact', head: true });
  if (error) throw error;
  if (count && count > 0) return;
  const SERVICOS_PADRAO = [
    { nome: 'Diagnóstico eletrônico (scanner)', precos: [80, 100, 130, 140, 180, 220, 250] },
    { nome: 'Verificação do sistema de carga', precos: [100, 120, 150, 160, 200, 250, 280] },
    { nome: 'Revisão elétrica completa', precos: [180, 220, 280, 300, 380, 450, 500] },
    { nome: 'Reparo de chicote elétrico (por ponto)', precos: [90, 110, 140, 150, 190, 230, 260] },
  ];
  const linhas = SERVICOS_PADRAO.flatMap((s) => CATEGORIAS_SERVICO.map((cat, idx) => ({ nome: s.nome, categoria: cat, valor_padrao: s.precos[idx], descricao: null })));
  const { error: e2 } = await supabase.from('catalogo_servicos').insert(linhas);
  if (e2) throw e2;
}

// ---------- Equipe (funcionários para comissão) ----------
function funcionarioRowToObj(row) {
  return { id: row.id, nome: row.nome, papel: row.papel, percentual: row.percentual, telefone: row.telefone || '' };
}
function funcionarioObjToRow(f) {
  return { nome: f.nome, papel: f.papel, percentual: parseFloat(f.percentual) || 0, telefone: f.telefone || null };
}
export async function fetchFuncionarios() {
  const { data, error } = await supabase.from('funcionarios').select('*').order('nome', { ascending: true });
  if (error) throw error;
  return (data || []).map(funcionarioRowToObj);
}
export async function salvarFuncionarioApi(func) {
  if (func.id) {
    const { data, error } = await supabase.from('funcionarios').update(funcionarioObjToRow(func)).eq('id', func.id).select().single();
    if (error) throw error;
    return funcionarioRowToObj(data);
  }
  const { data, error } = await supabase.from('funcionarios').insert(funcionarioObjToRow(func)).select().single();
  if (error) throw error;
  return funcionarioRowToObj(data);
}
export async function excluirFuncionarioApi(id) {
  const { error } = await supabase.from('funcionarios').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Comissões pagas ----------
export async function fetchComissoesPagas() {
  const { data, error } = await supabase.from('comissoes_pagas').select('*');
  if (error) throw error;
  const obj = {};
  (data || []).forEach((r) => { obj[r.chave] = r.pago; });
  return obj;
}
export async function alternarComissaoPagaApi(chave, pago) {
  const { error } = await supabase.from('comissoes_pagas').upsert({ chave, pago });
  if (error) throw error;
}

// ---------- Config da oficina ----------
function configRowToObj(row) {
  return { nome: row.nome, telefone: row.telefone || '', endereco: row.endereco || '', garantiaPadraoDias: row.garantia_padrao_dias || '', termosGarantia: row.termos_garantia || '' };
}
export async function fetchConfig() {
  const { data, error } = await supabase.from('config').select('*').eq('id', 1).single();
  if (error) throw error;
  return configRowToObj(data);
}
export async function salvarConfigApi(config) {
  const { error } = await supabase.from('config').update({
    nome: config.nome, telefone: config.telefone, endereco: config.endereco,
    garantia_padrao_dias: config.garantiaPadraoDias, termos_garantia: config.termosGarantia,
  }).eq('id', 1);
  if (error) throw error;
}

// ---------- Perfis (usuários do app) ----------
export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('nome', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => ({ id: r.id, nome: r.nome, papel: r.papel }));
}
export async function excluirProfileApi(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}
export async function atualizarProfileApi(id, dados) {
  const { error } = await supabase.from('profiles').update(dados).eq('id', id);
  if (error) throw error;
}
