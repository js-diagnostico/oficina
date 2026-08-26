import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { COLORS, inputCls, emptyCliente, emptyVeiculo } from '../lib/constants';
import { Field, AddBtn } from './UI';

export default function ClientesTab({ clientes, onSalvar, onExcluir }) {
  const [busca, setBusca] = useState('');
  const [editing, setEditing] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const filtrados = clientes.filter((c) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return c.nome.toLowerCase().includes(q) || (c.telefone || '').includes(q) || c.veiculos.some((v) => v.placa.toLowerCase().includes(q));
  });

  const addVeiculo = () => setEditing((c) => ({ ...c, veiculos: [...c.veiculos, emptyVeiculo()] }));
  const updVeiculo = (vid, field, val) => setEditing((c) => ({ ...c, veiculos: c.veiculos.map((v) => (v.id === vid ? { ...v, [field]: val } : v)) }));
  const rmVeiculo = (vid) => setEditing((c) => ({ ...c, veiculos: c.veiculos.filter((v) => v.id !== vid) }));

  const salvar = async () => {
    if (!editing.nome.trim()) return;
    setSalvando(true);
    try { await onSalvar(editing); setEditing(null); } finally { setSalvando(false); }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>CLIENTES</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Cadastro de clientes e veículos</p>
        </div>
        <button onClick={() => setEditing(emptyCliente())} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}><Plus size={16} /> Novo cliente</button>
      </div>

      {editing && (
        <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', color: COLORS.ink, marginBottom: '10px', textTransform: 'uppercase' }}>{editing.id ? 'Editar cliente' : 'Novo cliente'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Nome *"><input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className={inputCls} /></Field>
            <Field label="Telefone"><input value={editing.telefone} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} className={inputCls} /></Field>
            <Field label="CPF / CNPJ"><input value={editing.documento} onChange={(e) => setEditing({ ...editing, documento: e.target.value })} className={inputCls} /></Field>
            <Field label="Endereço"><input value={editing.endereco} onChange={(e) => setEditing({ ...editing, endereco: e.target.value })} className={inputCls} /></Field>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '13px', color: COLORS.textMuted, textTransform: 'uppercase', fontFamily: "'Oswald', sans-serif" }}>Veículos</span>
            <AddBtn onClick={addVeiculo} label="Veículo" />
          </div>
          {editing.veiculos.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '10px' }}>Nenhum veículo cadastrado.</p>}
          {editing.veiculos.map((v) => (
            <div key={v.id} className="flex gap-2 items-center mb-2 flex-wrap">
              <input value={v.placa} onChange={(e) => updVeiculo(v.id, 'placa', e.target.value.toUpperCase())} placeholder="Placa" className={inputCls} style={{ width: '120px', fontFamily: "'Roboto Mono', monospace", border: `1px solid ${COLORS.line}` }} />
              <input value={v.modelo} onChange={(e) => updVeiculo(v.id, 'modelo', e.target.value)} placeholder="Modelo" className={inputCls} style={{ flex: 1, minWidth: '140px', border: `1px solid ${COLORS.line}` }} />
              <input value={v.ano} onChange={(e) => updVeiculo(v.id, 'ano', e.target.value)} placeholder="Ano" className={inputCls} style={{ width: '80px', border: `1px solid ${COLORS.line}` }} />
              <input value={v.chassi} onChange={(e) => updVeiculo(v.id, 'chassi', e.target.value.toUpperCase())} placeholder="Chassi" className={inputCls} style={{ width: '150px', fontFamily: "'Roboto Mono', monospace", border: `1px solid ${COLORS.line}` }} />
              <button onClick={() => rmVeiculo(v.id)} style={{ color: COLORS.red }}><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="flex gap-3 mt-4">
            <button disabled={salvando} onClick={salvar} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 mb-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, maxWidth: '420px' }}>
        <Search size={16} style={{ color: COLORS.textMuted }} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone ou placa" className="w-full outline-none text-sm" style={{ background: 'transparent' }} />
      </div>

      {filtrados.length === 0 ? (
        <p style={{ color: COLORS.textMuted }}>Nenhum cliente encontrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((c) => (
            <div key={c.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: COLORS.ink }}>{c.nome}</div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted }}>{c.telefone || '—'}{c.veiculos.length > 0 ? ` · ${c.veiculos.length} veículo(s): ${c.veiculos.map((v) => v.placa).join(', ')}` : ''}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(JSON.parse(JSON.stringify(c)))} className="p-1.5" style={{ color: COLORS.textMuted }}><Pencil size={16} /></button>
                <button onClick={() => onExcluir(c)} className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
