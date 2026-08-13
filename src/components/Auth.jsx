import React, { useState } from 'react';
import { COLORS, inputCls } from '../lib/constants';
import { Field } from './UI';
import { supabase } from '../supabaseClient';

export function SetupAdminScreen({ onCriado, onIrParaLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const submit = async () => {
    if (!nome.trim() || !email.trim() || !senha) { setErro('Preencha todos os campos.'); return; }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setErro('Use uma senha com pelo menos 6 caracteres.'); return; }
    setErro('');
    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
      if (error) throw error;
      if (!data.user) throw new Error('Não foi possível criar a conta. Verifique se a confirmação de e-mail está desativada no Supabase.');
      const { error: e2 } = await supabase.from('profiles').insert({ id: data.user.id, nome, papel: 'admin' });
      if (e2) throw e2;
      onCriado();
    } catch (e) {
      setErro(e.message || 'Erro ao criar a conta.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm p-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-center mb-4"><img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} /></div>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: COLORS.ink, textAlign: 'center', marginBottom: '4px' }}>CRIAR CONTA DO DONO</h1>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>Essa será a conta de administrador, com acesso completo ao sistema.</p>
        {erro && <div className="px-3 py-2 mb-3 text-sm" style={{ background: COLORS.redSoft, color: COLORS.red }}>{erro}</div>}
        <div className="flex flex-col gap-3">
          <Field label="Seu nome"><input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} /></Field>
          <Field label="E-mail de acesso"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoCapitalize="none" /></Field>
          <Field label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={inputCls} /></Field>
          <Field label="Confirmar senha"><input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={inputCls} /></Field>
        </div>
        <button disabled={carregando} onClick={submit} className="w-full mt-5 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Criando…' : 'Criar conta e entrar'}
        </button>
        {onIrParaLogin && (
          <button onClick={onIrParaLogin} className="w-full mt-3 text-xs" style={{ color: COLORS.textMuted, textAlign: 'center' }}>Já tenho conta — entrar</button>
        )}
      </div>
    </div>
  );
}

export function LoginScreen({ erroExterno, onIrParaSetup }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) setErro('E-mail ou senha incorretos.');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm p-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-center mb-4"><img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} /></div>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: COLORS.ink, textAlign: 'center', marginBottom: '20px' }}>ENTRAR</h1>
        {(erro || erroExterno) && <div className="px-3 py-2 mb-3 text-sm" style={{ background: COLORS.redSoft, color: COLORS.red }}>{erro || erroExterno}</div>}
        <div className="flex flex-col gap-3">
          <Field label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoCapitalize="none" onKeyDown={(e) => e.key === 'Enter' && entrar()} /></Field>
          <Field label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={inputCls} onKeyDown={(e) => e.key === 'Enter' && entrar()} /></Field>
        </div>
        <button disabled={carregando} onClick={entrar} className="w-full mt-5 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
        {onIrParaSetup && (
          <button onClick={onIrParaSetup} className="w-full mt-3 text-xs" style={{ color: COLORS.textMuted, textAlign: 'center' }}>Primeira vez por aqui? Criar conta do dono</button>
        )}
      </div>
    </div>
  );
}
