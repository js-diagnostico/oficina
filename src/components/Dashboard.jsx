import React, { useState } from 'react';
import { Plus, Search, Printer, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { COLORS, STATUS, brl, brDate, calcTotal, thisMonthKey, monthKey, statusManutencao, STATUS_MANUTENCAO } from '../lib/constants';

export default function Dashboard({ ordens, estoque, clientes, papel, onNovo, onVer, onEditar, onExcluir, onMudarStatus }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');

  const filtered = ordens.filter((o) => {
    const matchesStatus = filterStatus === 'todas' || o.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      o.veiculo.placa.toLowerCase().includes(q) ||
      (o.veiculo.chassi || '').toLowerCase().includes(q) ||
      o.cliente.nome.toLowerCase().includes(q) ||
      (o.numero || '').toLowerCase().includes(q) ||
      o.veiculo.modelo.toLowerCase().includes(q) ||
      (o.problema || '').toLowerCase().includes(q) ||
      (o.laudoTecnico || '').toLowerCase().includes(q) ||
      (o.formaPagamento || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    abertas: ordens.filter((o) => o.status === 'aberta').length,
    andamento: ordens.filter((o) => o.status === 'andamento').length,
    concluidasMes: ordens.filter((o) => o.status === 'concluida' && monthKey(o.dataConclusao || o.createdAt) === thisMonthKey()).length,
    faturamentoMes: ordens.filter((o) => o.status === 'concluida' && monthKey(o.dataConclusao || o.createdAt) === thisMonthKey()).reduce((t, o) => t + calcTotal(o), 0),
    estoqueBaixo: estoque.filter((e) => (parseFloat(e.estoqueAtual) || 0) <= (parseFloat(e.estoqueMin) || 0)).length,
  };

  const manutencoesAlerta = [];
  (clientes || []).forEach((c) => {
    (c.veiculos || []).forEach((v) => {
      (v.manutencoes || []).forEach((m) => {
        const s = statusManutencao(m);
        if (s.status === 'proximo' || s.status === 'vencido') {
          manutencoesAlerta.push({ id: m.id, cliente: c.nome, placa: v.placa, item: m.item, ...s });
        }
      });
    });
  });
  manutencoesAlerta.sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0));

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '30px', color: COLORS.ink }}>PAINEL DA OFICINA</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Ordens de serviço e movimento da oficina</p>
        </div>
        <button onClick={onNovo} className="flex items-center gap-2 px-4 py-2.5" style={{ background: COLORS.red, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: '14px' }}>
          <Plus size={16} /> Nova OS
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Abertas', value: stats.abertas, color: COLORS.gold },
          { label: 'Em andamento', value: stats.andamento, color: COLORS.navy },
          { label: 'Concluídas no mês', value: stats.concluidasMes, color: COLORS.green },
          papel === 'admin' && { label: 'Faturado no mês', value: brl(stats.faturamentoMes), color: COLORS.red, small: true },
          { label: 'Estoque baixo', value: stats.estoqueBaixo, color: stats.estoqueBaixo > 0 ? COLORS.maroon : COLORS.textMuted },
        ].filter(Boolean).map((s, i) => (
          <div key={i} className="p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Oswald', sans-serif" }}>{s.label}</div>
            <div style={{ color: s.color, fontFamily: "'Oswald', sans-serif", fontSize: s.small ? '22px' : '30px', marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {manutencoesAlerta.length > 0 && (
        <div className="mb-8">
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '15px', color: COLORS.ink, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Revisões e trocas a vencer</div>
          <div className="flex flex-col gap-2">
            {manutencoesAlerta.map((m) => {
              const st = STATUS_MANUTENCAO[m.status];
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 p-3 flex-wrap" style={{ background: COLORS.card, border: `1px solid ${st.fg}` }}>
                  <div>
                    <span style={{ fontWeight: 600, color: COLORS.ink }}>{m.item || 'Item'}</span>
                    <span style={{ color: COLORS.textMuted, fontSize: '13px' }}> — {m.cliente} · <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{m.placa}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '12px', color: COLORS.textMuted }}>{m.dataProxima ? brDate(m.dataProxima.toISOString().slice(0, 10)) : '—'}</span>
                    <span style={{ padding: '2px 8px', background: st.bg, color: st.fg, fontFamily: "'Oswald', sans-serif", fontSize: '12px', textTransform: 'uppercase' }}>{m.status === 'vencido' ? `Vencido há ${Math.abs(m.diasRestantes)}d` : `Vence em ${m.diasRestantes}d`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[220px]" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <Search size={16} style={{ color: COLORS.textMuted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por placa, chassi, cliente, modelo ou número da OS" className="w-full outline-none text-sm" style={{ background: 'transparent' }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm outline-none" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          <option value="todas">Todos os status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ border: `1px dashed ${COLORS.lineStrong}`, background: COLORS.card }}>
          <ClipboardList size={32} style={{ color: COLORS.textMuted }} />
          <p style={{ color: COLORS.textMuted }}>{ordens.length === 0 ? 'Nenhuma ordem de serviço ainda.' : 'Nenhuma ordem encontrada com esse filtro.'}</p>
          {ordens.length === 0 && <button onClick={onNovo} style={{ color: COLORS.red, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', fontSize: '14px' }}>Criar a primeira OS →</button>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((os) => {
            const st = STATUS[os.status];
            return (
              <div key={os.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center gap-3 md:w-32 shrink-0">
                  <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color: COLORS.ink }}>{os.numero}</span>
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                  <div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>Cliente</div>
                    <div style={{ color: COLORS.ink, fontWeight: 600, fontSize: '14px' }}>{os.cliente.nome}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>Veículo</div>
                    <div style={{ color: COLORS.ink, fontSize: '14px' }}>{os.veiculo.modelo || '—'} · <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{os.veiculo.placa}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>Entrada</div>
                    <div style={{ color: COLORS.ink, fontSize: '14px' }}>{brDate(os.dataEntrada)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span style={{ color: COLORS.ink, fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '14px', minWidth: '90px', textAlign: 'right' }}>{brl(calcTotal(os))}</span>
                  <select value={os.status} onChange={(e) => onMudarStatus(os, e.target.value)} className="px-2 py-1 text-xs outline-none" style={{ background: st.bg, color: st.fg, border: 'none', fontWeight: 600, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => onVer(os)} title="Ver / imprimir" className="p-1.5" style={{ color: COLORS.textMuted }}><Printer size={16} /></button>
                  <button onClick={() => onEditar(os)} title="Editar" className="p-1.5" style={{ color: COLORS.textMuted }}><Pencil size={16} /></button>
                  <button onClick={() => onExcluir(os)} title="Excluir" className="p-1.5" style={{ color: COLORS.red }}><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
