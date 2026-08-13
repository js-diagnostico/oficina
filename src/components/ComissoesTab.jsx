import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { COLORS, PAPEL_FUNCIONARIO, brl, thisMonthKey, monthKey, totalServicos, totalPecas } from '../lib/constants';

export default function ComissoesTab({ ordens, funcionarios, comissoesPagas, onTogglePago }) {
  const [mes, setMes] = useState(thisMonthKey());

  const linhas = funcionarios.map((f) => {
    const ehMecanico = f.papel === 'mecanico' || f.papel === 'ambos';
    const ehVendedor = f.papel === 'vendedor' || f.papel === 'ambos';
    const osDoMes = ordens.filter((o) => o.status === 'concluida' && monthKey(o.dataConclusao || o.createdAt) === mes);
    const baseServicos = ehMecanico ? osDoMes.filter((o) => o.mecanicoId === f.id).reduce((t, o) => t + totalServicos(o), 0) : 0;
    const basePecas = ehVendedor ? osDoMes.filter((o) => o.vendedorId === f.id).reduce((t, o) => t + totalPecas(o), 0) : 0;
    const pct = parseFloat(f.percentual) || 0;
    const comissaoServicos = baseServicos * pct / 100;
    const comissaoPecas = basePecas * pct / 100;
    const total = comissaoServicos + comissaoPecas;
    const chave = `${f.id}|${mes}`;
    return { funcionario: f, baseServicos, basePecas, comissaoServicos, comissaoPecas, total, pago: !!comissoesPagas[chave], chave };
  });

  const totalGeral = linhas.reduce((t, l) => t + l.total, 0);

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: COLORS.ink }}>COMISSÕES</h1>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Comissão de mecânicos e vendedores sobre as OS concluídas</p>
        </div>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="px-3 py-2 text-sm outline-none" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }} />
      </div>

      {linhas.length === 0 ? (
        <p style={{ color: COLORS.textMuted }}>Cadastre a equipe (aba Equipe) para apurar comissões.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {linhas.map((l) => (
            <div key={l.chave} className="flex flex-col md:flex-row md:items-center gap-3 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: COLORS.ink }}>{l.funcionario.nome} <span style={{ fontSize: '12px', color: COLORS.textMuted, fontWeight: 400 }}>({PAPEL_FUNCIONARIO[l.funcionario.papel]}, {l.funcionario.percentual || 0}%)</span></div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                  {l.baseServicos > 0 && <>Serviços: {brl(l.baseServicos)} → {brl(l.comissaoServicos)}  </>}
                  {l.basePecas > 0 && <>Peças: {brl(l.basePecas)} → {brl(l.comissaoPecas)}</>}
                  {l.baseServicos === 0 && l.basePecas === 0 && 'Sem movimento no mês'}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '16px', color: COLORS.ink }}>{brl(l.total)}</span>
                <button onClick={() => onTogglePago(l.chave, !l.pago)} className="flex items-center gap-1 px-2 py-1 text-xs" style={{ color: l.pago ? COLORS.green : COLORS.textMuted, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
                  {l.pago ? <CheckCircle2 size={16} /> : <Circle size={16} />} {l.pago ? 'Pago' : 'Pendente'}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-3 mt-2" style={{ background: COLORS.ink }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", color: '#C9C6BE', textTransform: 'uppercase', fontSize: '13px' }}>Total de comissões no mês</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '20px', color: '#fff' }}>{brl(totalGeral)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
