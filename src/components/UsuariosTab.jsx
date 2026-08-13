import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { COLORS, inputCls, PAPEL_USUARIO } from '../lib/constants';
import { Field } from './UI';

export default function UsuariosTab({ usuarios, meuId, onCriar, onMudarPapel, onExcluir }) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const criar = async () => {
    if (!nome.trim() || !email.trim() || !senha) { setErro('Preencha todos os campos.'); return; }
    if (senha.length < 6) { setErro('Use uma senha com pelo menos 6 caracteres.'); return; }
    setErro('');
    setSalvando(true);
    try {
      await onCriar({ nome, email, senha });
      setCriando(false); setNome(''); setEmail(''); setSenha('');
    } catch (e) {
      setErro(e.message || 'Não foi possível criar o usuário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>USUÁRIOS DO APP</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Quem pode entrar no sistema e o que cada um vê</p>
        </div>
        <button onClick={() => setCriando(true)} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}><Plus size={16} /> Novo usuário</button>
      </div>

      {criando && (
        <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', color: COLORS.ink, marginBottom: '10px', textTransform: 'uppercase' }}>Novo funcionário</h2>
          <div className="px-3 py-2 mb-3 text-xs" style={{ background: COLORS.goldSoft, color: COLORS.gold }}>
            O funcionário poderá entrar com esse e-mail e senha assim que você salvar.
          </div>
          {erro && <div className="px-3 py-2 mb-3 text-sm" style={{ background: COLORS.redSoft, color: COLORS.red }}>{erro}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Nome *"><input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} /></Field>
            <Field label="E-mail de acesso *"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoCapitalize="none" /></Field>
            <Field label="Senha *"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="flex gap-3">
            <button disabled={salvando} onClick={criar} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>{salvando ? 'Criando…' : 'Criar e sair'}</button>
            <button onClick={() => setCriando(false)} className="px-4 py-2 text-sm" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {usuarios.map((u) => (
          <div key={u.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex-1">
              <div style={{ fontWeight: 600, color: COLORS.ink }}>{u.nome} {u.id === meuId && <span style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 400 }}>(você)</span>}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={u.papel} onChange={(e) => onMudarPapel(u, e.target.value)} disabled={u.id === meuId} className="px-2 py-1 text-xs" style={{ border: `1px solid ${COLORS.line}` }}>
                {Object.entries(PAPEL_USUARIO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {u.id !== meuId && <button onClick={() => onExcluir(u)} className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
