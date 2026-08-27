import React from 'react';
import { COLORS, STATUS, STATUS_CHECKLIST, brl, brDate, totaisOS } from '../lib/constants';
import CarroDiagrama from './CarroDiagrama';

const labelStyle = { fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '2px' };
const valueStyle = { fontSize: '14px', color: COLORS.ink, fontWeight: 600 };

export default function PrintableOS({ os, config, via }) {
  const t = totaisOS(os);
  const st = STATUS[os.status];
  const dias = os.garantiaDias || config.garantiaPadraoDias;
  const checklistPreenchido = (os.checklist || []).filter((c) => c.nome && c.status);

  return (
    <div id="print-area" className="mx-auto" style={{ maxWidth: '760px', background: '#fff', border: `1px solid ${COLORS.lineStrong}` }}>
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `2px solid ${COLORS.ink}` }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" style={{ height: '52px', width: 'auto' }} />
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: COLORS.ink, textTransform: 'uppercase' }}>{config.nome || 'Oficina'}</div>
            <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{config.endereco}{config.endereco && config.telefone ? ' · ' : ''}{config.telefone}</div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase' }}>Ordem de serviço</div>
          <div style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '22px', color: COLORS.red }}>{os.numero}</div>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-2 gap-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        <div><div style={labelStyle}>Cliente</div><div style={valueStyle}>{os.cliente.nome}</div><div style={{ fontSize: '13px', color: COLORS.textMuted }}>{os.cliente.telefone}</div></div>
        <div><div style={labelStyle}>Status</div><span style={{ display: 'inline-block', padding: '2px 10px', background: st.bg, color: st.fg, fontFamily: "'Oswald', sans-serif", fontSize: '13px', textTransform: 'uppercase' }}>{st.label}</span></div>
        <div><div style={labelStyle}>Veículo</div><div style={valueStyle}>{os.veiculo.modelo || '—'} {os.veiculo.ano ? `(${os.veiculo.ano})` : ''}</div></div>
        <div><div style={labelStyle}>Placa</div><div style={{ ...valueStyle, fontFamily: "'Roboto Mono', monospace", display: 'inline-block', border: `1px solid ${COLORS.ink}`, padding: '2px 10px' }}>{os.veiculo.placa}</div></div>
        <div><div style={labelStyle}>Km</div><div style={valueStyle}>{os.veiculo.km || '—'}</div></div>
        <div><div style={labelStyle}>Chassi</div><div style={{ ...valueStyle, fontFamily: "'Roboto Mono', monospace" }}>{os.veiculo.chassi || '—'}</div></div>
        <div><div style={labelStyle}>Combustível</div><div style={valueStyle}>{os.nivelCombustivel || '—'}</div></div>
        <div><div style={labelStyle}>Entrada</div><div style={valueStyle}>{brDate(os.dataEntrada)}</div></div>
        <div><div style={labelStyle}>Previsão</div><div style={valueStyle}>{brDate(os.previsao)}</div></div>
      </div>

      {checklistPreenchido.length > 0 && (
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={labelStyle}>Check-list de entrada</div>
          <div className="grid grid-cols-2 gap-x-4">
            {checklistPreenchido.map((c) => {
              const sc = STATUS_CHECKLIST[c.status];
              return (<div key={c.id} className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.ink }}>{c.nome}</span><span style={{ color: sc.fg, fontFamily: "'Oswald', sans-serif", fontSize: '12px', textTransform: 'uppercase' }}>{sc.label}</span></div>);
            })}
          </div>
        </div>
      )}

      {(os.avarias || []).length > 0 && (
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={labelStyle}>Avarias registradas na entrada</div>
          <div style={{ width: '160px', margin: '4px auto' }}>
            <CarroDiagrama avarias={os.avarias} editavel={false} />
          </div>
          <div className="mt-1">
            {os.avarias.map((a, idx) => (
              <div key={a.id} className="flex gap-2 text-sm py-0.5">
                <span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.red, fontWeight: 700 }}>{idx + 1}.</span>
                <span style={{ color: COLORS.ink }}>{a.nota || 'Sem descrição'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {os.problema && (<div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}><div style={labelStyle}>Problema relatado</div><div style={{ fontSize: '14px', color: COLORS.ink }}>{os.problema}</div></div>)}
      {os.laudoTecnico && (<div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}><div style={labelStyle}>Laudo técnico</div><div style={{ fontSize: '14px', color: COLORS.ink }}>{os.laudoTecnico}</div></div>)}

      {os.servicos.length > 0 && (
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={labelStyle}>Serviços</div>
          {os.servicos.map((s) => (<div key={s.id} className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.ink }}>{s.descricao || '—'}</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>{brl(parseFloat(s.valor) || 0)}</span></div>))}
        </div>
      )}
      {os.pecas.length > 0 && (
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={labelStyle}>Peças</div>
          {os.pecas.map((p) => (<div key={p.id} className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.ink }}>{p.descricao || '—'} {p.qtd ? `× ${p.qtd}` : ''}</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>{brl((parseFloat(p.qtd) || 0) * (parseFloat(p.valorUnit) || 0))}</span></div>))}
        </div>
      )}
      {os.observacoes && (<div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}><div style={labelStyle}>Observações</div><div style={{ fontSize: '13px', color: COLORS.textMuted }}>{os.observacoes}</div></div>)}

      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.textMuted }}>Total produto</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>{brl(t.totalProduto)}</span></div>
        <div className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.textMuted }}>Total serviço</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>{brl(t.totalServico)}</span></div>
        <div className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.textMuted }}>Total bruto</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>{brl(t.totalBruto)}</span></div>
        <div className="flex justify-between text-sm py-0.5"><span style={{ color: COLORS.textMuted }}>Desconto</span><span style={{ fontFamily: "'Roboto Mono', monospace", color: COLORS.ink }}>− {brl(t.desconto)}</span></div>
      </div>

      <div className="flex justify-between items-center px-6 py-4" style={{ background: COLORS.ink }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", color: '#C9C6BE', textTransform: 'uppercase', fontSize: '13px' }}>Total líquido</span>
        <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: '24px', color: '#fff' }}>{brl(t.totalLiquido)}</span>
      </div>

      <div className="px-6 py-4 grid grid-cols-2 gap-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        <div><div style={labelStyle}>Forma de pagamento</div><div style={valueStyle}>{os.formaPagamento || '—'}</div></div>
        <div><div style={labelStyle}>Garantia</div><div style={valueStyle}>{dias ? `${dias} dias` : '—'}</div></div>
      </div>
      {config.termosGarantia && (<div className="px-6 py-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}><div style={{ fontSize: '11px', color: COLORS.textMuted }}>{config.termosGarantia}</div></div>)}

      <div className="grid grid-cols-2 gap-8 px-6 py-8">
        <div className="text-center"><div style={{ borderTop: `1px solid ${COLORS.ink}`, paddingTop: '6px', fontSize: '12px', color: COLORS.textMuted }}>Assinatura do cliente</div></div>
        <div className="text-center"><div style={{ borderTop: `1px solid ${COLORS.ink}`, paddingTop: '6px', fontSize: '12px', color: COLORS.textMuted }}>Responsável técnico</div></div>
      </div>

      <div style={{ borderTop: `2px dashed ${COLORS.lineStrong}` }} className="flex items-center justify-between px-6 py-2">
        <span style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{via === 'oficina' ? 'Via da oficina' : 'Via do cliente'}</span>
        <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: '11px', color: COLORS.textMuted }}>{os.numero}</span>
      </div>
    </div>
  );
}
