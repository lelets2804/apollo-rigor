import { useState } from 'react';
import { C, MONO, PRODUTOS_INIT, TRANS_INIT, AJUSTES_INIT } from './constants';
import { contagemProduto } from './logic';
import { ThemeToggle, TickRule } from './components/UI';
import Dashboard from './components/Dashboard';
import Estoque   from './components/Estoque';
import Locacoes  from './components/Locacoes';
import Anuario   from './components/Anuario';
import Ajustes   from './components/Ajustes';
import Pedidos   from './components/Pedidos';
import { useContagemNovos } from './store/pedidos';

const NAV = [
  { key: 'dashboard', label: 'Dashboard',          sub: 'Painel executivo',            icon: '◇' },
  { key: 'pedidos',   label: 'Pedidos',            sub: 'Solicitações do site',        icon: '✦' },
  { key: 'estoque',   label: 'Catálogo & Estoque', sub: 'Modelos e grade de tamanhos', icon: '▤' },
  { key: 'locacoes',  label: 'Vendas e Locações',  sub: 'Avulsa · Padronizada',        icon: '✎' },
  { key: 'anuario',   label: 'Anuário',            sub: 'Agenda e disponibilidade',    icon: '▦' },
  { key: 'ajustes',   label: 'Ateliê',             sub: 'Ajustes e devoluções',        icon: '✂' },
];

export default function App() {
  const [page, setPage] = useState(() => {
    const h = window.location.hash.slice(1);
    return NAV.some((n) => n.key === h) ? h : 'dashboard';
  });
  const [produtos, setProdutos] = useState(PRODUTOS_INIT);
  const [trans,    setTrans]    = useState(TRANS_INIT);
  const [ajustes,  setAjustes]  = useState(AJUSTES_INIT);
  const novos = useContagemNovos();

  const nav = NAV.find((n) => n.key === page);
  const idx = NAV.findIndex((n) => n.key === page);
  const contagens = produtos.map((p) => contagemProduto(p, trans, ajustes));
  const disp = contagens.reduce((s, c) => s + c.disponivel, 0);
  const alug = contagens.reduce((s, c) => s + c.alugado, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.text, fontFamily: C.fontSans }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: C.sidebar, color: C.sidebarText,
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: `linear-gradient(180deg, ${C.gold}, transparent 55%)` }} />

        <div style={{ padding: '26px 22px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: C.fontDisplay, fontSize: 20, fontWeight: 500, color: C.gold, margin: 0, letterSpacing: '0.02em' }}>
            Apollo Rigor
          </p>
          <p style={{ fontSize: 8.5, color: 'rgba(231,227,215,0.42)', margin: '6px 0 0', letterSpacing: '0.28em', ...MONO }}>
            SISTEMA DE GESTÃO
          </p>
        </div>

        <nav style={{ padding: '14px 12px', flex: 1 }}>
          {NAV.map(({ key, label, sub }, i) => {
            const active = page === key;
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '10px 12px', borderRadius: C.radiusSm, cursor: 'pointer',
                  marginBottom: 3, textAlign: 'left',
                  background: active ? 'rgba(198,160,91,0.13)' : 'transparent',
                  border: 'none', borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 9, color: active ? C.gold : 'rgba(231,227,215,0.32)', width: 16, textAlign: 'center', ...MONO }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? C.paper : 'rgba(231,227,215,0.8)', letterSpacing: '0.005em', display: 'flex', alignItems: 'center', gap: 7 }}>
                    {label}
                    {key === 'pedidos' && novos > 0 && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, lineHeight: 1, padding: '3px 5px', borderRadius: 3,
                        background: C.gold, color: C.accentInk, ...MONO,
                      }}>{novos}</span>
                    )}
                  </span>
                  <span style={{ fontSize: 9.5, color: 'rgba(231,227,215,0.38)', marginTop: 2 }}>{sub}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '15px 22px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <a href="/" style={{
            fontSize: 9.5, color: 'rgba(231,227,215,0.5)', letterSpacing: '0.14em',
            ...MONO, textTransform: 'uppercase', textDecoration: 'none',
          }}>
            ← Ver o site do cliente
          </a>
          <p style={{ fontSize: 9, color: 'rgba(231,227,215,0.3)', margin: '9px 0 0', letterSpacing: '0.16em', ...MONO, textTransform: 'uppercase' }}>
            Moda masculina & cerimônia
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          padding: '20px 30px 0', borderBottom: `1px solid ${C.border}`,
          flexShrink: 0, background: C.bgElevated,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 9.5, color: C.textSub, margin: '0 0 5px', letterSpacing: '0.16em', ...MONO }}>
                {String(idx + 1).padStart(2, '0')} / {String(NAV.length).padStart(2, '0')} · {nav.sub.toUpperCase()}
              </p>
              <p style={{ fontFamily: C.fontDisplay, fontSize: 27, fontWeight: 500, margin: 0, letterSpacing: '-0.01em', color: C.text }}>{nav.label}</p>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.textSub }}>
                <span><span style={{ color: 'var(--status-green-fg)', fontWeight: 600, ...MONO }}>{disp}</span> disponíveis</span>
                <span><span style={{ color: 'var(--status-orange-fg)', fontWeight: 600, ...MONO }}>{alug}</span> alugadas</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <TickRule style={{ height: 9, marginTop: 14 }} />
        </header>

        <main style={{ flex: 1, padding: '24px 30px', overflowY: 'auto' }}>
          {page === 'dashboard' && <Dashboard produtos={produtos} trans={trans} ajustes={ajustes} />}
          {page === 'pedidos'   && <Pedidos trans={trans} setTrans={setTrans} />}
          {page === 'estoque'   && <Estoque produtos={produtos} setProdutos={setProdutos} trans={trans} ajustes={ajustes} />}
          {page === 'locacoes'  && (
            <Locacoes
              produtos={produtos} setProdutos={setProdutos}
              trans={trans} setTrans={setTrans}
              ajustes={ajustes} setAjustes={setAjustes}
            />
          )}
          {page === 'anuario' && <Anuario produtos={produtos} trans={trans} />}
          {page === 'ajustes' && (
            <Ajustes
              produtos={produtos} trans={trans} setTrans={setTrans}
              ajustes={ajustes} setAjustes={setAjustes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
