import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { COLORS, inputCls, brl, CATEGORIAS_SERVICO, emptyServicoCatalogo } from '../lib/constants';
import { Field } from './UI';

export default function ServicosCatalogoTab({ itens, onSalvar, onExcluir }) {
  const [busca, setBusca] = useState('');
  const [editing, setEditing] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const filtrados = itens.filter((s) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return s.nome.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q);
  });
  const categoriasPresentes = [...new Set(filtrados.map((i) => i.categoria))];
  const grupos = categoriasPresentes.map((cat) => ({ cat, itens: filtrados.filter((i) => i.categoria === cat) }));

  const salvar = async () => {
    if (!editing.nome.trim()) return;
    setSalvando(true);
    try { await onSalvar(editing); setEditing(null); } finally { setSalvando(false); }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>CATÁLOGO DE SERVIÇOS</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Serviços padronizados por categoria de veículo</p>
        </div>
        <button onClick={() => setEditing(emptyServicoCatalogo())} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}><Plus size={16} /> Novo serviço</button>
      </div>

      {editing && (
        <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', color: COLORS.ink, marginBottom: '10px', textTransform: 'uppercase' }}>{editing.id ? 'Editar serviço' : 'Novo serviço'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Nome do serviço *"><input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className={inputCls} placeholder="Ex.: Revisão elétrica completa" /></Field>
            <Field label="Categoria de veículo">
              <input value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value })} className={inputCls} list="categorias-servico" />
              <datalist id="categorias-servico">{CATEGORIAS_SERVICO.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Valor padrão (R$)"><input value={editing.valorPadrao} onChange={(e) => setEditing({ ...editing, valorPadrao: e.target.value })} className={inputCls} inputMode="decimal" /></Field>
            <Field label="Observações"><input value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} className={inputCls} placeholder="Opcional" /></Field>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '10px' }}>Você pode digitar uma categoria nova além das sugeridas para padronizar do seu jeito.</p>
          <div className="flex gap-3">
            <button disabled={salvando} onClick={salvar} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 mb-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, maxWidth: '420px' }}>
        <Search size={16} style={{ color: COLORS.textMuted }} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou categoria" className="w-full outline-none text-sm" style={{ background: 'transparent' }} />
      </div>

      {itens.length === 0 ? (
        <p style={{ color: COLORS.textMuted }}>Nenhum serviço cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {grupos.map((g) => (
            <div key={g.cat}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: `1px solid ${COLORS.lineStrong}`, paddingBottom: '4px' }}>{g.cat}</div>
              <div className="flex flex-col gap-2">
                {g.itens.map((s) => (
                  <div key={s.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                    <div className="flex-1">
                      <div style={{ fontWeight: 600, color: COLORS.ink }}>{s.nome}</div>
                      {s.descricao && <div style={{ fontSize: '13px', color: COLORS.textMuted }}>{s.descricao}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color: COLORS.ink, fontSize: '14px' }}>{brl(s.valorPadrao)}</span>
                      <button onClick={() => setEditing(JSON.parse(JSON.stringify(s)))} className="p-1.5" style={{ color: COLORS.textMuted }}><Pencil size={16} /></button>
                      <button onClick={() => onExcluir(s)} className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
