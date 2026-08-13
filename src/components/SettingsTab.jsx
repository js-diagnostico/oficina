import React, { useState } from 'react';
import { COLORS, inputCls } from '../lib/constants';
import { Field } from './UI';

export default function SettingsTab({ config, onSalvar }) {
  const [form, setForm] = useState(config);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    try {
      await onSalvar(form);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-lg">
      <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink, marginBottom: '20px' }}>CONFIGURAÇÕES DA OFICINA</h1>
      <img src="/logo.png" alt="Logo" style={{ height: '70px', width: 'auto', marginBottom: '20px' }} />
      <div className="flex flex-col gap-3">
        <Field label="Nome da oficina"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} /></Field>
        <Field label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={inputCls} /></Field>
        <Field label="Endereço" full><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className={inputCls} /></Field>
        <Field label="Garantia padrão (dias)"><input value={form.garantiaPadraoDias} onChange={(e) => setForm({ ...form, garantiaPadraoDias: e.target.value })} className={inputCls} inputMode="numeric" /></Field>
        <Field label="Termos de garantia (texto impresso na OS)" full><textarea value={form.termosGarantia} onChange={(e) => setForm({ ...form, termosGarantia: e.target.value })} className={inputCls} rows={3} /></Field>
      </div>
      <button disabled={salvando} onClick={salvar} className="mt-3 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: salvando ? 0.6 : 1 }}>
        {salvando ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar'}
      </button>
      <p className="mt-4 text-xs" style={{ color: COLORS.textMuted }}>Esses dados, incluindo os termos de garantia, aparecem impressos no cabeçalho e rodapé de cada ordem de serviço, junto com a logomarca.</p>
    </div>
  );
}
