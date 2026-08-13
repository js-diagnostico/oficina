import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { COLORS, inputCls, PAPEL_FUNCIONARIO, emptyFuncionario } from '../lib/constants';
import { Field } from './UI';

export default function EquipeTab({ funcionarios, onSalvar, onExcluir }) {
  const [editing, setEditing] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!editing.nome.trim()) return;
    setSalvando(true);
    try { await onSalvar(editing); setEditing(null); } finally { setSalvando(false); }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>EQUIPE</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Mecânicos e vendedores, com percentual de comissão</p>
        </div>
        <button onClick={() => setEditing(emptyFuncionario())} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}><Plus size={16} /> Novo funcionário</button>
      </div>

      {editing && (
        <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', color: COLORS.ink, marginBottom: '10px', textTransform: 'uppercase' }}>{editing.id ? 'Editar funcionário' : 'Novo funcionário'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Nome *"><input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className={inputCls} /></Field>
            <Field label="Telefone"><input value={editing.telefone} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} className={inputCls} /></Field>
            <Field label="Função">
              <select value={editing.papel} onChange={(e) => setEditing({ ...editing, papel: e.target.value })} className={inputCls}>
                {Object.entries(PAPEL_FUNCIONARIO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Comissão (%)"><input value={editing.percentual} onChange={(e) => setEditing({ ...editing, percentual: e.target.value })} className={inputCls} inputMode="decimal" placeholder="Ex.: 10" /></Field>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '10px' }}>Mecânico: comissão sobre o valor de mão de obra das OS concluídas onde ele é o responsável. Vendedor: comissão sobre o valor das peças das OS concluídas onde ele é o vendedor.</p>
          <div className="flex gap-3">
            <button disabled={salvando} onClick={salvar} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink }}>Cancelar</button>
          </div>
        </div>
      )}

      {funcionarios.length === 0 ? (
        <p style={{ color: COLORS.textMuted }}>Nenhum funcionário cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {funcionarios.map((f) => (
            <div key={f.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: COLORS.ink }}>{f.nome}</div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted }}>{PAPEL_FUNCIONARIO[f.papel]} · Comissão {f.percentual || 0}% · {f.telefone || '—'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(JSON.parse(JSON.stringify(f)))} className="p-1.5" style={{ color: COLORS.textMuted }}><Pencil size={16} /></button>
                <button onClick={() => onExcluir(f)} className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
