import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Plus, Settings, ChevronLeft, Printer, ClipboardList,
  User, Tag, Package, Users, Percent, Wrench,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import {
  COLORS, ABAS_FUNCIONARIO, PAPEL_USUARIO, emptyOS, brl, calcTotal,
} from './lib/constants';
import * as api from './lib/api';
import { SetupAdminScreen, LoginScreen } from './components/Auth';
import Dashboard from './components/Dashboard';
import OSForm from './components/OSForm';
import PrintableOS from './components/PrintableOS';
import ClientesTab from './components/ClientesTab';
import EstoqueTab from './components/EstoqueTab';
import ServicosCatalogoTab from './components/ServicosCatalogoTab';
import EquipeTab from './components/EquipeTab';
import ComissoesTab from './components/ComissoesTab';
import UsuariosTab from './components/UsuariosTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda não sabemos, null = deslogado
  const [perfil, setPerfil] = useState(null);
  const [perfilErro, setPerfilErro] = useState('');
  const [modoAuth, setModoAuth] = useState('login');

  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [catalogoServicos, setCatalogoServicos] = useState([]);
  const [comissoesPagas, setComissoesPagas] = useState({});
  const [config, setConfig] = useState({ nome: 'JS Diagnóstico', telefone: '', endereco: '', garantiaPadraoDias: '90', termosGarantia: '' });
  const [usuarios, setUsuarios] = useState([]);

  const [tab, setTab] = useState('dashboard');
  const [osEditando, setOsEditando] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [viaImpressao, setViaImpressao] = useState('cliente');
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [resumoTexto, setResumoTexto] = useState(null);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2800); };

  // ---------- Sessão ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSessao(novaSessao || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessao === undefined) return;
    if (sessao === null) { setPerfil(null); setDadosCarregados(false); return; }
    carregarPerfil();
  }, [sessao]);

  const carregarPerfil = useCallback(async () => {
    if (!sessao) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', sessao.user.id).single();
      if (error) throw error;
      setPerfil({ id: data.id, nome: data.nome, papel: data.papel });
      setPerfilErro('');
    } catch (e) {
      setPerfil(null);
      setPerfilErro('Não encontramos seu cadastro de acesso. Peça para o administrador te cadastrar em Usuários, ou tente de novo em alguns segundos.');
    }
  }, [sessao]);

  // ---------- Dados do app ----------
  const carregarDados = useCallback(async (papel) => {
    try {
      const tarefas = [
        api.fetchOrdens().then(setOrdens),
        api.fetchClientes().then(setClientes),
        api.fetchEstoque().then(setEstoque),
        api.fetchCatalogoServicos().then(async (lista) => {
          if (lista.length === 0) { await api.semearCatalogoSeVazio(); setCatalogoServicos(await api.fetchCatalogoServicos()); }
          else setCatalogoServicos(lista);
        }),
        api.fetchConfig().then(setConfig),
      ];
      if (papel === 'admin') {
        tarefas.push(api.fetchFuncionarios().then(setFuncionarios));
        tarefas.push(api.fetchComissoesPagas().then(setComissoesPagas));
        tarefas.push(api.fetchProfiles().then(setUsuarios));
      } else {
        tarefas.push(api.fetchFuncionarios().then(setFuncionarios)); // precisa pra montar o select de mecânico/vendedor na OS
      }
      await Promise.all(tarefas);
      setDadosCarregados(true);
    } catch (e) {
      flash('Erro ao carregar dados: ' + (e.message || 'tente recarregar a página.'));
    }
  }, []);

  useEffect(() => {
    if (perfil) carregarDados(perfil.papel);
  }, [perfil, carregarDados]);

  useEffect(() => {
    if (perfil && perfil.papel === 'funcionario' && !ABAS_FUNCIONARIO.includes(tab)) setTab('dashboard');
  }, [perfil, tab]);

  const sair = async () => { await supabase.auth.signOut(); setTab('dashboard'); };

  // ---------- OS ----------
  const abrirNovaOS = () => { setOsEditando(emptyOS()); setTab('form'); };
  const abrirEditarOS = (os) => { setOsEditando(JSON.parse(JSON.stringify(os))); setTab('form'); };
  const abrirVerOS = (os) => { setViewingId(os.id); setViaImpressao('cliente'); setTab('view'); };

  const aplicarConclusao = async (os, statusAnterior) => {
    if (os.status === 'concluida' && statusAnterior !== 'concluida' && !os.estoqueBaixado) {
      os = { ...os, dataConclusao: new Date().toISOString(), estoqueBaixado: true };
      for (const p of os.pecas || []) {
        if (p.estoqueId) {
          await api.ajustarEstoqueApi(p.estoqueId, -(parseFloat(p.qtd) || 0));
        }
      }
      if ((os.pecas || []).some((p) => p.estoqueId)) setEstoque(await api.fetchEstoque());
    }
    return os;
  };

  const salvarOS = async (form) => {
    if (form.id) {
      const anterior = ordens.find((o) => o.id === form.id);
      const comFinalizacao = await aplicarConclusao(form, anterior ? anterior.status : null);
      const salvo = await api.atualizarOS(form.id, comFinalizacao);
      setOrdens((prev) => prev.map((o) => (o.id === salvo.id ? salvo : o)));
      flash('Ordem de serviço atualizada.');
    } else {
      const comFinalizacao = await aplicarConclusao(form, null);
      const salvo = await api.criarOS(comFinalizacao);
      setOrdens((prev) => [salvo, ...prev]);
      flash('Ordem de serviço criada.');
    }
    setTab('dashboard');
  };

  const mudarStatusOS = async (os, novoStatus) => {
    try {
      const comFinalizacao = await aplicarConclusao({ ...os, status: novoStatus }, os.status);
      const salvo = await api.atualizarOS(os.id, comFinalizacao);
      setOrdens((prev) => prev.map((o) => (o.id === salvo.id ? salvo : o)));
    } catch (e) {
      flash('Não foi possível mudar o status: ' + (e.message || ''));
    }
  };

  const excluirOSHandler = async () => {
    const os = confirmDelete.item;
    try {
      await api.excluirOS(os.id);
      setOrdens((prev) => prev.filter((o) => o.id !== os.id));
      flash('Ordem de serviço excluída.');
      if (viewingId === os.id) setTab('dashboard');
    } catch (e) {
      flash('Não foi possível excluir: ' + (e.message || ''));
    }
    setConfirmDelete(null);
  };

  const gerarResumoTexto = (os) => {
    const linhas = [];
    linhas.push(`*${config.nome || 'Oficina'}*`);
    linhas.push(`Ordem de serviço: ${os.numero}`);
    linhas.push(`Cliente: ${os.cliente.nome}`);
    linhas.push(`Veículo: ${os.veiculo.modelo || '—'} (${os.veiculo.ano || '—'}) - Placa ${os.veiculo.placa}`);
    if (os.problema) linhas.push(`Problema relatado: ${os.problema}`);
    if (os.laudoTecnico) linhas.push(`Laudo técnico: ${os.laudoTecnico}`);
    if (os.servicos.length > 0) { linhas.push('Serviços:'); os.servicos.forEach((s) => linhas.push(`  - ${s.descricao || '—'}: ${brl(parseFloat(s.valor) || 0)}`)); }
    if (os.pecas.length > 0) { linhas.push('Peças:'); os.pecas.forEach((p) => linhas.push(`  - ${p.descricao || '—'} x${p.qtd || 1}: ${brl((parseFloat(p.qtd) || 0) * (parseFloat(p.valorUnit) || 0))}`)); }
    linhas.push(`Total: ${brl(calcTotal(os))}`);
    if (os.formaPagamento) linhas.push(`Forma de pagamento: ${os.formaPagamento}`);
    const dias = os.garantiaDias || config.garantiaPadraoDias;
    if (dias) linhas.push(`Garantia: ${dias} dias`);
    if (config.termosGarantia) linhas.push(config.termosGarantia);
    return linhas.join('\n');
  };
  const copiarResumo = async (os) => {
    const texto = gerarResumoTexto(os);
    try { await navigator.clipboard.writeText(texto); flash('Resumo copiado — cole no WhatsApp ou e-mail para o cliente.'); }
    catch (e) { setResumoTexto(texto); }
  };

  // ---------- Clientes / Estoque / Serviços / Equipe ----------
  const salvarCliente = async (cliente) => {
    const salvo = await api.salvarClienteApi(cliente);
    setClientes((prev) => cliente.id ? prev.map((c) => (c.id === salvo.id ? salvo : c)) : [salvo, ...prev]);
    flash('Cliente salvo.');
  };
  const excluirCliente = async () => {
    const c = confirmDelete.item;
    await api.excluirClienteApi(c.id);
    setClientes((prev) => prev.filter((x) => x.id !== c.id));
    flash('Cliente removido.');
    setConfirmDelete(null);
  };

  const salvarPeca = async (peca) => {
    const salvo = await api.salvarPecaApi(peca);
    setEstoque((prev) => peca.id ? prev.map((p) => (p.id === salvo.id ? salvo : p)) : [salvo, ...prev]);
    flash('Item salvo no estoque.');
  };
  const excluirPeca = async () => {
    const p = confirmDelete.item;
    await api.excluirPecaApi(p.id);
    setEstoque((prev) => prev.filter((x) => x.id !== p.id));
    flash('Item removido do estoque.');
    setConfirmDelete(null);
  };

  const salvarServicoCatalogo = async (servico) => {
    const salvo = await api.salvarServicoCatalogoApi(servico);
    setCatalogoServicos((prev) => servico.id ? prev.map((s) => (s.id === salvo.id ? salvo : s)) : [salvo, ...prev]);
    flash('Serviço salvo no catálogo.');
  };
  const excluirServicoCatalogo = async () => {
    const s = confirmDelete.item;
    await api.excluirServicoCatalogoApi(s.id);
    setCatalogoServicos((prev) => prev.filter((x) => x.id !== s.id));
    flash('Serviço removido do catálogo.');
    setConfirmDelete(null);
  };

  const salvarFuncionario = async (func) => {
    const salvo = await api.salvarFuncionarioApi(func);
    setFuncionarios((prev) => func.id ? prev.map((f) => (f.id === salvo.id ? salvo : f)) : [salvo, ...prev]);
    flash('Funcionário salvo.');
  };
  const excluirFuncionario = async () => {
    const f = confirmDelete.item;
    await api.excluirFuncionarioApi(f.id);
    setFuncionarios((prev) => prev.filter((x) => x.id !== f.id));
    flash('Funcionário removido.');
    setConfirmDelete(null);
  };

  const togglePagoComissao = async (chave, pago) => {
    await api.alternarComissaoPagaApi(chave, pago);
    setComissoesPagas((prev) => ({ ...prev, [chave]: pago }));
  };

  const salvarConfigHandler = async (cfg) => { await api.salvarConfigApi(cfg); setConfig(cfg); flash('Configurações salvas.'); };

  // ---------- Usuários (login do app) ----------
  const criarUsuario = async ({ nome, email, senha }) => {
    const { data: { session: sessaoAtual } } = await supabase.auth.getSession();
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
    if (error) throw error;
    if (sessaoAtual) await supabase.auth.setSession({ access_token: sessaoAtual.access_token, refresh_token: sessaoAtual.refresh_token });
    await api.inserirPerfilComRetry(data.user.id, nome, 'funcionario');
    setUsuarios(await api.fetchProfiles());
    flash('Usuário criado.');
  };
  const mudarPapelUsuario = async (u, papel) => {
    await api.atualizarProfileApi(u.id, { papel });
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, papel } : x)));
  };
  const excluirUsuario = async () => {
    const u = confirmDelete.item;
    await api.excluirProfileApi(u.id);
    setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    flash('Acesso removido. (A conta de login continua existindo no Supabase, apenas sem permissão dentro do app.)');
    setConfirmDelete(null);
  };

  const viewingOS = ordens.find((o) => o.id === viewingId);

  // ---------- Telas de autenticação ----------
  if (sessao === undefined) {
    return <TelaCarregando texto="VERIFICANDO ACESSO…" />;
  }
  if (sessao === null) {
    return modoAuth === 'setup'
      ? <SetupAdminScreen onCriado={() => setModoAuth('login')} onIrParaLogin={() => setModoAuth('login')} />
      : <LoginScreen onIrParaSetup={() => setModoAuth('setup')} />;
  }
  if (!perfil) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: COLORS.paper }}>
        <div className="max-w-sm text-center">
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: COLORS.ink, marginBottom: '10px' }}>Acesso não encontrado</p>
          <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>{perfilErro || 'Carregando seu perfil…'}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={carregarPerfil} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff' }}>Tentar de novo</button>
            <button onClick={sair} className="px-4 py-2 text-sm" style={{ background: COLORS.ink, color: '#fff' }}>Sair</button>
          </div>
        </div>
      </div>
    );
  }
  if (!dadosCarregados) {
    return <TelaCarregando texto="CARREGANDO OFICINA…" />;
  }

  const NavBtn = ({ target, icon: Icon, label }) => (
    <button
      onClick={() => setTab(target)}
      className="flex items-center gap-2 px-4 py-3 shrink-0 md:w-full text-left transition-colors"
      style={{
        color: tab === target ? COLORS.red : '#C9C6BE',
        background: tab === target ? 'rgba(226,36,43,0.14)' : 'transparent',
        borderLeft: tab === target ? `3px solid ${COLORS.red}` : '3px solid transparent',
        fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', fontSize: '14px', textTransform: 'uppercase',
      }}
    >
      <Icon size={17} strokeWidth={2} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      <aside className="no-print flex md:flex-col items-stretch md:w-56 shrink-0 overflow-x-auto" style={{ background: COLORS.ink }}>
        <div className="hidden md:flex items-center gap-2 px-4 py-4" style={{ borderBottom: '1px solid #33383F' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
        </div>
        <div className="flex md:flex-col flex-1">
          <NavBtn target="dashboard" icon={LayoutDashboard} label="Painel" />
          <NavBtn target="form" icon={Plus} label="Nova OS" />
          <NavBtn target="clientes" icon={User} label="Clientes" />
          <NavBtn target="servicos" icon={Tag} label="Serviços" />
          <NavBtn target="estoque" icon={Package} label="Estoque" />
          {perfil.papel === 'admin' && (<>
            <NavBtn target="equipe" icon={Users} label="Equipe" />
            <NavBtn target="comissoes" icon={Percent} label="Comissões" />
            <NavBtn target="usuarios" icon={Users} label="Usuários" />
            <NavBtn target="settings" icon={Settings} label="Config." />
          </>)}
        </div>
        <div className="md:mt-auto px-4 py-3 flex items-center justify-between gap-2 shrink-0" style={{ borderTop: '1px solid #33383F' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{perfil.nome}</div>
            <div style={{ color: '#8B8781', fontSize: '11px' }}>{PAPEL_USUARIO[perfil.papel]}</div>
          </div>
          <button onClick={sair} className="text-xs px-2 py-1" style={{ color: COLORS.red, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>Sair</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {notice && <div className="no-print px-5 py-2 text-sm" style={{ background: COLORS.ink, color: COLORS.redSoft }}>{notice}</div>}

        {tab === 'dashboard' && (
          <Dashboard
            ordens={ordens} estoque={estoque}
            onNovo={abrirNovaOS} onVer={abrirVerOS} onEditar={abrirEditarOS}
            onExcluir={(os) => setConfirmDelete({ tipo: 'os', item: os, label: `a OS ${os.numero}` })}
            onMudarStatus={mudarStatusOS}
          />
        )}

        {tab === 'form' && (
          <OSForm
            osInicial={osEditando} clientes={clientes} estoque={estoque} funcionarios={funcionarios}
            catalogoServicos={catalogoServicos} config={config}
            onSalvar={salvarOS} onCancelar={() => setTab('dashboard')}
          />
        )}

        {tab === 'view' && !viewingOS && (
          <div className="p-8 text-center" style={{ color: COLORS.textMuted }}>
            Ordem de serviço não encontrada.
            <div className="mt-3"><button onClick={() => setTab('dashboard')} style={{ color: COLORS.red, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>Voltar ao painel</button></div>
          </div>
        )}
        {tab === 'view' && viewingOS && (
          <div className="p-5 md:p-8">
            <div className="no-print flex items-center justify-between mb-4 flex-wrap gap-2">
              <button onClick={() => setTab('dashboard')} className="flex items-center gap-1 text-sm" style={{ color: COLORS.textMuted }}><ChevronLeft size={16} /> Voltar ao painel</button>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex" style={{ border: `1px solid ${COLORS.lineStrong}` }}>
                  <button onClick={() => setViaImpressao('cliente')} className="px-3 py-1.5 text-xs" style={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', background: viaImpressao === 'cliente' ? COLORS.ink : 'transparent', color: viaImpressao === 'cliente' ? '#fff' : COLORS.ink }}>Via cliente</button>
                  <button onClick={() => setViaImpressao('oficina')} className="px-3 py-1.5 text-xs" style={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', background: viaImpressao === 'oficina' ? COLORS.ink : 'transparent', color: viaImpressao === 'oficina' ? '#fff' : COLORS.ink }}>Via oficina</button>
                </div>
                <button onClick={() => copiarResumo(viewingOS)} className="flex items-center gap-2 px-4 py-2" style={{ border: `1px solid ${COLORS.lineStrong}`, color: COLORS.ink, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', fontSize: '13px' }}><ClipboardList size={15} /> Copiar resumo</button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2" style={{ background: COLORS.ink, color: '#fff', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', fontSize: '13px' }}><Printer size={15} /> Imprimir</button>
              </div>
            </div>
            <PrintableOS os={viewingOS} config={config} via={viaImpressao} />
          </div>
        )}

        {tab === 'clientes' && (
          <ClientesTab clientes={clientes} onSalvar={salvarCliente} onExcluir={(c) => setConfirmDelete({ tipo: 'cliente', item: c, label: `o cliente ${c.nome}` })} />
        )}
        {tab === 'servicos' && (
          <ServicosCatalogoTab itens={catalogoServicos} onSalvar={salvarServicoCatalogo} onExcluir={(s) => setConfirmDelete({ tipo: 'servico', item: s, label: `o serviço ${s.nome}` })} />
        )}
        {tab === 'estoque' && (
          <EstoqueTab itens={estoque} onSalvar={salvarPeca} onExcluir={(p) => setConfirmDelete({ tipo: 'peca', item: p, label: `o item ${p.descricao}` })} />
        )}
        {tab === 'equipe' && perfil.papel === 'admin' && (
          <EquipeTab funcionarios={funcionarios} onSalvar={salvarFuncionario} onExcluir={(f) => setConfirmDelete({ tipo: 'funcionario', item: f, label: `${f.nome} da equipe` })} />
        )}
        {tab === 'comissoes' && perfil.papel === 'admin' && (
          <ComissoesTab ordens={ordens} funcionarios={funcionarios} comissoesPagas={comissoesPagas} onTogglePago={togglePagoComissao} />
        )}
        {tab === 'usuarios' && perfil.papel === 'admin' && (
          <UsuariosTab usuarios={usuarios} meuId={perfil.id} onCriar={criarUsuario} onMudarPapel={mudarPapelUsuario} onExcluir={(u) => setConfirmDelete({ tipo: 'usuario', item: u, label: `o acesso de ${u.nome}` })} />
        )}
        {tab === 'settings' && perfil.papel === 'admin' && (
          <SettingsTab config={config} onSalvar={salvarConfigHandler} />
        )}
      </main>

      {confirmDelete && (
        <div className="no-print fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(27,27,27,0.6)' }}>
          <div className="p-6 max-w-sm w-full" style={{ background: COLORS.card }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: COLORS.ink, marginBottom: '8px' }}>Excluir {confirmDelete.label}?</h3>
            <p style={{ color: COLORS.textMuted, fontSize: '14px', marginBottom: '20px' }}>Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm" style={{ color: COLORS.ink }}>Cancelar</button>
              <button onClick={() => {
                if (confirmDelete.tipo === 'os') excluirOSHandler();
                else if (confirmDelete.tipo === 'cliente') excluirCliente();
                else if (confirmDelete.tipo === 'peca') excluirPeca();
                else if (confirmDelete.tipo === 'servico') excluirServicoCatalogo();
                else if (confirmDelete.tipo === 'funcionario') excluirFuncionario();
                else if (confirmDelete.tipo === 'usuario') excluirUsuario();
              }} className="px-4 py-2 text-sm" style={{ background: COLORS.red, color: '#fff' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {resumoTexto !== null && (
        <div className="no-print fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(27,27,27,0.6)' }}>
          <div className="p-6 max-w-md w-full" style={{ background: COLORS.card }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: COLORS.ink, marginBottom: '8px' }}>Copiar manualmente</h3>
            <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '10px' }}>Não consegui copiar automaticamente. Toque no texto abaixo, selecione tudo e copie.</p>
            <textarea readOnly value={resumoTexto} onFocus={(e) => e.target.select()} rows={10} className="w-full text-xs p-2" style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'Roboto Mono', monospace" }} />
            <div className="flex justify-end mt-3"><button onClick={() => setResumoTexto(null)} className="px-4 py-2 text-sm" style={{ background: COLORS.ink, color: '#fff' }}>Fechar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function TelaCarregando({ texto }) {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: COLORS.paper }}>
      <div className="flex flex-col items-center gap-3">
        <Wrench className="animate-spin" size={28} style={{ color: COLORS.red }} />
        <span style={{ color: COLORS.textMuted, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}>{texto}</span>
      </div>
    </div>
  );
}
