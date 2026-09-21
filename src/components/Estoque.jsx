import { useState, useRef, useMemo } from 'react';
import { C, MONO, STATUS_MAP, fmt, CATEGORIAS, COLECOES, TECIDOS, LINHAS, TAM_OPTIONS } from '../constants';
import { statusProduto, statusVariante, contagemProduto, contagemVariante } from '../logic';
import { Badge, Card, SectionTitle, Heading, TH, TD, Inp, Sel, BtnGold, BtnOut, Chip, Drawer, IconBtn, Stat } from './UI';

let _produtoId = 11;

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='640' viewBox='0 0 480 640'%3E%3Crect width='480' height='640' fill='%23ccc'/%3E%3C/svg%3E";

// ── Barra de composição do estoque agregada ────────────────────
function StockBreakdown({ counts }) {
  const { total, alugado, ajuste, disponivel } = counts;
  const pct = (n) => total > 0 ? (n / total) * 100 : 0;
  return (
    <div>
      <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', background: C.borderSoft, marginBottom: 7, gap: total > 0 ? 1 : 0 }}>
        <div style={{ width: `${pct(disponivel)}%`, background: 'var(--status-green-fg)' }} />
        <div style={{ width: `${pct(alugado)}%`, background: 'var(--status-orange-fg)' }} />
        <div style={{ width: `${pct(ajuste)}%`, background: 'var(--status-yellow-fg)' }} />
      </div>
      <div style={{ display: 'flex', gap: 11, fontSize: 10.5, color: C.textSub, flexWrap: 'wrap' }}>
        <span>Total <b style={{ color: C.text }}>{total}</b></span>
        <span style={{ color: 'var(--status-green-fg)' }}>Livres <b>{disponivel}</b></span>
        <span style={{ color: 'var(--status-orange-fg)' }}>Alugadas <b>{alugado}</b></span>
        <span style={{ color: 'var(--status-yellow-fg)' }}>Ajuste <b>{ajuste}</b></span>
      </div>
    </div>
  );
}

// ── Upload de imagem ───────────────────────────────────────────
function ImageUpload({ value, onChange }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div onClick={() => fileRef.current.click()} title="Clique para trocar a foto" style={{
        width: 96, height: 128, borderRadius: 10, overflow: 'hidden',
        border: `1px dashed ${value ? C.gold : C.border}`, cursor: 'pointer', flexShrink: 0,
      }}>
        <img src={value || PLACEHOLDER} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <button type="button" onClick={() => fileRef.current.click()} style={{
        padding: '5px 10px', background: 'transparent', fontFamily: C.fontSans,
        color: C.goldText, border: `1px solid ${C.goldDim}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', width: '100%',
      }}>Escolher foto</button>
      {value && (
        <button type="button" onClick={() => onChange('')} style={{
          padding: '4px 10px', background: 'transparent', fontFamily: C.fontSans,
          color: C.textSub, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 10, cursor: 'pointer', width: '100%',
        }}>Remover</button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

// ── Editor de grade de tamanhos (usado no Drawer) ──────────────
function GradeEditor({ variantes, setVariantes }) {
  const [novoTam, setNovoTam] = useState('');

  const addTam = () => {
    if (!novoTam || variantes.some((v) => v.tam === novoTam)) return;
    setVariantes((prev) => [...prev, { tam: novoTam, qtd: 0 }]);
    setNovoTam('');
  };
  const setQtd = (tam, qtd) => setVariantes((prev) => prev.map((v) => v.tam === tam ? { ...v, qtd: Math.max(0, qtd) } : v));
  const removeTam = (tam) => setVariantes((prev) => prev.filter((v) => v.tam !== tam));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {variantes.map((v) => (
          <div key={v.tam} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: C.bgElevated, border: `1px solid ${C.borderSoft}`, borderRadius: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 48 }}>{v.tam}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => setQtd(v.tam, v.qtd - 1)} style={stepperBtn}>−</button>
              <input type="number" value={v.qtd} onChange={(e) => setQtd(v.tam, Number(e.target.value) || 0)} style={{
                width: 48, textAlign: 'center', padding: '5px 4px', background: C.inputBg,
                border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: C.fontSans,
              }} />
              <button type="button" onClick={() => setQtd(v.tam, v.qtd + 1)} style={stepperBtn}>+</button>
              <button type="button" onClick={() => removeTam(v.tam)} style={{ ...stepperBtn, color: 'var(--status-red-fg)', marginLeft: 6 }}>✕</button>
            </div>
          </div>
        ))}
        {variantes.length === 0 && <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Nenhum tamanho cadastrado ainda.</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Sel label="Adicionar tamanho à grade" value={novoTam} onChange={(e) => setNovoTam(e.target.value)}
            options={[...TAM_OPTIONS, 'Único'].filter((t) => !variantes.some((v) => v.tam === t))} />
        </div>
        <div style={{ marginBottom: 13 }}><BtnOut onClick={addTam}>+ Adicionar</BtnOut></div>
      </div>
    </div>
  );
}
const stepperBtn = {
  width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent',
  color: C.text, cursor: 'pointer', fontSize: 14, fontFamily: C.fontSans, lineHeight: 1,
};

// ── Drawer: detalhe + edição sob demanda ───────────────────────
function ProdutoDrawer({ produto, trans, ajustes, onClose, onSave, onDelete }) {
  const isNew = !produto?.id;
  const [f, setF] = useState({
    nome: produto?.nome || '', categoria: produto?.categoria || 'Terno', colecao: produto?.colecao || COLECOES[0],
    tecido: produto?.tecido || TECIDOS[0], cor: produto?.cor || '', linha: produto?.linha || 'Padronizada',
    aluguel: String(produto?.aluguel ?? ''), venda: String(produto?.venda ?? ''), foto: produto?.foto || '',
  });
  const [variantes, setVariantes] = useState(produto?.variantes ? produto.variantes.map((v) => ({ ...v })) : []);
  const [editando, setEditando] = useState(isNew);

  const counts = produto ? contagemProduto(produto, trans, ajustes) : null;

  const salvar = () => {
    if (!f.nome || !f.cor) return;
    onSave({
      ...(produto || {}),
      ...f, aluguel: Number(f.aluguel) || 0, venda: Number(f.venda) || 0, variantes,
    });
    if (!isNew) setEditando(false); else onClose();
  };

  return (
    <Drawer
      title={isNew ? 'Cadastrar Novo Modelo' : produto.nome}
      subtitle={isNew ? 'Módulo 1 — cadastro e catálogo' : `${produto.categoria} · ${produto.colecao}`}
      onClose={onClose}
    >
      {!editando && !isNew && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <img src={produto.foto || PLACEHOLDER} alt={produto.nome} style={{ width: 92, height: 122, objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.border}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <Chip color={produto.linha === 'Premium' ? C.gold : 'var(--status-grey-fg)'}>{produto.linha}</Chip>
                <Badge label={statusProduto(produto, trans, ajustes)} map={STATUS_MAP} />
              </div>
              <p style={{ margin: '0 0 3px', fontSize: 13, color: C.textSub }}>{produto.cor} · {produto.tecido}</p>
              <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: C.textSub, fontWeight: 700, letterSpacing: '0.06em' }}>ALUGUEL</p>
                  <p style={{ margin: 0, fontSize: 15, color: C.goldText, fontWeight: 700 }}>R$ {fmt(produto.aluguel)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: C.textSub, fontWeight: 700, letterSpacing: '0.06em' }}>VENDA</p>
                  <p style={{ margin: 0, fontSize: 15, color: C.goldText, fontWeight: 700 }}>R$ {fmt(produto.venda)}</p>
                </div>
              </div>
            </div>
          </div>

          <StockBreakdown counts={counts} />

          <SectionTitle style={{ margin: '22px 0 12px' }}>GRADE DE TAMANHOS — ESTOQUE EM TEMPO REAL</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {produto.variantes.map((v) => {
              const c = contagemVariante(produto, v.tam, trans, ajustes);
              const st = statusVariante(produto, v.tam, trans, ajustes);
              return (
                <div key={v.tam} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 13px', background: C.bgElevated, border: `1px solid ${C.borderSoft}`, borderRadius: 9,
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text, minWidth: 44 }}>{v.tam}</span>
                  <span style={{ fontSize: 12, color: C.textSub, flex: 1, textAlign: 'center' }}>
                    <b style={{ color: C.text }}>{c.total}</b> total · <b style={{ color: 'var(--status-green-fg)' }}>{c.disponivel}</b> livre · <b style={{ color: 'var(--status-orange-fg)' }}>{c.alugado}</b> alugada{c.ajuste > 0 && <> · <b style={{ color: 'var(--status-yellow-fg)' }}>{c.ajuste}</b> ajuste</>}
                  </span>
                  <Badge label={st} map={STATUS_MAP} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <BtnGold onClick={() => setEditando(true)}>Editar Modelo</BtnGold>
            <BtnOut color="var(--status-red-fg)" onClick={() => onDelete(produto.id)}>Excluir</BtnOut>
          </div>
        </div>
      )}

      {(editando || isNew) && (
        <div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 6, alignItems: 'flex-start' }}>
            <ImageUpload value={f.foto} onChange={(v) => setF((x) => ({ ...x, foto: v }))} />
            <div style={{ flex: 1 }}>
              <Inp label="Modelo / Nome" value={f.nome} onChange={e => setF(x => ({ ...x, nome: e.target.value }))} placeholder="Ex: Terno Oxford Slim" />
              <Inp label="Cor" value={f.cor} onChange={e => setF(x => ({ ...x, cor: e.target.value }))} placeholder="Ex: Azul Marinho" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <Sel label="Categoria" value={f.categoria} onChange={e => setF(x => ({ ...x, categoria: e.target.value }))} options={CATEGORIAS} />
            <Sel label="Linha" value={f.linha} onChange={e => setF(x => ({ ...x, linha: e.target.value }))} options={LINHAS} />
            <Sel label="Coleção" value={f.colecao} onChange={e => setF(x => ({ ...x, colecao: e.target.value }))} options={COLECOES} />
            <Sel label="Tipo de Tecido" value={f.tecido} onChange={e => setF(x => ({ ...x, tecido: e.target.value }))} options={TECIDOS} />
            <Inp label="Valor Aluguel (R$)" type="number" value={f.aluguel} onChange={e => setF(x => ({ ...x, aluguel: e.target.value }))} placeholder="0,00" />
            <Inp label="Valor Venda (R$)" type="number" value={f.venda} onChange={e => setF(x => ({ ...x, venda: e.target.value }))} placeholder="0,00" />
          </div>

          <SectionTitle style={{ margin: '18px 0 10px' }}>GRADE DE TAMANHOS DO MODELO</SectionTitle>
          <p style={{ fontSize: 11.5, color: C.textMuted, margin: '0 0 12px', lineHeight: 1.5 }}>
            Cada tamanho é uma variante deste mesmo modelo — não crie um cadastro novo por tamanho, apenas ajuste a quantidade de cada linha da grade.
          </p>
          <GradeEditor variantes={variantes} setVariantes={setVariantes} />

          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <BtnGold onClick={salvar}>{isNew ? 'Cadastrar Modelo' : 'Salvar Alterações'}</BtnGold>
            <BtnOut onClick={() => isNew ? onClose() : setEditando(false)}>Cancelar</BtnOut>
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ── Card do modelo (visão de consulta, enxuta) ─────────────────
function ProdutoCard({ produto, trans, ajustes, onOpen }) {
  const status = statusProduto(produto, trans, ajustes);
  const counts = contagemProduto(produto, trans, ajustes);
  const s = STATUS_MAP[status];
  return (
    <div
      onClick={() => onOpen(produto)}
      className="apollo-anim-in"
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, overflow: 'hidden',
        cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = C.shadow; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ height: 216, overflow: 'hidden', position: 'relative' }}>
        <img src={produto.foto || PLACEHOLDER} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = PLACEHOLDER; }} />
        <span style={{
          position: 'absolute', top: 11, right: 11, fontSize: 10, fontWeight: 600, ...MONO,
          padding: '3px 9px', borderRadius: 4, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>{status}</span>
        <span style={{
          position: 'absolute', top: 11, left: 11, fontSize: 9, fontWeight: 600, ...MONO,
          padding: '3px 8px', borderRadius: 4, background: 'rgba(18,15,10,0.74)', color: C.paper, letterSpacing: '0.1em',
        }}>{produto.linha.toUpperCase()}</span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <Heading size={14.5} style={{ marginBottom: 2, lineHeight: 1.3 }}>{produto.nome}</Heading>
        <p style={{ fontSize: 11.5, color: C.textSub, margin: '2px 0 3px' }}>{produto.categoria} · {produto.cor}</p>
        <p style={{ fontSize: 10.5, color: C.textMuted, margin: '0 0 12px' }}>{produto.colecao} · {produto.tecido}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 13 }}>
          <div>
            <p style={{ fontSize: 9, color: C.textSub, margin: '0 0 3px', fontWeight: 600, letterSpacing: '0.12em', ...MONO }}>ALUGUEL</p>
            <p style={{ fontSize: 13.5, color: C.goldText, fontWeight: 500, margin: 0, ...MONO }}>R$ {fmt(produto.aluguel)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, color: C.textSub, margin: '0 0 3px', fontWeight: 600, letterSpacing: '0.12em', ...MONO }}>VENDA</p>
            <p style={{ fontSize: 13.5, color: C.goldText, fontWeight: 500, margin: 0, ...MONO }}>R$ {fmt(produto.venda)}</p>
          </div>
        </div>

        <StockBreakdown counts={counts} />

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
          {produto.variantes.map((v) => {
            const st = statusVariante(produto, v.tam, trans, ajustes);
            const sc = STATUS_MAP[st];
            return (
              <span key={v.tam} title={`${v.tam}: ${st}`} style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
              }}>{v.tam}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Linha de tabela (visão alternativa) ────────────────────────
function ProdutoRow({ produto, trans, ajustes, onOpen }) {
  const status = statusProduto(produto, trans, ajustes);
  const counts = contagemProduto(produto, trans, ajustes);
  return (
    <tr onClick={() => onOpen(produto)} style={{ cursor: 'pointer' }}
      onMouseEnter={(e) => e.currentTarget.style.background = C.bgElevated}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <TD style={{ width: 52 }}>
        <div style={{ width: 40, height: 52, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <img src={produto.foto || PLACEHOLDER} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = PLACEHOLDER; }} />
        </div>
      </TD>
      <TD><span style={{ color: C.text, fontWeight: 600 }}>{produto.nome}</span></TD>
      <TD><span style={{ color: C.textSub, fontSize: 12 }}>{produto.colecao} · {produto.tecido}</span></TD>
      <TD><span style={{ color: C.textSub }}>{produto.cor}</span></TD>
      <TD><Chip color={produto.linha === 'Premium' ? C.gold : 'var(--status-grey-fg)'}>{produto.linha}</Chip></TD>
      <TD>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 180 }}>
          {produto.variantes.map((v) => (
            <span key={v.tam} style={{ fontSize: 10.5, color: C.textSub }}>{v.tam}:{v.qtd}</span>
          ))}
        </div>
      </TD>
      <TD><span style={{ color: C.goldText }}>R$ {fmt(produto.aluguel)}</span></TD>
      <TD style={{ minWidth: 170 }}>
        <span style={{ fontSize: 12 }}>
          <b style={{ color: C.text }}>{counts.total}</b> · <b style={{ color: 'var(--status-green-fg)' }}>{counts.disponivel}</b> · <b style={{ color: 'var(--status-orange-fg)' }}>{counts.alugado}</b> · <b style={{ color: 'var(--status-yellow-fg)' }}>{counts.ajuste}</b>
        </span>
      </TD>
      <TD><Badge label={status} map={STATUS_MAP} /></TD>
    </tr>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function Estoque({ produtos, setProdutos, trans, ajustes }) {
  const [drawer, setDrawer] = useState(null); // null | 'new' | produto
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroColecao, setFiltroColecao] = useState('Todas');
  const [busca, setBusca] = useState('');
  const [view, setView] = useState('cards');

  const rows = useMemo(() => produtos.map((p) => ({ p, status: statusProduto(p, trans, ajustes) })), [produtos, trans, ajustes]);

  const visible = rows
    .filter((r) => filtroStatus === 'Todos' || r.status === filtroStatus)
    .filter((r) => filtroCat === 'Todas' || r.p.categoria === filtroCat)
    .filter((r) => filtroColecao === 'Todas' || r.p.colecao === filtroColecao)
    .filter((r) => !busca || r.p.nome.toLowerCase().includes(busca.toLowerCase()) || r.p.cor.toLowerCase().includes(busca.toLowerCase()));

  const totalGeral = produtos.reduce((s, p) => s + contagemProduto(p, trans, ajustes).total, 0);
  const totalLivre = produtos.reduce((s, p) => s + contagemProduto(p, trans, ajustes).disponivel, 0);
  const totalAlug  = produtos.reduce((s, p) => s + contagemProduto(p, trans, ajustes).alugado, 0);
  const totalAjust = produtos.reduce((s, p) => s + contagemProduto(p, trans, ajustes).ajuste, 0);

  const salvar = (dados) => {
    if (dados.id) {
      setProdutos((prev) => prev.map((p) => p.id === dados.id ? { ...p, ...dados } : p));
    } else {
      setProdutos((prev) => [...prev, { id: _produtoId++, ...dados }]);
    }
    setDrawer(null);
  };

  const excluir = (id) => {
    if (window.confirm('Excluir este modelo e toda a sua grade de tamanhos?')) {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setDrawer(null);
    }
  };

  return (
    <div>
      {/* Painel de estoque dinâmico (Módulo 4) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total em estoque', val: totalGeral, color: C.text },
          { label: 'Disponível',       val: totalLivre, color: 'var(--status-green-fg)' },
          { label: 'Alugado',          val: totalAlug,  color: 'var(--status-orange-fg)' },
          { label: 'Em ajuste',        val: totalAjust, color: 'var(--status-yellow-fg)' },
        ].map((m) => <Stat key={m.label} label={m.label} value={m.val} color={m.color} />)}
      </div>

      {/* Toolbar de filtros ágeis */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar modelo ou cor..."
            style={{
              padding: '7px 13px', borderRadius: C.radiusSm, fontSize: 12, fontFamily: C.fontSans,
              background: C.inputBg, color: C.text, border: `1px solid ${C.border}`, outline: 'none', minWidth: 180,
            }}
          />
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={pillSelect}>
            <option value="Todos">Todos status</option>
            {['Disponível', 'Alugado', 'Em Ajuste', 'Indisponível', 'Misto'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} style={pillSelect}>
            <option value="Todas">Todas categorias</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtroColecao} onChange={(e) => setFiltroColecao(e.target.value)} style={pillSelect}>
            <option value="Todas">Todas coleções</option>
            {COLECOES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden' }}>
            <IconBtn active={view === 'cards'} onClick={() => setView('cards')} title="Ver em cards">⊞</IconBtn>
            <IconBtn active={view === 'table'} onClick={() => setView('table')} title="Ver em tabela">≡</IconBtn>
          </div>
          <BtnGold onClick={() => setDrawer('new')}>+ Novo Modelo</BtnGold>
        </div>
      </div>

      {visible.length === 0 && (
        <Card><p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>Nenhum modelo encontrado para este filtro.</p></Card>
      )}

      {visible.length > 0 && view === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
          {visible.map(({ p }) => <ProdutoCard key={p.id} produto={p} trans={trans} ajustes={ajustes} onOpen={setDrawer} />)}
        </div>
      )}

      {visible.length > 0 && view === 'table' && (
        <Card style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgElevated }}>
                <TH></TH><TH>Modelo</TH><TH>Coleção / Tecido</TH><TH>Cor</TH><TH>Linha</TH><TH>Grade</TH><TH>Aluguel</TH><TH>Estoque (total·livre·alugado·ajuste)</TH><TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ p }) => <ProdutoRow key={p.id} produto={p} trans={trans} ajustes={ajustes} onOpen={setDrawer} />)}
            </tbody>
          </table>
        </Card>
      )}

      {drawer && (
        <ProdutoDrawer
          produto={drawer === 'new' ? null : drawer}
          trans={trans} ajustes={ajustes}
          onClose={() => setDrawer(null)}
          onSave={salvar}
          onDelete={excluir}
        />
      )}
    </div>
  );
}

const pillSelect = {
  padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
  background: 'var(--card)', color: 'var(--text-sub)', border: '1px solid var(--border)', cursor: 'pointer',
};
