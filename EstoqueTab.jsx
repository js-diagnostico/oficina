import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { COLORS, inputCls, brl, emptyPeca } from '../lib/constants';
import { Field } from './UI';

export default function EstoqueTab({ itens, onSalvar, onExcluir }) {
  const [busca, setBusca] = useState('');
  const [editing, setEditing] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const filtrados = itens.filter((p) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return p.descricao.toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q);
  });

  const salvar = async () => {
    if (!editing.descricao.trim()) return;
    setSalvando(true);
    try { await onSalvar(editing); setEditing(null); } finally { setSalvando(false); }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>ESTOQUE DE MATERIAL</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Peças e materiais automotivos</p>
        </div>
        <button onClick={() => setEditing(emptyPeca())} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}><Plus size={16} /> Novo item</button>
      </div>

      {editing && (
        <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', color: COLORS.ink, marginBottom: '10px', textTransform: 'uppercase' }}>{editing.id ? 'Editar item' : 'Novo item'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Código"><input value={editing.codigo} onChange={(e) => setEditing({ ...editing, codigo: e.target.value })} className={inputCls} /></Field>
            <Field label="Descrição *"><input value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} className={inputCls} /></Field>
            <Field label="Categoria"><input value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value })} className={inputCls} placeholder="Ex.: Filtros, Elétrica…" /></Field>
            <Field label="Custo (R$)"><input value={editing.custo} onChange={(e) => setEditing({ ...editing, custo: e.target.value })} className={inputCls} inputMode="decimal" /></Field>
            <Field label="Preço de venda (R$)"><input value={editing.preco} onChange={(e) => setEditing({ ...editing, preco: e.target.value })} className={inputCls} inputMode="decimal" /></Field>
            <Field label="Estoque atual"><input value={editing.estoqueAtual} onChange={(e) => setEditing({ ...editing, estoqueAtual: e.target.value })} className={inputCls} inputMode="numeric" /></Field>
            <Field label="Estoque mínimo"><input value={editing.estoqueMin} onChange={(e) => setEditing({ ...editing, estoqueMin: e.target.value })} className={inputCls} inputMode="numeric" /></Field>
          </div>
          <div className="flex gap-3 mt-2">
            <button disabled={salvando} onClick={salvar} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 mb-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, maxWidth: '420px' }}>
        <Search size={16} style={{ color: COLORS.textMuted }} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por código, descrição ou categoria" className="w-full outline-none text-sm" style={{ background: 'transparent' }} />
      </div>

      {filtrados.length === 0 ? (
        <p style={{ color: COLORS.textMuted }}>Nenhum item encontrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((p) => {
            const baixo = (parseFloat(p.estoqueAtual) || 0) <= (parseFloat(p.estoqueMin) || 0);
            return (
              <div key={p.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4" style={{ background: COLORS.card, border: `1px solid ${baixo ? COLORS.red : COLORS.line}` }}>
                <div className="flex-1">
                  <div style={{ fontWeight: 600, color: COLORS.ink }}>{p.descricao} {p.codigo && <span style={{ color: COLORS.textMuted, fontFamily: "'Roboto Mono', monospace", fontWeight: 400, fontSize: '12px' }}>({p.codigo})</span>}</div>
                  <div style={{ fontSize: '13px', color: COLORS.textMuted }}>{p.categoria || 'Sem categoria'} · Venda {brl(p.preco)} · Custo {brl(p.custo)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color: baixo ? COLORS.red : COLORS.ink, fontSize: '14px' }}>{p.estoqueAtual || 0} un.</span>
                  {baixo && <span style={{ fontSize: '11px', color: COLORS.red, textTransform: 'uppercase', fontFamily: "'Oswald', sans-serif" }}>Estoque baixo</span>}
                  <button onClick={() => setEditing(JSON.parse(JSON.stringify(p)))} className="p-1.5" style={{ color: COLORS.textMuted }}><Pencil size={16} /></button>
                  <button onClick={() => onExcluir(p)} className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
