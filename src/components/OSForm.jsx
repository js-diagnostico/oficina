import React, { useState } from 'react';
import { ChevronLeft, User, Car, Gauge, Wrench, Package, ClipboardList, Percent, AlertCircle, Trash2, Sparkles } from 'lucide-react';
import { COLORS, STATUS, STATUS_CHECKLIST, FORMAS_PAGAMENTO, brl, totaisOS, inputCls, uid } from '../lib/constants';
import { Section, Field, AddBtn } from './UI';
import CarroDiagrama from './CarroDiagrama';

export default function OSForm({ osInicial, clientes, estoque, funcionarios, catalogoServicos, config, onSalvar, onCancelar }) {
  const [form, setForm] = useState(osInicial);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [clienteSelId, setClienteSelId] = useState('');
  const [sugestaoIA, setSugestaoIA] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState('');

  const clienteSel = clientes.find((c) => c.id === clienteSelId);
  const mecanicos = funcionarios.filter((f) => f.papel === 'mecanico' || f.papel === 'ambos');
  const vendedores = funcionarios.filter((f) => f.papel === 'vendedor' || f.papel === 'ambos');
  const categoriasComServico = [...new Set(catalogoServicos.map((c) => c.categoria))];

  const selecionarCliente = (id) => {
    setClienteSelId(id);
    const c = clientes.find((x) => x.id === id);
    if (c) setForm((f) => ({ ...f, cliente: { nome: c.nome, telefone: c.telefone } }));
  };
  const selecionarVeiculo = (veiculoId) => {
    const v = clienteSel && clienteSel.veiculos.find((x) => x.id === veiculoId);
    if (v) setForm((f) => ({ ...f, veiculo: { ...f.veiculo, placa: v.placa, modelo: v.modelo, ano: v.ano, chassi: v.chassi || '' } }));
  };

  const addServico = () => setForm((f) => ({ ...f, servicos: [...f.servicos, { id: uid(), descricao: '', valor: '', servicoId: '' }] }));
  const updServico = (id, field, val) => setForm((f) => ({ ...f, servicos: f.servicos.map((s) => (s.id === id ? { ...s, [field]: val } : s)) }));
  const rmServico = (id) => setForm((f) => ({ ...f, servicos: f.servicos.filter((s) => s.id !== id) }));
  const linkServicoCatalogo = (id, servicoId) => setForm((f) => ({
    ...f,
    servicos: f.servicos.map((s) => {
      if (s.id !== id) return s;
      if (!servicoId) return { ...s, servicoId: '' };
      const item = catalogoServicos.find((c) => c.id === servicoId);
      return { ...s, servicoId, descricao: item ? item.nome : s.descricao, valor: item ? item.valorPadrao : s.valor };
    }),
  }));

  const addPeca = () => setForm((f) => ({ ...f, pecas: [...f.pecas, { id: uid(), descricao: '', qtd: 1, valorUnit: '', estoqueId: '' }] }));
  const updPeca = (id, field, val) => setForm((f) => ({ ...f, pecas: f.pecas.map((p) => (p.id === id ? { ...p, [field]: val } : p)) }));
  const rmPeca = (id) => setForm((f) => ({ ...f, pecas: f.pecas.filter((p) => p.id !== id) }));
  const linkPecaEstoque = (id, estoqueId) => setForm((f) => ({
    ...f,
    pecas: f.pecas.map((p) => {
      if (p.id !== id) return p;
      if (!estoqueId) return { ...p, estoqueId: '' };
      const item = estoque.find((e) => e.id === estoqueId);
      return { ...p, estoqueId, descricao: item ? item.descricao : p.descricao, valorUnit: item ? item.preco : p.valorUnit };
    }),
  }));

  const setChecklistStatus = (id, status) => setForm((f) => ({ ...f, checklist: f.checklist.map((c) => (c.id === id ? { ...c, status: c.status === status ? '' : status } : c)) }));
  const addChecklistItem = () => setForm((f) => ({ ...f, checklist: [...f.checklist, { id: uid(), nome: '', status: '' }] }));
  const updChecklistNome = (id, nome) => setForm((f) => ({ ...f, checklist: f.checklist.map((c) => (c.id === id ? { ...c, nome } : c)) }));
  const rmChecklistItem = (id) => setForm((f) => ({ ...f, checklist: f.checklist.filter((c) => c.id !== id) }));

  const clicarDiagrama = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setForm((f) => ({ ...f, avarias: [...(f.avarias || []), { id: uid(), x, y, nota: '' }] }));
  };
  const atualizarNotaAvaria = (id, nota) => setForm((f) => ({ ...f, avarias: f.avarias.map((a) => (a.id === id ? { ...a, nota } : a)) }));
  const removerAvaria = (id) => setForm((f) => ({ ...f, avarias: f.avarias.filter((a) => a.id !== id) }));

  const pedirSugestaoIA = async () => {
    if (!form.problema.trim()) { setErroIA('Descreva o problema relatado antes de pedir a sugestão.'); return; }
    setErroIA('');
    setSugestaoIA(null);
    setCarregandoIA(true);
    try {
      const resp = await fetch('/api/sugerir-preco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: form.problema, veiculo: form.veiculo.modelo }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.error || 'Não foi possível gerar a sugestão.');
      setSugestaoIA(dados);
    } catch (e) {
      setErroIA(e.message || 'Não foi possível gerar a sugestão.');
    } finally {
      setCarregandoIA(false);
    }
  };

  const usarSugestaoIA = () => {
    if (!sugestaoIA) return;
    setForm((f) => ({ ...f, servicos: [...f.servicos, { id: uid(), descricao: 'Serviço (sugestão IA)', valor: String(sugestaoIA.valorSugerido), servicoId: '' }] }));
    setSugestaoIA(null);
  };

  const submit = async () => {
    if (!form.cliente.nome.trim()) { setErro('Informe o nome do cliente.'); return; }
    if (!form.veiculo.placa.trim()) { setErro('Informe a placa do veículo.'); return; }
    setErro('');
    setSalvando(true);
    try {
      await onSalvar(form);
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar a OS.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <button onClick={onCancelar} className="flex items-center gap-1 mb-4 text-sm" style={{ color: COLORS.textMuted }}><ChevronLeft size={16} /> Voltar ao painel</button>
      <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink, marginBottom: '4px' }}>{form.id ? `EDITAR ${form.numero}` : 'NOVA ORDEM DE SERVIÇO'}</h1>
      <p style={{ color: COLORS.textMuted, fontSize: '14px', marginBottom: '24px' }}>Preencha os dados do cliente, veículo e os itens do serviço.</p>

      {erro && <div className="flex items-center gap-2 px-3 py-2 mb-4 text-sm" style={{ background: COLORS.redSoft, color: COLORS.red }}><AlertCircle size={16} /> {erro}</div>}

      <Section title="Cliente" icon={User}>
        {clientes.length > 0 && (
          <Field label="Cliente cadastrado" full>
            <select value={clienteSelId} className={inputCls} onChange={(e) => selecionarCliente(e.target.value)}>
              <option value="">Digitar manualmente…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
        )}
        {clienteSel && clienteSel.veiculos.length > 0 && (
          <Field label="Veículo do cliente" full>
            <select className={inputCls} onChange={(e) => selecionarVeiculo(e.target.value)} defaultValue="">
              <option value="">Selecionar veículo cadastrado…</option>
              {clienteSel.veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>)}
            </select>
          </Field>
        )}
        <Field label="Nome *"><input value={form.cliente.nome} onChange={(e) => setForm((f) => ({ ...f, cliente: { ...f.cliente, nome: e.target.value } }))} className={inputCls} /></Field>
        <Field label="Telefone"><input value={form.cliente.telefone} onChange={(e) => setForm((f) => ({ ...f, cliente: { ...f.cliente, telefone: e.target.value } }))} className={inputCls} placeholder="(00) 00000-0000" /></Field>
      </Section>

      <Section title="Veículo" icon={Car}>
        <Field label="Placa *"><input value={form.veiculo.placa} onChange={(e) => setForm((f) => ({ ...f, veiculo: { ...f.veiculo, placa: e.target.value.toUpperCase() } }))} className={inputCls} style={{ fontFamily: "'Roboto Mono', monospace" }} placeholder="ABC1D23" /></Field>
        <Field label="Chassi"><input value={form.veiculo.chassi} onChange={(e) => setForm((f) => ({ ...f, veiculo: { ...f.veiculo, chassi: e.target.value.toUpperCase() } }))} className={inputCls} style={{ fontFamily: "'Roboto Mono', monospace" }} placeholder="9BW..." /></Field>
        <Field label="Modelo / Marca"><input value={form.veiculo.modelo} onChange={(e) => setForm((f) => ({ ...f, veiculo: { ...f.veiculo, modelo: e.target.value } }))} className={inputCls} placeholder="Ex.: VW Gol 1.6" /></Field>
        <Field label="Ano"><input value={form.veiculo.ano} onChange={(e) => setForm((f) => ({ ...f, veiculo: { ...f.veiculo, ano: e.target.value } }))} className={inputCls} placeholder="2018" /></Field>
        <Field label="Km atual"><input value={form.veiculo.km} onChange={(e) => setForm((f) => ({ ...f, veiculo: { ...f.veiculo, km: e.target.value } }))} className={inputCls} placeholder="Ex.: 84.000" /></Field>
      </Section>

      <Section title="Check-list de entrada do veículo" icon={ClipboardList} action={<AddBtn onClick={addChecklistItem} label="Item" />}>
        <Field label="Nível de combustível" full>
          <select value={form.nivelCombustivel} onChange={(e) => setForm((f) => ({ ...f, nivelCombustivel: e.target.value }))} className={inputCls}>
            <option value="">Não verificado</option>
            <option value="Reserva">Reserva</option>
            <option value="1/4">1/4</option>
            <option value="1/2">1/2</option>
            <option value="3/4">3/4</option>
            <option value="Cheio">Cheio</option>
          </select>
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          {form.checklist.map((c) => (
            <div key={c.id} className="flex items-center gap-2 mb-2 flex-wrap">
              <input value={c.nome} onChange={(e) => updChecklistNome(c.id, e.target.value)} className={inputCls} style={{ flex: 1, minWidth: '140px', border: `1px solid ${COLORS.line}` }} placeholder="Item verificado" />
              {Object.entries(STATUS_CHECKLIST).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setChecklistStatus(c.id, k)} className="px-2 py-1 text-xs shrink-0" style={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', background: c.status === k ? v.bg : 'transparent', color: c.status === k ? v.fg : COLORS.textMuted, border: `1px solid ${c.status === k ? v.fg : COLORS.line}` }}>{v.label}</button>
              ))}
              <button onClick={() => rmChecklistItem(c.id)} style={{ color: COLORS.red }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Avarias no veículo (toque no desenho para marcar)</div>
          <CarroDiagrama avarias={form.avarias} editavel onClickDiagrama={clicarDiagrama} onRemoveMarker={removerAvaria} />
          {form.avarias.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 max-w-sm mx-auto">
              {form.avarias.map((a, idx) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: COLORS.red, color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Oswald', sans-serif" }}>{idx + 1}</span>
                  <input value={a.nota} onChange={(e) => atualizarNotaAvaria(a.id, e.target.value)} className={inputCls} placeholder="Ex.: risco na porta, amassado no para-choque…" style={{ flex: 1, border: `1px solid ${COLORS.line}` }} />
                  <button onClick={() => removerAvaria(a.id)} style={{ color: COLORS.red, flexShrink: 0 }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
          {form.avarias.length === 0 && <p className="text-center" style={{ color: COLORS.textMuted, fontSize: '12px', marginTop: '6px' }}>Nenhuma avaria marcada.</p>}
        </div>
      </Section>

      <Section title="Diagnóstico" icon={Gauge}>
        <Field label="Problema relatado" full><textarea value={form.problema} onChange={(e) => setForm((f) => ({ ...f, problema: e.target.value }))} className={inputCls} rows={3} placeholder="Descreva o problema relatado pelo cliente" /></Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="button" onClick={pedirSugestaoIA} disabled={carregandoIA} className="flex items-center gap-2 text-xs px-3 py-1.5 mb-2" style={{ color: COLORS.navy, border: `1px solid ${COLORS.navy}`, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', opacity: carregandoIA ? 0.6 : 1, background: 'transparent' }}>
            <Sparkles size={14} /> {carregandoIA ? 'Consultando IA…' : 'Sugerir preço com IA'}
          </button>
          {erroIA && <p style={{ fontSize: '12px', color: COLORS.red, marginBottom: '8px' }}>{erroIA}</p>}
          {sugestaoIA && (
            <div className="p-3 mb-3" style={{ background: COLORS.navySoft, border: `1px solid ${COLORS.navy}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '18px', color: COLORS.navy }}>{brl(sugestaoIA.valorSugerido)}</span>
                  <span style={{ fontSize: '12px', color: COLORS.textMuted, marginLeft: '8px' }}>(faixa: {brl(sugestaoIA.faixaMin)} – {brl(sugestaoIA.faixaMax)})</span>
                </div>
                <button type="button" onClick={usarSugestaoIA} className="px-3 py-1.5 text-xs" style={{ background: COLORS.navy, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>Adicionar como serviço</button>
              </div>
              {sugestaoIA.justificativa && <p style={{ fontSize: '12px', color: COLORS.ink, marginTop: '6px' }}>{sugestaoIA.justificativa}</p>}
              <p style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '6px' }}>Sugestão gerada por IA, apenas uma estimativa — confira antes de usar.</p>
            </div>
          )}
        </div>
        <Field label="Mecânico responsável">
          <select value={form.mecanicoId} onChange={(e) => setForm((f) => ({ ...f, mecanicoId: e.target.value }))} className={inputCls}>
            <option value="">Selecionar…</option>
            {mecanicos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </Field>
        <Field label="Vendedor (peças)">
          <select value={form.vendedorId} onChange={(e) => setForm((f) => ({ ...f, vendedorId: e.target.value }))} className={inputCls}>
            <option value="">Selecionar…</option>
            {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Data de entrada"><input type="date" value={form.dataEntrada} onChange={(e) => setForm((f) => ({ ...f, dataEntrada: e.target.value }))} className={inputCls} /></Field>
        <Field label="Previsão de entrega"><input type="date" value={form.previsao} onChange={(e) => setForm((f) => ({ ...f, previsao: e.target.value }))} className={inputCls} /></Field>
      </Section>

      <Section title="Serviços (mão de obra)" icon={Wrench} action={<AddBtn onClick={addServico} label="Serviço" />}>
        {form.servicos.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>Nenhum serviço adicionado.</p>}
        {form.servicos.map((s) => (
          <div key={s.id} className="flex flex-col gap-2 mb-3 pb-3" style={{ gridColumn: '1 / -1', borderBottom: `1px solid ${COLORS.line}` }}>
            {catalogoServicos.length > 0 && (
              <select value={s.servicoId || ''} onChange={(e) => linkServicoCatalogo(s.id, e.target.value)} className={inputCls} style={{ border: `1px solid ${COLORS.line}` }}>
                <option value="">Serviço avulso (não vincular ao catálogo)</option>
                {categoriasComServico.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {catalogoServicos.filter((c) => c.categoria === cat).map((c) => (
                      <option key={c.id} value={c.id}>{c.nome} — {brl(c.valorPadrao)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            <div className="flex gap-2 items-center">
              <input value={s.descricao} onChange={(e) => updServico(s.id, 'descricao', e.target.value)} className={inputCls} placeholder="Descrição do serviço" style={{ flex: 1, border: `1px solid ${COLORS.line}` }} />
              <input value={s.valor} onChange={(e) => updServico(s.id, 'valor', e.target.value)} className={inputCls} placeholder="R$" style={{ width: '110px', fontFamily: "'Roboto Mono', monospace", border: `1px solid ${COLORS.line}` }} inputMode="decimal" />
              <button onClick={() => rmServico(s.id)} style={{ color: COLORS.red }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Peças / material automotivo" icon={Package} action={<AddBtn onClick={addPeca} label="Peça" />}>
        {form.pecas.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>Nenhuma peça adicionada.</p>}
        {form.pecas.map((p) => (
          <div key={p.id} className="flex flex-col gap-2 mb-3 pb-3" style={{ gridColumn: '1 / -1', borderBottom: `1px solid ${COLORS.line}` }}>
            {estoque.length > 0 && (
              <select value={p.estoqueId || ''} onChange={(e) => linkPecaEstoque(p.id, e.target.value)} className={inputCls} style={{ border: `1px solid ${COLORS.line}` }}>
                <option value="">Item avulso (não vincular ao estoque)</option>
                {estoque.map((it) => <option key={it.id} value={it.id}>{it.codigo ? `${it.codigo} — ` : ''}{it.descricao} (estoque: {it.estoqueAtual || 0})</option>)}
              </select>
            )}
            <div className="flex gap-2 items-center">
              <input value={p.descricao} onChange={(e) => updPeca(p.id, 'descricao', e.target.value)} className={inputCls} placeholder="Descrição da peça" style={{ flex: 1, border: `1px solid ${COLORS.line}` }} />
              <input value={p.qtd} onChange={(e) => updPeca(p.id, 'qtd', e.target.value)} className={inputCls} placeholder="Qtd" style={{ width: '60px', fontFamily: "'Roboto Mono', monospace", border: `1px solid ${COLORS.line}` }} inputMode="numeric" />
              <input value={p.valorUnit} onChange={(e) => updPeca(p.id, 'valorUnit', e.target.value)} className={inputCls} placeholder="Vlr. unit." style={{ width: '110px', fontFamily: "'Roboto Mono', monospace", border: `1px solid ${COLORS.line}` }} inputMode="decimal" />
              <button onClick={() => rmPeca(p.id)} style={{ color: COLORS.red }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Laudo técnico, pagamento e garantia" icon={Percent}>
        <Field label="Laudo técnico" full><textarea value={form.laudoTecnico} onChange={(e) => setForm((f) => ({ ...f, laudoTecnico: e.target.value }))} className={inputCls} rows={3} placeholder="Diagnóstico encontrado, causa do problema e serviço executado" /></Field>
        <Field label="Forma de pagamento">
          <select value={form.formaPagamento} onChange={(e) => setForm((f) => ({ ...f, formaPagamento: e.target.value }))} className={inputCls}>
            <option value="">Selecionar…</option>
            {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label={`Garantia (dias) — padrão: ${config.garantiaPadraoDias || 0}`}>
          <input value={form.garantiaDias} onChange={(e) => setForm((f) => ({ ...f, garantiaDias: e.target.value }))} className={inputCls} inputMode="numeric" placeholder={`Deixe em branco para usar ${config.garantiaPadraoDias || 0} dias`} />
        </Field>
      </Section>

      <Section title="Observações" icon={ClipboardList}>
        <Field label="" full><textarea value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} className={inputCls} rows={2} placeholder="Garantia, condições, recomendações…" /></Field>
      </Section>

      <Section title="Desconto" icon={Percent}>
        <Field label="Desconto (R$)"><input value={form.desconto} onChange={(e) => setForm((f) => ({ ...f, desconto: e.target.value }))} className={inputCls} inputMode="decimal" placeholder="0,00" /></Field>
      </Section>

      {(() => {
        const t = totaisOS(form);
        const linha = (label, valor, destaque) => (
          <div className="flex items-center justify-between py-1.5" style={destaque ? {} : { borderBottom: `1px solid ${COLORS.line}` }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", color: destaque ? COLORS.ink : COLORS.textMuted, textTransform: 'uppercase', fontSize: destaque ? '14px' : '13px' }}>{label}</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: destaque ? '22px' : '15px', color: destaque ? COLORS.red : COLORS.ink }}>{valor}</span>
          </div>
        );
        return (
          <div className="mt-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            {linha('Total produto', brl(t.totalProduto))}
            {linha('Total serviço', brl(t.totalServico))}
            {linha('Total bruto', brl(t.totalBruto))}
            {linha('Desconto', '− ' + brl(t.desconto))}
            {linha('Total líquido', brl(t.totalLiquido), true)}
          </div>
        );
      })()}

      <div className="flex gap-3 mt-6 mb-10">
        <button disabled={salvando} onClick={submit} className="px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: salvando ? 0.6 : 1 }}>{salvando ? 'Salvando…' : (form.id ? 'Salvar alterações' : 'Criar ordem de serviço')}</button>
        <button onClick={onCancelar} className="px-5 py-2.5" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em' }}>Cancelar</button>
      </div>
    </div>
  );
}
