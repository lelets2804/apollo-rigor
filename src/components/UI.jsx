import { useEffect } from 'react';
import { C, MONO } from '../constants';
import { useTheme } from '../ThemeContext';

const GREY = { color: 'var(--status-grey-fg)', bg: 'var(--status-grey-bg)', border: 'var(--status-grey-border)' };

// ── Tick-rule: fita métrica do alfaiate. Elemento estrutural recorrente —
//    aparece sob o título da página e como topo de cada indicador. ────────
export function TickRule({ color, height = 8, gap = 6, style }) {
  const major = color || C.textSub;
  const minor = color || C.textMuted;
  return (
    <div aria-hidden="true" style={{
      height, width: '100%',
      backgroundImage:
        `repeating-linear-gradient(90deg, ${major} 0 1px, transparent 1px ${gap * 5}px),` +
        `repeating-linear-gradient(90deg, ${minor} 0 1px, transparent 1px ${gap}px)`,
      backgroundRepeat: 'repeat-x, repeat-x',
      backgroundPosition: 'left bottom, left bottom',
      backgroundSize: '100% 100%, 100% 55%',
      opacity: color ? 0.85 : 0.55,
      ...style,
    }} />
  );
}

export function Badge({ label, map }) {
  const s = map[label] || GREY;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 10.5, fontWeight: 600, padding: '3px 9px 3px 7px', borderRadius: 4,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap', letterSpacing: '0.01em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

export function Card({ children, style, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: C.radius, padding: 20,
        ...(accent ? { position: 'relative', overflow: 'hidden' } : null),
        ...style,
      }}
    >
      {accent && (
        <TickRule color={C.gold} style={{
          position: 'absolute', top: 0, left: 0, right: 0, width: '100%', opacity: 0.7,
        }} />
      )}
      {children}
    </div>
  );
}

export function SectionTitle({ children, style }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, color: C.goldText, margin: '0 0 16px',
      letterSpacing: '0.16em', ...MONO, textTransform: 'uppercase', ...style,
    }}>
      {children}
    </p>
  );
}

export function Heading({ children, size = 18, style }) {
  return (
    <p style={{
      fontFamily: C.fontDisplay, fontWeight: 500, fontSize: size, color: C.text,
      margin: 0, letterSpacing: '-0.006em', lineHeight: 1.18, ...style,
    }}>
      {children}
    </p>
  );
}

// ── Indicador numérico com topo de fita métrica ────────────────────────
export function Stat({ label, value, hint, color = C.text, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius,
      padding: '13px 15px 15px', ...style,
    }}>
      <TickRule color={color} style={{ height: 6, marginBottom: 11, opacity: 0.7 }} />
      <p style={{ fontSize: 9.5, color: C.textSub, margin: '0 0 7px', fontWeight: 600, letterSpacing: '0.13em', ...MONO, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 27, fontWeight: 500, margin: 0, color, ...MONO, lineHeight: 1 }}>{value}</p>
      {hint && <p style={{ fontSize: 10.5, color: C.textSub, margin: '5px 0 0' }}>{hint}</p>}
    </div>
  );
}

export const TH = ({ children, style }) => (
  <th style={{
    textAlign: 'left', padding: '0 14px 11px 0', color: C.textSub,
    fontWeight: 600, fontSize: 9.5, letterSpacing: '0.12em', ...MONO, textTransform: 'uppercase',
    borderBottom: `1px solid ${C.border}`, ...style,
  }}>
    {children}
  </th>
);

export const TD = ({ children, style }) => (
  <td style={{ padding: '13px 14px 13px 0', borderBottom: `1px solid ${C.borderSoft}`, fontFamily: C.fontSans, ...style }}>
    {children}
  </td>
);

const inputBase = {
  width: '100%',
  padding: '9px 12px',
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: C.radiusSm,
  color: C.text,
  fontSize: 13,
  outline: 'none',
  fontFamily: C.fontSans,
};

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <p style={{ fontSize: 9.5, color: C.textSub, margin: '0 0 6px', fontWeight: 600, letterSpacing: '0.12em', ...MONO, textTransform: 'uppercase' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

export function Inp({ label, ...props }) {
  return (
    <Field label={label}>
      <input style={inputBase} {...props} />
    </Field>
  );
}

export function Sel({ label, options, ...props }) {
  return (
    <Field label={label}>
      <select style={{ ...inputBase, cursor: 'pointer' }} {...props}>
        <option value="">Selecione...</option>
        {options.map((o) => {
          const v = o.value ?? o;
          const l = o.label ?? o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </Field>
  );
}

export function BtnGold({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 20px',
        background: disabled ? C.goldDim : C.gold,
        color: disabled ? C.textMuted : C.accentInk, border: 'none', borderRadius: C.radiusSm,
        fontWeight: 600, fontSize: 12.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: C.fontSans, letterSpacing: '0.015em',
        transition: 'filter 0.15s',
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = 'brightness(1.07)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      {children}
    </button>
  );
}

export function BtnOut({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', background: 'transparent',
        color: color || C.textSub,
        border: `1px solid ${color ? color + '55' : C.border}`,
        borderRadius: C.radiusSm, fontWeight: 600, fontSize: 12,
        cursor: 'pointer', fontFamily: C.fontSans, letterSpacing: '0.01em',
      }}
    >
      {children}
    </button>
  );
}

export function IconBtn({ children, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: C.radiusSm, cursor: 'pointer', fontSize: 15, fontFamily: C.fontSans,
        background: active ? C.goldDim : 'transparent',
        color: active ? C.goldText : C.textSub,
        border: `1px solid ${active ? 'transparent' : C.border}`,
      }}
    >
      {children}
    </button>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <Field label={label}>
      <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 64 }} {...props} />
    </Field>
  );
}

export function Chip({ children, color = C.gold, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 3,
      background: bg || `color-mix(in srgb, ${color} 14%, transparent)`, color,
      letterSpacing: '0.03em', whiteSpace: 'nowrap', ...MONO,
    }}>
      {children}
    </span>
  );
}

export function Modal({ title, subtitle, onClose, children, width = 560 }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="apollo-anim-in"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(12,13,16,0.58)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '5vh 20px', overflowY: 'auto', zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apollo-scale-in"
        style={{
          width: '100%', maxWidth: width, background: C.card, position: 'relative', overflow: 'hidden',
          border: `1px solid ${C.border}`, borderRadius: C.radius, padding: 26, boxShadow: C.shadow,
        }}
      >
        <TickRule color={C.gold} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', opacity: 0.7 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <Heading size={19}>{title}</Heading>
            {subtitle && <p style={{ margin: '5px 0 0', fontSize: 12, color: C.textSub }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: C.textSub,
            fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Painel lateral (drawer) — usado para edição/detalhe sob demanda sem poluir a tela principal
export function Drawer({ title, subtitle, onClose, children, width = 480 }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,13,16,0.5)', backdropFilter: 'blur(1px)', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, right: 0, height: '100%', width: '100%', maxWidth: width,
          background: C.card, borderLeft: `1px solid ${C.border}`, boxShadow: C.shadow,
          display: 'flex', flexDirection: 'column',
          animation: 'apollo-fade-in 0.22s ease both',
        }}
      >
        <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <TickRule color={C.gold} style={{ height: 6, marginBottom: 14, opacity: 0.7 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Heading size={17}>{title}</Heading>
              {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textSub }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', color: C.textSub,
              fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4,
            }}>✕</button>
          </div>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error:   { color: 'var(--status-red-fg)',    bg: 'var(--status-red-bg)',    border: 'var(--status-red-border)' },
    warn:    { color: 'var(--status-orange-fg)', bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)' },
    success: { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
    info:    { color: 'var(--status-blue-fg)',   bg: 'var(--status-blue-bg)',   border: 'var(--status-blue-border)' },
  };
  const s = tones[tone];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.color}`, color: s.color,
      borderRadius: C.radiusSm, padding: '11px 15px', fontSize: 12.5, fontWeight: 500,
      marginBottom: 14, lineHeight: 1.5, fontFamily: C.fontSans,
    }}>
      {children}
    </div>
  );
}

export function TypeToggle({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {options.map(({ key, label, activeColor }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '6px 16px', borderRadius: C.radiusSm, cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600, fontFamily: C.fontSans, letterSpacing: '0.02em',
            background: value === key ? (activeColor || C.gold) : 'transparent',
            color: value === key ? C.accentInk : C.textSub,
            border: value === key ? 'none' : `1px solid ${C.border}`,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Alternador de tema Light/Dark
// variant "minimal" → só um ícone sol/lua, sem moldura nem rótulo (usado na vitrine)
export function ThemeToggle({ variant }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggle}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, padding: 0, borderRadius: '50%',
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: C.textMuted, transition: 'color 0.16s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.goldText; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.textMuted; }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {isDark ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
        borderRadius: C.radiusSm, border: `1px solid ${C.border}`, background: C.bgElevated,
        cursor: 'pointer', fontFamily: C.fontSans,
      }}
    >
      <span style={{
        position: 'relative', width: 30, height: 17, borderRadius: 20,
        background: isDark ? C.gold : C.borderSoft, transition: 'background 0.2s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: isDark ? 15 : 2, width: 13, height: 13, borderRadius: '50%',
          background: isDark ? C.accentInk : '#FFFFFF', transition: 'left 0.2s',
        }} />
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em', ...MONO }}>{isDark ? 'ESCURO' : 'CLARO'}</span>
    </button>
  );
}
