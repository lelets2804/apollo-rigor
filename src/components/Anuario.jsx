import { useState, useMemo } from 'react';
import { C, MONO, fmtDate } from '../constants';
import { Card, SectionTitle, Heading, Chip, TickRule } from './UI';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MES_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d) => addDays(d, -d.getDay());
const parse = (s) => new Date(s + 'T12:00:00');
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
const fmtShort = (s) => { const d = parse(s); return `${d.getDate()} ${MES_ABBR[d.getMonth()]}`; };

// ── Modelagem: um evento por locação (não por peça) ─────────────────────
function categoriaBreakdown(itens) {
  const m = {};
  itens.forEach((i) => { m[i.categoria] = (m[i.categoria] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function buildEventos(produtos, trans) {
  const pMap = new Map(produtos.map((p) => [p.id, p]));
  const eventos = [];

  trans.forEach((t) => {
    if (t.devolvido !== false) return; // só locações em aberto

    if (t.tipo === 'locacao_avulsa') {
      const p = pMap.get(t.produtoId);
      eventos.push({
        transId: t.id, tipo: 'avulsa',
        titulo: t.cliente, subtitulo: 'Locação avulsa',
        retirada: t.retirada, devolucao: t.devolucao,
        dataEvento: t.dataEvento || t.retirada,
        itens: [{
          produtoId: p?.id ?? null, nome: p?.nome || '—',
          tam: t.tamEntregue || t.tamPedido || '—',
          categoria: p?.categoria || 'Outro', quem: t.cliente,
        }],
      });
    }

    if (t.tipo === 'locacao_padronizada') {
      const itens = (t.integrantes || [])
        .filter((i) => !i.devolvido)
        .map((i) => {
          const p = pMap.get(i.produtoId);
          return {
            produtoId: i.produtoId ?? null, nome: p?.nome || '—',
            tam: i.tamEntregue || i.tam || '—',
            categoria: p?.categoria || 'Outro',
            quem: `${i.nome}${i.papel ? ` · ${i.papel}` : ''}`,
          };
        });
      if (itens.length === 0) return;
      eventos.push({
        transId: t.id, tipo: 'padronizada',
        titulo: t.noivos || t.cliente,
        subtitulo: t.noivos && t.cliente ? t.cliente : 'Pacote padronizado',
        retirada: t.retirada, devolucao: t.devolucao,
        dataEvento: t.dataEvento || t.retirada,
        itens,
      });
    }
  });

  return eventos.map((e) => ({ ...e, nPecas: e.itens.length, breakdown: categoriaBreakdown(e.itens) }));
}

// agregação de um dia: saídas (retiradas), retornos (devoluções), em campo (ativas)
function aggDia(eventos, dstr) {
  const saidas = eventos.filter((e) => e.retirada === dstr);
  const retornos = eventos.filter((e) => e.devolucao === dstr);
  const ativos = eventos.filter((e) => e.retirada <= dstr && dstr <= e.devolucao);
  const sum = (arr) => arr.reduce((s, e) => s + e.nPecas, 0);
  return {
    saidas, retornos, ativos,
    nSaidas: sum(saidas), nRetornos: sum(retornos), nAtivos: sum(ativos),
  };
}

// ── Heatmap por carga de saídas vs. capacidade — reaproveita a paleta de status do tema ──
function heatStyle(n, cap) {
  if (!n) return { bg: C.card, border: C.border, accent: C.textSub };
  const r = n / cap;
  if (r < 0.5)  return { bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)',  accent: 'var(--status-green-fg)' };
  if (r < 0.85) return { bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)', accent: 'var(--status-orange-fg)' };
  if (r <= 1)   return { bg: 'var(--status-yellow-bg)', border: 'var(--status-yellow-border)', accent: C.gold };
  return { bg: 'var(--status-red-bg)', border: 'var(--status-red-border)', accent: 'var(--status-red-fg)' };
}

const linkBtn = {
  background: 'transparent', border: 'none', padding: 0, color: C.textSub,
  fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
};
const navBtn = {
  width: 30, height: 30, borderRadius: 7, background: 'transparent',
  border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit',
};

function CapacityBar({ n, cap, label }) {
  const pct = cap > 0 ? Math.min(100, (n / cap) * 100) : 0;
  const h = heatStyle(n, cap);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textSub, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: h.accent, fontWeight: 700 }}>
          {n} / {cap}{n > cap ? ` · +${n - cap} acima` : ''}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: C.inputBg, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: h.accent }} />
      </div>
    </div>
  );
}

const LegendSwatch = ({ c, t }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ width: 9, height: 9, borderRadius: 2, background: c, display: 'inline-block' }} />{t}
  </span>
);

function MiniStat({ label, val, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '12px 14px 14px' }}>
      <TickRule color={color} style={{ height: 6, marginBottom: 10, opacity: 0.7 }} />
      <p style={{ fontSize: 9, color: C.textSub, margin: '0 0 6px', fontWeight: 600, letterSpacing: '0.13em', ...MONO, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 23, fontWeight: 500, margin: 0, color, ...MONO, lineHeight: 1 }}>{val}</p>
      <p style={{ fontSize: 10, color: C.textSub, margin: '4px 0 0' }}>{sub}</p>
    </div>
  );
}

// ── Visão MÊS: heatmap de carga + eventos resumidos ───────────────────
function MonthView({ cursor, eventos, cap, selected, onSelect }) {
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const gridStart = startOfWeek(new Date(year, month, 1));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const hoje = iso(new Date());

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
        {DIAS.map((d, i) => (
          <p key={d} style={{ margin: 0, fontSize: 10, color: i === 0 || i === 6 ? C.goldText : C.textSub, fontWeight: 700, textAlign: 'center' }}>{d}</p>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
        {cells.map((d, i) => {
          const dstr = iso(d);
          const inMonth = d.getMonth() === month;
          const { saidas, nSaidas, nRetornos } = aggDia(eventos, dstr);
          const h = heatStyle(nSaidas, cap);
          const isToday = dstr === hoje;
          const sel = selected === dstr;
          return (
            <div key={i} onClick={() => onSelect(dstr)} style={{
              minHeight: 96, padding: 7, cursor: 'pointer', borderRadius: 8, opacity: inMonth ? 1 : 0.32,
              background: sel ? C.goldDim : nSaidas ? h.bg : isWeekend(d) ? C.bgElevated : C.card,
              border: `1px solid ${sel ? C.gold : nSaidas ? h.border : C.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? C.gold : C.text }}>{d.getDate()}</span>
                {(nSaidas > 0 || nRetornos > 0) && (
                  <span style={{ fontSize: 9, fontWeight: 700, display: 'flex', gap: 5 }}>
                    {nSaidas > 0 && <span style={{ color: h.accent }}>↑{nSaidas}</span>}
                    {nRetornos > 0 && <span style={{ color: 'var(--status-blue-fg)' }}>↓{nRetornos}</span>}
                  </span>
                )}
              </div>
              {saidas.slice(0, 2).map((e) => (
                <div key={e.transId} style={{
                  fontSize: 9.5, color: C.text, background: C.bgElevated, borderRadius: 4,
                  padding: '2px 5px', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  <span style={{ color: h.accent, fontWeight: 700 }}>{e.nPecas}</span> {e.titulo}
                </div>
              ))}
              {saidas.length > 2 && <p style={{ margin: 0, fontSize: 9, color: C.textSub }}>+{saidas.length - 2} evento(s)</p>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 9.5, color: C.textSub, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>↑ saídas · ↓ retornos · fundo = carga do dia:</span>
        <LegendSwatch c="var(--status-green-fg)" t={`até ${Math.round(cap * 0.5)}`} />
        <LegendSwatch c="var(--status-orange-fg)" t={`até ${Math.round(cap * 0.85)}`} />
        <LegendSwatch c={C.gold} t={`até ${cap}`} />
        <LegendSwatch c="var(--status-red-fg)" t={`acima de ${cap}`} />
      </div>
    </div>
  );
}

// ── Visão SEMANA: coluna por dia com barra de capacidade ──────────────
function WeekView({ cursor, eventos, cap, selected, onSelect }) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
      {days.map((d, i) => {
        const dstr = iso(d);
        const { saidas, retornos, nSaidas, nRetornos, nAtivos } = aggDia(eventos, dstr);
        const sel = selected === dstr;
        const wknd = isWeekend(d);
        return (
          <div key={i} onClick={() => onSelect(dstr)} style={{
            minHeight: 220, padding: 9, cursor: 'pointer', borderRadius: 8,
            background: sel ? C.goldDim : wknd ? C.bgElevated : C.card,
            border: `1px solid ${sel ? C.gold : C.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: wknd ? C.goldText : C.textSub, fontWeight: 700 }}>{DIAS[d.getDay()]}</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{d.getDate()}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 9, color: C.textSub, lineHeight: 1.5 }}>
                <div style={{ color: heatStyle(nSaidas, cap).accent, fontWeight: 700 }}>↑ {nSaidas}</div>
                <div style={{ color: 'var(--status-blue-fg)' }}>↓ {nRetornos}</div>
                <div>{nAtivos} em campo</div>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}><CapacityBar n={nSaidas} cap={cap} label="Saídas" /></div>
            {saidas.map((e) => (
              <div key={e.transId} style={{ fontSize: 10, background: C.bgElevated, borderRadius: 5, padding: '4px 6px', marginBottom: 4 }}>
                <div style={{ color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ color: C.gold }}>{e.nPecas}</span> {e.titulo}
                </div>
                <div style={{ color: C.textSub }}>{e.subtitulo}</div>
              </div>
            ))}
            {retornos.map((e) => (
              <div key={'r' + e.transId} style={{ fontSize: 10, color: 'var(--status-blue-fg)', padding: '2px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ↓ {e.nPecas} {e.titulo}
              </div>
            ))}
            {saidas.length === 0 && retornos.length === 0 && <p style={{ margin: 0, fontSize: 10, color: 'var(--status-green-fg)' }}>Livre</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Card de evento (usado na Agenda) ──────────────────────────────────
function EventoCard({ e, cap, onSelectDay }) {
  const [open, setOpen] = useState(false);
  const h = heatStyle(e.nPecas, cap);
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${e.tipo === 'padronizada' ? 'var(--status-blue-fg)' : 'var(--status-orange-fg)'}`,
      borderRadius: 8, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titulo}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>{e.subtitulo}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: h.accent }}>{e.nPecas}</p>
          <p style={{ margin: 0, fontSize: 9, color: C.textSub }}>peças</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, margin: '8px 0', fontSize: 11, color: C.textSub, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => onSelectDay(e.retirada)} style={linkBtn}>↑ retira {fmtShort(e.retirada)}</button>
        <button onClick={() => onSelectDay(e.devolucao)} style={linkBtn}>↓ devolve {fmtShort(e.devolucao)}</button>
        {e.dataEvento && <span>· evento {fmtShort(e.dataEvento)}</span>}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {e.breakdown.map(([cat, n]) => (
          <span key={cat} style={{ fontSize: 10, color: C.textSub, background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 7px' }}>
            {n}× {cat}
          </span>
        ))}
      </div>
      {e.itens.length > 1 && (
        <button onClick={() => setOpen(!open)} style={{ ...linkBtn, color: C.gold, marginTop: 8 }}>
          {open ? 'Ocultar peças' : `Ver ${e.itens.length} peças`}
        </button>
      )}
      {open && (
        <div style={{ marginTop: 6 }}>
          {e.itens.map((i, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.text }}>{i.nome} <span style={{ color: C.textSub }}>({i.tam})</span></span>
              <span style={{ color: C.textSub, textAlign: 'right' }}>{i.quem}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Visão AGENDA: eventos agrupados por fim de semana (padrão) ────────
function AgendaView({ eventos, cap, onSelectDay }) {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('todos');

  const grupos = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtrados = eventos.filter((e) => {
      if (tipo !== 'todos' && e.tipo !== tipo) return false;
      if (!s) return true;
      return e.titulo.toLowerCase().includes(s)
        || e.subtitulo.toLowerCase().includes(s)
        || e.itens.some((i) => i.nome.toLowerCase().includes(s) || i.quem.toLowerCase().includes(s));
    });
    const map = new Map();
    filtrados.forEach((e) => {
      const anchor = parse(e.dataEvento || e.retirada);
      const key = iso(addDays(startOfWeek(anchor), 6)); // sábado da semana
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, evs]) => [key, evs.sort((a, b) => (a.dataEvento || a.retirada).localeCompare(b.dataEvento || b.retirada))]);
  }, [eventos, q, tipo]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Buscar evento, noivos, peça ou pessoa..."
          style={{ flex: 1, minWidth: 220, padding: '8px 11px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        {[['todos', 'Todos'], ['padronizada', 'Padronizada'], ['avulsa', 'Avulsa']].map(([k, l]) => (
          <button key={k} onClick={() => setTipo(k)} style={{
            padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            background: tipo === k ? C.gold : 'transparent', color: tipo === k ? C.accentInk : C.textSub,
            border: tipo === k ? 'none' : `1px solid ${C.border}`,
          }}>{l}</button>
        ))}
      </div>

      {grupos.length === 0 && <p style={{ color: C.textSub, fontSize: 13 }}>Nenhum evento encontrado.</p>}

      {grupos.map(([key, evs]) => {
        const sat = parse(key), sun = addDays(sat, 1);
        const totalPecas = evs.reduce((acc, e) => acc + e.nPecas, 0);
        const porDia = {};
        evs.forEach((e) => { porDia[e.retirada] = (porDia[e.retirada] || 0) + e.nPecas; });
        const pico = Math.max(0, ...Object.values(porDia));
        const over = pico > cap;
        const label = sat.getMonth() === sun.getMonth()
          ? `${sat.getDate()}–${sun.getDate()} ${MES_ABBR[sat.getMonth()]}`
          : `${sat.getDate()} ${MES_ABBR[sat.getMonth()]} – ${sun.getDate()} ${MES_ABBR[sun.getMonth()]}`;
        return (
          <div key={key} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <Heading size={14}>
                Fim de semana · {label} <span style={{ fontWeight: 400, color: C.textSub, fontFamily: C.fontSans }}>{sat.getFullYear()}</span>
              </Heading>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Chip color="var(--status-blue-fg)">{evs.length} evento(s)</Chip>
                <Chip color={C.gold}>{totalPecas} peças</Chip>
                <Chip color={over ? 'var(--status-red-fg)' : 'var(--status-green-fg)'}>pico {pico}/{cap}</Chip>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
              {evs.map((e) => <EventoCard key={e.transId} e={e} cap={cap} onSelectDay={onSelectDay} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Linha de evento (usada na visão Dia) ─────────────────────────────
function LinhaEvento({ e, tag, cor }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.text, fontWeight: 500 }}>
            <span style={{ color: cor, fontWeight: 800 }}>{tag} {e.nPecas}</span> · {e.titulo}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>
            {e.subtitulo} · {fmtDate(e.retirada)} → {fmtDate(e.devolucao)}
          </p>
        </div>
        {e.itens.length > 1 && (
          <button onClick={() => setOpen(!open)} style={{ ...linkBtn, color: C.gold, flexShrink: 0 }}>{open ? 'ocultar' : 'peças'}</button>
        )}
      </div>
      {open && (
        <div style={{ marginTop: 6, paddingLeft: 10 }}>
          {e.itens.map((i, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, padding: '3px 0' }}>
              <span style={{ color: C.text }}>{i.nome} <span style={{ color: C.textSub }}>({i.tam})</span></span>
              <span style={{ color: C.textSub, textAlign: 'right' }}>{i.quem}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bloco({ titulo, vazio, itens }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 10, color: C.goldText, fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 8px' }}>{titulo}</p>
      {itens.length === 0 ? <p style={{ color: C.textSub, fontSize: 12, margin: 0 }}>{vazio}</p> : itens}
    </div>
  );
}

// ── Visão DIA: saídas / retornos / em campo + disponibilidade ─────────
// Disponibilidade percorre a grade de tamanhos (variantes) de cada modelo do catálogo.
function DayView({ dstr, produtos, eventos, cap }) {
  const [showCat, setShowCat] = useState(false);
  const { saidas, retornos, ativos, nSaidas, nRetornos, nAtivos } = aggDia(eventos, dstr);

  const ocupado = {};
  ativos.forEach((e) => e.itens.forEach((i) => {
    if (i.produtoId != null) {
      const key = `${i.produtoId}|${i.tam}`;
      ocupado[key] = (ocupado[key] || 0) + 1;
    }
  }));

  const variantes = useMemo(() => {
    const list = [];
    produtos.forEach((p) => (p.variantes || []).forEach((v) => list.push({ produto: p, tam: v.tam, qtd: v.qtd })));
    return list;
  }, [produtos]);

  const comLivre = variantes.filter((x) => x.qtd - (ocupado[`${x.produto.id}|${x.tam}`] || 0) > 0).length;
  const esgotados = variantes.length - comLivre;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <MiniStat label="Saídas (retiradas)" val={nSaidas} sub={`${saidas.length} evento(s)`} color={heatStyle(nSaidas, cap).accent} />
        <MiniStat label="Retornos (devoluções)" val={nRetornos} sub={`${retornos.length} evento(s)`} color="var(--status-blue-fg)" />
        <MiniStat label="Peças em campo" val={nAtivos} sub={`${ativos.length} locação(ões) ativa(s)`} color={C.text} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <CapacityBar n={nSaidas} cap={cap} label={`Carga de saídas em ${fmtDate(dstr)}`} />
      </div>

      <Bloco titulo="SAÍDAS DO DIA" vazio="Nenhuma retirada agendada." itens={saidas.map((e) => (
        <LinhaEvento key={e.transId} e={e} tag="↑" cor={heatStyle(e.nPecas, cap).accent} />
      ))} />
      <Bloco titulo="RETORNOS DO DIA" vazio="Nenhuma devolução agendada." itens={retornos.map((e) => (
        <LinhaEvento key={e.transId} e={e} tag="↓" cor="var(--status-blue-fg)" />
      ))} />
      <Bloco titulo="LOCAÇÕES EM CAMPO" vazio="Nenhuma peça reservada nesta data." itens={ativos.map((e) => (
        <LinhaEvento key={e.transId} e={e} tag="•" cor={C.textSub} />
      ))} />

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 10, color: C.goldText, fontWeight: 700, letterSpacing: '0.08em', margin: 0 }}>DISPONIBILIDADE DO CATÁLOGO</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Chip color="var(--status-green-fg)">{comLivre} com unidade livre</Chip>
            <Chip color={esgotados ? 'var(--status-orange-fg)' : 'var(--status-green-fg)'}>{esgotados} sem folga</Chip>
            <button onClick={() => setShowCat(!showCat)} style={{ ...linkBtn, color: C.gold }}>{showCat ? 'ocultar' : 'detalhar'}</button>
          </div>
        </div>
        {showCat && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {variantes.map((x) => {
              const livre = x.qtd - (ocupado[`${x.produto.id}|${x.tam}`] || 0);
              return (
                <div key={`${x.produto.id}-${x.tam}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{x.produto.nome} <span style={{ color: C.textSub }}>({x.tam})</span></span>
                  <Chip color={livre > 0 ? 'var(--status-green-fg)' : 'var(--status-orange-fg)'}>{livre > 0 ? `${livre} livre` : 'Reservado'}</Chip>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Anuario({ produtos, trans }) {
  const [modo, setModo] = useState('agenda');
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(iso(new Date()));
  const [cap, setCap] = useState(50);

  const eventos = useMemo(() => buildEventos(produtos, trans), [produtos, trans]);

  const nav = (dir) => {
    const c = new Date(cursor);
    if (modo === 'mes') c.setMonth(c.getMonth() + dir);
    else if (modo === 'semana') c.setDate(c.getDate() + dir * 7);
    else c.setDate(c.getDate() + dir);
    setCursor(c);
    if (modo === 'dia') setSelected(iso(c));
  };

  const irParaHoje = () => { const t = new Date(); setCursor(t); setSelected(iso(t)); };
  const irParaDia = (dstr) => { setSelected(dstr); setCursor(parse(dstr)); setModo('dia'); };

  const titulo = modo === 'mes'
    ? `${MESES[cursor.getMonth()]} ${cursor.getFullYear()}`
    : modo === 'semana'
      ? `Semana de ${fmtDate(iso(startOfWeek(cursor)))}`
      : modo === 'dia'
        ? fmtDate(selected)
        : 'Todos os fins de semana';

  const resumoMes = useMemo(() => {
    if (modo !== 'mes') return null;
    const y = cursor.getFullYear(), m = cursor.getMonth();
    let totalSaidas = 0, pico = 0, diasCheios = 0;
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(y, m, d);
      if (dt.getMonth() !== m) break;
      const { nSaidas } = aggDia(eventos, iso(dt));
      totalSaidas += nSaidas;
      pico = Math.max(pico, nSaidas);
      if (nSaidas > cap) diasCheios++;
    }
    return { totalSaidas, pico, diasCheios };
  }, [modo, cursor, eventos, cap]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {modo !== 'agenda' && (
              <>
                <button onClick={() => nav(-1)} style={navBtn}>‹</button>
                <button onClick={() => nav(1)} style={navBtn}>›</button>
                <button onClick={irParaHoje} style={{ ...navBtn, width: 'auto', padding: '6px 12px', fontSize: 11 }}>Hoje</button>
              </>
            )}
            <Heading size={15}>{titulo}</Heading>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 10, color: C.textSub, fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              CAPACIDADE/DIA
              <input type="number" min={1} value={cap}
                onChange={(e) => setCap(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 56, padding: '5px 7px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            </label>
            <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px' }} />
            {[['agenda', 'Agenda'], ['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']].map(([k, l]) => (
              <button key={k} onClick={() => { setModo(k); if (k === 'dia') setCursor(parse(selected)); }} style={{
                padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                background: modo === k ? C.gold : 'transparent', color: modo === k ? C.accentInk : C.textSub,
                border: modo === k ? 'none' : `1px solid ${C.border}`,
              }}>{l}</button>
            ))}
          </div>
        </div>
        {resumoMes && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textSub, flexWrap: 'wrap' }}>
            <span><strong style={{ color: C.text }}>{resumoMes.totalSaidas}</strong> peças saem no mês</span>
            <span>pico de <strong style={{ color: resumoMes.pico > cap ? 'var(--status-red-fg)' : C.gold }}>{resumoMes.pico}</strong> num único dia</span>
            <span><strong style={{ color: resumoMes.diasCheios ? 'var(--status-red-fg)' : 'var(--status-green-fg)' }}>{resumoMes.diasCheios}</strong> dia(s) acima da capacidade</span>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        {modo === 'agenda' && <AgendaView eventos={eventos} cap={cap} onSelectDay={irParaDia} />}
        {modo === 'mes' && <MonthView cursor={cursor} eventos={eventos} cap={cap} selected={selected} onSelect={setSelected} />}
        {modo === 'semana' && <WeekView cursor={cursor} eventos={eventos} cap={cap} selected={selected} onSelect={setSelected} />}
        {modo === 'dia' && <DayView dstr={selected} produtos={produtos} eventos={eventos} cap={cap} />}
      </Card>

      {(modo === 'mes' || modo === 'semana') && (
        <Card>
          <SectionTitle>DETALHES DE {fmtDate(selected).toUpperCase()}</SectionTitle>
          <DayView dstr={selected} produtos={produtos} eventos={eventos} cap={cap} />
        </Card>
      )}
    </div>
  );
}
