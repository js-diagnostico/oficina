import React from 'react';
import { COLORS } from '../lib/constants';

// Silhueta simples de um carro visto de cima, feita só com formas SVG (sem imagem externa).
export function CarroSVG() {
  return (
    <svg viewBox="0 0 240 500" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* retrovisores */}
      <rect x="18" y="120" width="16" height="28" rx="4" fill="#D8D5CC" stroke={COLORS.ink} strokeWidth="2" />
      <rect x="206" y="120" width="16" height="28" rx="4" fill="#D8D5CC" stroke={COLORS.ink} strokeWidth="2" />
      {/* rodas */}
      <rect x="10" y="105" width="18" height="55" rx="4" fill="#3A3A3A" />
      <rect x="212" y="105" width="18" height="55" rx="4" fill="#3A3A3A" />
      <rect x="10" y="345" width="18" height="55" rx="4" fill="#3A3A3A" />
      <rect x="212" y="345" width="18" height="55" rx="4" fill="#3A3A3A" />
      {/* carroceria */}
      <rect x="38" y="20" width="164" height="460" rx="55" fill="#F1EFE8" stroke={COLORS.ink} strokeWidth="3" />
      {/* para-brisa dianteiro */}
      <path d="M 62 92 L 178 92 L 163 142 L 77 142 Z" fill="#DCE7F1" stroke={COLORS.ink} strokeWidth="2" />
      {/* teto */}
      <rect x="70" y="142" width="100" height="196" rx="12" fill="#F8F7F3" stroke={COLORS.ink} strokeWidth="2" />
      {/* para-brisa traseiro */}
      <path d="M 77 338 L 163 338 L 178 388 L 62 388 Z" fill="#DCE7F1" stroke={COLORS.ink} strokeWidth="2" />
      {/* linhas das portas */}
      <line x1="38" y1="240" x2="62" y2="240" stroke={COLORS.ink} strokeWidth="1.5" />
      <line x1="178" y1="240" x2="202" y2="240" stroke={COLORS.ink} strokeWidth="1.5" />
      {/* faróis */}
      <rect x="48" y="26" width="26" height="10" rx="3" fill="#F3D98B" stroke={COLORS.ink} strokeWidth="1.5" />
      <rect x="166" y="26" width="26" height="10" rx="3" fill="#F3D98B" stroke={COLORS.ink} strokeWidth="1.5" />
      {/* lanternas */}
      <rect x="48" y="464" width="26" height="10" rx="3" fill="#E9A6A6" stroke={COLORS.ink} strokeWidth="1.5" />
      <rect x="166" y="464" width="26" height="10" rx="3" fill="#E9A6A6" stroke={COLORS.ink} strokeWidth="1.5" />
    </svg>
  );
}

export default function CarroDiagrama({ avarias, editavel, onClickDiagrama, onRemoveMarker }) {
  return (
    <div
      onClick={editavel ? onClickDiagrama : undefined}
      style={{
        position: 'relative', width: '100%', maxWidth: '260px', margin: '0 auto',
        aspectRatio: '240 / 500', cursor: editavel ? 'crosshair' : 'default',
        background: '#fff', border: `1px solid ${COLORS.line}`,
      }}
    >
      <CarroSVG />
      {(avarias || []).map((a, idx) => (
        <div
          key={a.id}
          onClick={editavel ? (e) => { e.stopPropagation(); onRemoveMarker && onRemoveMarker(a.id); } : undefined}
          title={a.nota || ''}
          style={{
            position: 'absolute', left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)',
            width: 22, height: 22, borderRadius: '50%', background: COLORS.red, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            cursor: editavel ? 'pointer' : 'default', fontFamily: "'Oswald', sans-serif",
          }}
        >
          {idx + 1}
        </div>
      ))}
    </div>
  );
}
