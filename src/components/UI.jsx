import React from 'react';
import { Plus } from 'lucide-react';
import { COLORS, inputCls } from '../lib/constants';

export function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="mb-6 p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: COLORS.red }} />
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '15px', color: COLORS.ink, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function Field({ label, full, children }) {
  return (
    <label className="flex flex-col gap-1" style={full ? { gridColumn: '1 / -1' } : {}}>
      {label && <span style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>}
      <span style={{ border: `1px solid ${COLORS.line}` }}>{children}</span>
    </label>
  );
}

export function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-xs px-2 py-1" style={{ color: COLORS.red, fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
      <Plus size={14} /> {label}
    </button>
  );
}

export { inputCls };
