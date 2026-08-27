import React, { useState } from 'react';
import { COLORS, inputCls } from '../lib/constants';
import { Field } from './UI';
import { supabase } from '../supabaseClient';
import { inserirPerfilComRetry } from '../lib/api';

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
      // Se uma tentativa anterior já criou o login mas não o perfil, entra em vez de tentar criar de novo
      const tentativaLogin = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      let userId;
      if (!tentativaLogin.error && tentativaLogin.data.user) {
        userId = tentativaLogin.data.user.id;
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
        if (error) {
          if ((error.message || '').toLowerCase().includes('already registered')) {
            throw new Error('Esse e-mail já tem uma conta criada, mas com senha diferente da que você digitou agora. Tente lembrar a senha usada antes, ou apague o usuário em Supabase > Authentication > Users e tente de novo.');
          }
          throw error;
        }
        if (!data.user) throw new Error('Não foi possível criar a conta. Verifique se a confirmação de e-mail está desativada no Supabase.');
        userId = data.user.id;
      }
      await inserirPerfilComRetry(userId, nome, 'admin');
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
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [msgRecuperar, setMsgRecuperar] = useState('');

  const entrar = async () => {
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) setErro('E-mail ou senha incorretos.');
  };

  const enviarRecuperacao = async () => {
    if (!emailRecuperar.trim()) { setMsgRecuperar('Informe o e-mail cadastrado.'); return; }
    setCarregando(true);
    setMsgRecuperar('');
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar.trim(), { redirectTo: window.location.origin });
    setCarregando(false);
    if (error) setMsgRecuperar('Não foi possível enviar: ' + error.message);
    else setMsgRecuperar('Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em alguns minutos. Confira também a caixa de spam.');
  };

  if (modoRecuperar) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-sm p-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="flex justify-center mb-4"><img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} /></div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: COLORS.ink, textAlign: 'center', marginBottom: '8px' }}>RECUPERAR SENHA</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>Informe o e-mail da sua conta. Vamos mandar um link para você definir uma nova senha.</p>
          {msgRecuperar && <div className="px-3 py-2 mb-3 text-sm" style={{ background: msgRecuperar.startsWith('Não') ? COLORS.redSoft : COLORS.greenSoft, color: msgRecuperar.startsWith('Não') ? COLORS.red : COLORS.green }}>{msgRecuperar}</div>}
          <Field label="E-mail"><input type="email" value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} className={inputCls} autoCapitalize="none" /></Field>
          <button disabled={carregando} onClick={enviarRecuperacao} className="w-full mt-4 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: carregando ? 0.6 : 1 }}>
            {carregando ? 'Enviando…' : 'Enviar link de recuperação'}
          </button>
          <button onClick={() => { setModoRecuperar(false); setMsgRecuperar(''); }} className="w-full mt-3 text-xs" style={{ color: COLORS.textMuted, textAlign: 'center' }}>Voltar para o login</button>
        </div>
      </div>
    );
  }

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
        <button onClick={() => setModoRecuperar(true)} className="text-xs mt-2" style={{ color: COLORS.navy }}>Esqueci minha senha</button>
        <button disabled={carregando} onClick={entrar} className="w-full mt-3 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
        {onIrParaSetup && (
          <button onClick={onIrParaSetup} className="w-full mt-3 text-xs" style={{ color: COLORS.textMuted, textAlign: 'center' }}>Primeira vez por aqui? Criar conta do dono</button>
        )}
      </div>
    </div>
  );
}

export function NovaSenhaScreen({ onDefinida }) {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvar = async () => {
    if (!senha || senha.length < 6) { setErro('Use uma senha com pelo menos 6 caracteres.'); return; }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) { setErro(error.message); return; }
    onDefinida();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm p-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-center mb-4"><img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} /></div>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: COLORS.ink, textAlign: 'center', marginBottom: '8px' }}>DEFINIR NOVA SENHA</h1>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>Escolha uma nova senha para sua conta.</p>
        {erro && <div className="px-3 py-2 mb-3 text-sm" style={{ background: COLORS.redSoft, color: COLORS.red }}>{erro}</div>}
        <Field label="Nova senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={inputCls} /></Field>
        <div className="mt-3"><Field label="Confirmar nova senha"><input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={inputCls} /></Field></div>
        <button disabled={carregando} onClick={salvar} className="w-full mt-5 px-5 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Salvando…' : 'Salvar nova senha e entrar'}
        </button>
      </div>
    </div>
  );
}
