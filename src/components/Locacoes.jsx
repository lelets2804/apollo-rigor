import { useState, useMemo } from 'react';
import { C, MONO, fmt, fmtDate, CONTRATO_MAP, PAPEIS_PADRONIZADO, PAGAMENTO_MAP, PAGAMENTO_OPCOES } from '../constants';
import {
  contagemVariante, buscarTamanhoComFlexibilidade,
  alertaPacote, integranteCompareceu, comparecimentoPacote, statusPacote,
} from '../logic';
import { Card, SectionTitle, Heading, TH, TD, Inp, Sel, BtnGold, BtnOut, Badge, Chip, Alert, Modal, Stat, TickRule } from './UI';

let _transId = 15;
let _ajusteId = 2;

const PAPEIS = PAPEIS_PADRONIZADO;

function TipoBadge({ tipo }) {
  const map = {
    venda:               { label: 'Venda',              color: 'var(--status-green-fg)' },
    locacao_avulsa:      { label: 'Locação Avulsa',      color: 'var(--status-orange-fg)' },
    locacao_padronizada: { label: 'Locação Padronizada', color: 'var(--status-blue-fg)' },
  };
  const m = map[tipo];
  return <Chip color={m.color}>{m.label}</Chip>;
}

// ── Aba: Histórico ───────────────────────────────────────────
function Historico({ produtos, trans, onAvancarContrato }) {
  const fat = trans.reduce((s, t) => s + t.valor, 0);
  return (
    <div>
      <Card accent style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: C.textSub, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', ...MONO, textTransform: 'uppercase' }}>Faturamento total · vendas + locações</p>
        <p style={{ margin: 0, color: C.goldText, fontSize: 28, fontWeight: 500, ...MONO, lineHeight: 1 }}>R$ {fmt(fat)}</p>
      </Card>
      <Card style={{ padding: '14px 20px', overflow: 'auto' }}>
        {trans.length === 0 ? <p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>Nenhuma transação registrada.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <TH>Cliente / Evento</TH><TH>Tipo</TH><TH>Item(ns)</TH><TH>Retirada</TH><TH>Devolução</TH><TH>Valor</TH><TH>Contrato</TH><TH></TH>
              </tr>
            </thead>
            <tbody>
              {[...trans].reverse().map((t) => {
                const itens = t.tipo === 'locacao_padronizada'
                  ? (t.integrantes || []).map((i) => produtos.find((p) => p.id === i.produtoId)?.nome).filter(Boolean).join(', ')
                  : produtos.find((p) => p.id === t.produtoId)?.nome || '—';
                const precisaContrato = t.tipo !== 'venda';
                return (
                  <tr key={t.id}>
                    <TD>
                      <span style={{ color: C.text, fontWeight: 500 }}>{t.cliente}</span>
                      {t.tipo === 'locacao_padronizada' && <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>{t.noivos} · evento {fmtDate(t.dataEvento)}</p>}
                    </TD>
                    <TD><TipoBadge tipo={t.tipo} /></TD>
                    <TD><span style={{ color: C.textSub, fontSize: 12 }}>{itens}</span></TD>
                    <TD style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.textSub, fontSize: 11.5, ...MONO }}>{fmtDate(t.retirada)}</span></TD>
                    <TD style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.textSub, fontSize: 11.5, ...MONO }}>{fmtDate(t.devolucao)}</span></TD>
                    <TD style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.goldText, fontWeight: 500, ...MONO }}>R$ {fmt(t.valor)}</span></TD>
                    <TD>{precisaContrato ? <Badge label={t.contrato} map={CONTRATO_MAP} /> : <span style={{ color: C.textSub, fontSize: 11 }}>—</span>}</TD>
                    <TD>
                      {precisaContrato && t.contrato !== 'Confirmado' && (
                        <BtnOut color="var(--status-blue-fg)" onClick={() => onAvancarContrato(t.id)}>
                          {t.contrato === 'Rascunho' ? 'Loja assina' : 'Simular assinatura do cliente'}
                        </BtnOut>
                      )}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ── Aba: Venda Avulsa ────────────────────────────────────────
// Vende uma unidade de um tamanho específico da grade de um modelo já cadastrado no Estoque.
function VendaAvulsa({ produtos, trans, ajustes, registrarVenda }) {
  const disponiveis = useMemo(() => {
    const list = [];
    produtos.forEach((p) => (p.variantes || []).forEach((v) => {
      if (contagemVariante(p, v.tam, trans, ajustes).disponivel > 0) {
        list.push({ key: `${p.id}|${v.tam}`, produtoId: p.id, tam: v.tam, produto: p });
      }
    }));
    return list;
  }, [produtos, trans, ajustes]);

  const EMPTY = { key: '', cliente: '', tel: '', documento: '', valor: '' };
  const [f, setF] = useState(EMPTY);

  const submit = () => {
    const sel = disponiveis.find((d) => d.key === f.key);
    if (!sel || !f.cliente || !f.valor) return;
    registrarVenda({ produtoId: sel.produtoId, tam: sel.tam, cliente: f.cliente, tel: f.tel, documento: f.documento, valor: Number(f.valor) });
    setF(EMPTY);
  };

  return (
    <Card style={{ borderColor: C.goldDim }}>
      <SectionTitle>VENDA AVULSA — REGISTRO DIRETO DE VENDA DO ESTOQUE</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Sel label="Peça (disponíveis em estoque)" value={f.key}
          onChange={(e) => { const sel = disponiveis.find((d) => d.key === e.target.value); setF((x) => ({ ...x, key: e.target.value, valor: sel?.produto.venda ?? '' })); }}
          options={disponiveis.map((d) => ({ value: d.key, label: `${d.produto.nome} (${d.tam} — ${d.produto.cor})` }))} />
        <Inp label="Nome do Cliente" value={f.cliente} onChange={(e) => setF((x) => ({ ...x, cliente: e.target.value }))} placeholder="Nome completo" />
        <Inp label="Telefone" value={f.tel} onChange={(e) => setF((x) => ({ ...x, tel: e.target.value }))} placeholder="(11) 99999-9999" />
        <Inp label="Documento (CPF)" value={f.documento} onChange={(e) => setF((x) => ({ ...x, documento: e.target.value }))} placeholder="000.000.000-00" />
        <Inp label="Valor da Venda (R$)" type="number" value={f.valor} onChange={(e) => setF((x) => ({ ...x, valor: e.target.value }))} placeholder="0,00" />
      </div>
      <BtnGold onClick={submit}>Confirmar Venda</BtnGold>
    </Card>
  );
}

// ── Aba: Locação Avulsa ──────────────────────────────────────
function LocacaoAvulsa({ produtos, trans, ajustes, registrarLocacao }) {
  const EMPTY = { produtoId: '', tam: '', cliente: '', tel: '', documento: '', retirada: '', devolucao: '', valor: '' };
  const [f, setF] = useState(EMPTY);
  const [resultado, setResultado] = useState(null);

  const produtoSel = produtos.find((p) => p.id === Number(f.produtoId));
  const tamOptions = (produtoSel?.variantes || []).map((v) => v.tam);

  const verificar = () => {
    if (!produtoSel || !f.tam || !f.retirada || !f.devolucao) {
      setResultado({ erro: 'Preencha peça, tamanho e datas para checar a agenda.' });
      return;
    }
    const r = buscarTamanhoComFlexibilidade(produtoSel, f.tam, f.retirada, f.devolucao, trans, ajustes);
    if (!r.disponivel) {
      setResultado({ erro: `Indisponibilidade: "${produtoSel.nome}" (${produtoSel.cor}) tamanho ${f.tam} está esgotado para o período de ${fmtDate(f.retirada)} a ${fmtDate(f.devolucao)}, mesmo considerando tamanhos maiores.` });
      return;
    }
    setResultado(r);
  };

  const confirmar = () => {
    if (!resultado?.disponivel || !f.cliente || !f.valor) return;
    registrarLocacao({
      produtoId: produtoSel.id, tamPedido: f.tam, tamEntregue: resultado.tam, precisaAjuste: resultado.precisaAjuste,
      cliente: f.cliente, tel: f.tel, documento: f.documento,
      retirada: f.retirada, devolucao: f.devolucao, valor: Number(f.valor),
    });
    setF(EMPTY); setResultado(null);
  };

  return (
    <Card style={{ borderColor: C.goldDim }}>
      <SectionTitle>LOCAÇÃO AVULSA — ALUGUEL INDIVIDUAL DE PEÇA</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Sel label="Peça (modelo + cor)" value={f.produtoId}
          onChange={(e) => { const p = produtos.find((x) => x.id === Number(e.target.value)); setF((x) => ({ ...x, produtoId: e.target.value, tam: '', valor: p?.aluguel ?? '' })); setResultado(null); }}
          options={produtos.map((p) => ({ value: p.id, label: `${p.nome} — ${p.cor}` }))} />
        <Sel label="Tamanho desejado" value={f.tam} onChange={(e) => { setF((x) => ({ ...x, tam: e.target.value })); setResultado(null); }} options={tamOptions} />
        <Inp label="Data de Retirada" type="date" value={f.retirada} onChange={(e) => { setF((x) => ({ ...x, retirada: e.target.value })); setResultado(null); }} />
        <Inp label="Data Prevista de Devolução" type="date" value={f.devolucao} onChange={(e) => { setF((x) => ({ ...x, devolucao: e.target.value })); setResultado(null); }} />
        <Inp label="Nome do Cliente" value={f.cliente} onChange={(e) => setF((x) => ({ ...x, cliente: e.target.value }))} placeholder="Nome completo" />
        <Inp label="Telefone" value={f.tel} onChange={(e) => setF((x) => ({ ...x, tel: e.target.value }))} placeholder="(11) 99999-9999" />
        <Inp label="Documento (CPF)" value={f.documento} onChange={(e) => setF((x) => ({ ...x, documento: e.target.value }))} placeholder="000.000.000-00" />
        <Inp label="Valor do Aluguel (R$)" type="number" value={f.valor} onChange={(e) => setF((x) => ({ ...x, valor: e.target.value }))} placeholder="0,00" />
      </div>

      {resultado?.erro && <Alert tone="error">{resultado.erro}</Alert>}
      {resultado?.disponivel && resultado.precisaAjuste && (
        <Alert tone="warn">
          Tamanho {f.tam} esgotado. Encontramos disponibilidade no tamanho {resultado.tam}. A peça será liberada para locação e encaminhada automaticamente ao Ateliê para ajuste.
        </Alert>
      )}
      {resultado?.disponivel && !resultado.precisaAjuste && (
        <Alert tone="success">Disponibilidade confirmada na agenda do Anuário para o período selecionado.</Alert>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!resultado?.disponivel && <BtnGold onClick={verificar}>Checar Disponibilidade (Anuário)</BtnGold>}
        {resultado?.disponivel && <BtnGold onClick={confirmar}>Gerar Contrato de Locação</BtnGold>}
        {resultado && <BtnOut onClick={() => setResultado(null)}>Refazer verificação</BtnOut>}
      </div>
    </Card>
  );
}

// ── Aba: Locação Padronizada ─────────────────────────────────
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// agrupa integrantes por peça+papel (usado nos módulos de Estoque/Ateliê); reutiliza produtoId do integrante
function categoriasDoGrupo(integrantes, produtos) {
  const seen = new Set();
  const list = [];
  integrantes.forEach((i) => {
    if (seen.has(i.papel)) return;
    seen.add(i.papel);
    const produto = produtos.find((p) => p.id === i.produtoId);
    list.push({ papel: i.papel, produto, preco: i.precoNegociado ?? produto?.aluguel ?? 0 });
  });
  return list;
}

// ── Aba: Novo Pacote (form de criação, aberto dentro de um modal) ───────
function LocacaoPadronizada({ produtos, trans, ajustes, registrarPadronizada }) {
  const EMPTY_HEAD = { noivos: '', dataEvento: '', limiteComparecimento: '', cliente: '', tel: '' };
  const EMPTY_INT   = { nome: '', documento: '', papel: 'Padrinho', produtoId: '', tam: '' };
  const [head, setHead] = useState(EMPTY_HEAD);
  const [integrantes, setIntegrantes] = useState([]);
  const [novo, setNovo] = useState(EMPTY_INT);
  const [resultado, setResultado] = useState(null);

  const produtoNovoSel = produtos.find((p) => p.id === Number(novo.produtoId));
  const tamOptionsNovo = (produtoNovoSel?.variantes || []).map((v) => v.tam);

  const addIntegrante = () => {
    if (!novo.nome || !novo.produtoId || !novo.tam) return;
    setIntegrantes((prev) => [...prev, { ...novo, produtoId: Number(novo.produtoId) }]);
    setNovo(EMPTY_INT);
    setResultado(null);
  };

  const removeIntegrante = (idx) => {
    setIntegrantes((prev) => prev.filter((_, i) => i !== idx));
    setResultado(null);
  };

  const verificar = () => {
    if (!head.noivos || !head.dataEvento || !head.limiteComparecimento || integrantes.length === 0) {
      setResultado({ erro: 'Preencha os dados do evento, o limite para comparecimento e adicione ao menos um integrante.' });
      return;
    }
    const retirada = head.dataEvento;
    const devolucao = addDays(head.dataEvento, 3);
    const checagens = integrantes.map((i) => {
      const produto = produtos.find((p) => p.id === i.produtoId);
      const r = buscarTamanhoComFlexibilidade(produto, i.tam, retirada, devolucao, trans, ajustes);
      return { integrante: i, produto, ...r };
    });
    const indisponiveis = checagens.filter((c) => !c.disponivel);
    if (indisponiveis.length > 0) {
      setResultado({ erro: `Indisponibilidade: ${indisponiveis.map((c) => `${c.integrante.nome} (${c.produto.nome} tam. ${c.integrante.tam})`).join('; ')}.` });
      return;
    }
    const valorTotal = checagens.reduce((s, c) => s + (c.produto.aluguel || 0), 0);
    setResultado({ disponivel: true, checagens, valorTotal, retirada, devolucao });
  };

  const confirmar = () => {
    if (!resultado?.disponivel) return;
    registrarPadronizada({
      ...head,
      cliente: head.cliente || head.noivos,
      valor: resultado.valorTotal,
      retirada: resultado.retirada,
      devolucao: resultado.devolucao,
      dataFechamento: new Date().toISOString().slice(0, 10),
      integrantes: resultado.checagens.map((c) => ({
        nome: c.integrante.nome, documento: c.integrante.documento, papel: c.integrante.papel,
        produtoId: c.produto.id, tam: c.integrante.tam, tamEntregue: c.tam, precisaAjuste: c.precisaAjuste,
        numeroContrato: '', precoNegociado: c.produto.aluguel, excecaoPreco: '', pagamento: 'Pendente',
        devolvido: false, avarias: '',
      })),
    });
    setHead(EMPTY_HEAD); setIntegrantes([]); setResultado(null);
  };

  return (
    <div>
      <SectionTitle>NOVO PACOTE — NOIVOS, PADRINHOS, PAIS E PAJENS</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Inp label="Nome dos Noivos" value={head.noivos} onChange={(e) => { setHead((x) => ({ ...x, noivos: e.target.value })); setResultado(null); }} placeholder="Ex: Marcos Silva & Ana Andrade" />
        <Inp label="Data do Evento" type="date" value={head.dataEvento} onChange={(e) => { setHead((x) => ({ ...x, dataEvento: e.target.value })); setResultado(null); }} />
        <Inp label="Limite para Comparecimento" type="date" value={head.limiteComparecimento} onChange={(e) => { setHead((x) => ({ ...x, limiteComparecimento: e.target.value })); setResultado(null); }} />
        <Inp label="Contato responsável" value={head.cliente} onChange={(e) => setHead((x) => ({ ...x, cliente: e.target.value }))} placeholder="Nome do cerimonial / responsável" />
        <Inp label="Telefone" value={head.tel} onChange={(e) => setHead((x) => ({ ...x, tel: e.target.value }))} placeholder="(11) 99999-9999" />
      </div>

      <div style={{ margin: '18px 0 10px', padding: 14, background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <p style={{ fontSize: 10, color: C.goldText, fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 10px' }}>ADICIONAR PESSOA AUTORIZADA A RETIRAR O TRAJE</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr 0.6fr auto', gap: '0 10px', alignItems: 'end' }}>
          <Inp label="Nome completo" value={novo.nome} onChange={(e) => setNovo((x) => ({ ...x, nome: e.target.value }))} placeholder="Nome" />
          <Inp label="Documento" value={novo.documento} onChange={(e) => setNovo((x) => ({ ...x, documento: e.target.value }))} placeholder="CPF" />
          <Sel label="Papel" value={novo.papel} onChange={(e) => setNovo((x) => ({ ...x, papel: e.target.value }))} options={PAPEIS} />
          <Sel label="Traje (padronização)" value={novo.produtoId} onChange={(e) => setNovo((x) => ({ ...x, produtoId: e.target.value, tam: '' }))} options={produtos.map((p) => ({ value: p.id, label: `${p.nome} — ${p.cor}` }))} />
          <Sel label="Tam." value={novo.tam} onChange={(e) => setNovo((x) => ({ ...x, tam: e.target.value }))} options={tamOptionsNovo} />
          <div style={{ marginBottom: 12 }}><BtnOut onClick={addIntegrante}>+ Adicionar</BtnOut></div>
        </div>
      </div>

      {integrantes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 14 }}>
          <thead><tr><TH>Nome</TH><TH>Documento</TH><TH>Papel</TH><TH>Traje</TH><TH>Tam.</TH><TH></TH></tr></thead>
          <tbody>
            {integrantes.map((i, idx) => {
              const produto = produtos.find((p) => p.id === i.produtoId);
              return (
                <tr key={idx}>
                  <TD>{i.nome}</TD><TD>{i.documento || '—'}</TD><TD>{i.papel}</TD>
                  <TD>{produto ? `${produto.nome} — ${produto.cor}` : '—'}</TD><TD>{i.tam}</TD>
                  <TD><BtnOut color="var(--status-red-fg)" onClick={() => removeIntegrante(idx)}>Remover</BtnOut></TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {resultado?.erro && <Alert tone="error">{resultado.erro}</Alert>}
      {resultado?.disponivel && (
        <Alert tone="success">
          Disponibilidade confirmada para todos os {resultado.checagens.length} trajes.
          {resultado.checagens.some((c) => c.precisaAjuste) && ' Alguns itens usarão tamanho maior e serão encaminhados ao Ateliê para ajuste.'}
          {' '}Valor total estimado: R$ {fmt(resultado.valorTotal)}.
        </Alert>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!resultado?.disponivel && <BtnGold onClick={verificar}>Checar Disponibilidade (Anuário)</BtnGold>}
        {resultado?.disponivel && <BtnGold onClick={confirmar}>Cadastrar Pacote</BtnGold>}
        {resultado && <BtnOut onClick={() => setResultado(null)}>Refazer verificação</BtnOut>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PORTAL DE PACOTES — visão geral / detalhe / edição / portal do noivo
// "Saídas por data", linhas de pacote (não cards), preço por categoria/papel,
// comparecimento vinculado a número de contrato, e um portal público
// (somente leitura) por casal com opção de traje confidencial — usando a
// mesma identidade visual (dourado + Playfair Display) do resto do sistema.
// ══════════════════════════════════════════════════════════════════════

const MESES_ABR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function fmtDataCurta(d) {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  return `${String(dt.getDate()).padStart(2, '0')} ${MESES_ABR[dt.getMonth()]}.`;
}

function navItemStyle(active) {
  return {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
    padding: '9px 12px', borderRadius: 7, cursor: 'pointer', marginBottom: 4,
    background: active ? C.goldDim : 'transparent',
    border: active ? `1px solid ${C.gold}` : '1px solid transparent',
    color: active ? C.goldText : C.textSub, fontSize: 12.5, fontWeight: active ? 700 : 500, fontFamily: 'inherit',
  };
}

// ── "Agenda da Oficina e Estoque" — Saídas por data ──────────────────
function saidasPorData(pacotes, produtos) {
  const porData = {};
  pacotes.forEach((t) => {
    if (!t.dataEvento) return;
    if (!porData[t.dataEvento]) porData[t.dataEvento] = { casamentos: new Set(), itens: {} };
    const d = porData[t.dataEvento];
    d.casamentos.add(t.id);
    (t.integrantes || []).forEach((i) => {
      const produto = produtos.find((p) => p.id === i.produtoId);
      const key = `${produto?.nome || '—'}|${i.papel}`;
      if (!d.itens[key]) d.itens[key] = { nome: produto?.nome || '—', papel: i.papel, count: 0 };
      d.itens[key].count += 1;
    });
  });
  const hoje = new Date().toISOString().slice(0, 10);
  return Object.entries(porData)
    .map(([data, v]) => ({
      data, casamentos: v.casamentos.size,
      total: Object.values(v.itens).reduce((s, x) => s + x.count, 0),
      itens: Object.values(v.itens).sort((a, b) => b.count - a.count),
    }))
    .filter((d) => d.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);
}

function SaidasPorData({ pacotes, produtos }) {
  const saidas = saidasPorData(pacotes, produtos);
  if (saidas.length === 0) return null;
  return (
    <Card style={{ borderColor: C.goldDim, marginBottom: 18 }}>
      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>AGENDA DA OFICINA E ESTOQUE</p>
      <Heading size={19} style={{ margin: '6px 0 4px' }}>Saídas por data</Heading>
      <p style={{ margin: '0 0 16px', fontSize: 11.5, color: C.textSub }}>Veja primeiro o volume do dia e, abaixo, exatamente quais roupas serão necessárias.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {saidas.map((s) => (
          <div key={s.data} style={{ background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 84 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.goldText }}>{fmtDataCurta(s.data)}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10.5, color: C.textSub }}>{s.casamentos} casamento(s)</p>
            </div>
            <div style={{ minWidth: 54, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>{s.total}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.textSub }}>roupas</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {s.itens.map((it, i2) => (
                <div key={i2} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', minWidth: 150 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{it.count} </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{it.nome}</span>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: C.textSub }}>{it.papel}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Linha de pacote na lista "Todos os pacotes" ──────────────────────
function PacoteRow({ t, onAbrir }) {
  const status = statusPacote(t);
  const { total, compareceram } = comparecimentoPacote(t);
  const pillStyle = status.nivel === 'atraso'
    ? { background: 'var(--status-red-bg)', color: 'var(--status-red-fg)', border: '1px solid var(--status-red-border)' }
    : status.nivel === 'completo'
      ? { background: 'var(--status-green-bg)', color: 'var(--status-green-fg)', border: '1px solid var(--status-green-border)' }
      : { background: 'var(--status-orange-bg)', color: 'var(--status-orange-fg)', border: '1px solid var(--status-orange-border)' };

  const metas = [
    { label: 'FECHAMENTO',           val: fmtDate(t.dataFechamento) },
    { label: 'LIMITE DOS PADRINHOS', val: fmtDate(t.limiteComparecimento) },
    { label: 'COMPARECIMENTO',       val: `${compareceram}/${total}` },
  ];

  return (
    <div onClick={() => onAbrir(t.id)} style={{
      display: 'grid',
      gridTemplateColumns: '38px minmax(150px, 1fr) 104px 132px 104px 140px 16px',
      alignItems: 'center', gap: 18, padding: '16px 6px',
      borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: C.goldDim, border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.goldText }}>AR</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.noivos}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Apollo Rigor · Evento {fmtDate(t.dataEvento)}</p>
      </div>
      {metas.map((m) => (
        <div key={m.label} style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 9.5, lineHeight: '13px', color: C.textSub, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{m.label}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, lineHeight: '17px', color: C.text, fontWeight: 600 }}>{m.val}</p>
        </div>
      ))}
      <span style={{ justifySelf: 'start', padding: '5px 11px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, lineHeight: 1.35, ...MONO, ...pillStyle }}>{status.texto}</span>
      <span style={{ color: C.textSub, fontSize: 16, justifySelf: 'end' }}>→</span>
    </div>
  );
}

// ── "⌂ Visão geral" ────────────────────────────────────────────────
function VisaoGeral({ pacotes, produtos, busca, setBusca, onAbrirPacote, onNovoPacote }) {
  const totalParticipantes = pacotes.reduce((s, t) => s + (t.integrantes || []).length, 0);
  const buscaLower = busca.trim().toLowerCase();
  const filtrados = pacotes.filter((t) => {
    if (!buscaLower) return true;
    const alvo = [t.noivos, t.cliente, ...(t.integrantes || []).map((i) => i.nome)].join(' ').toLowerCase();
    return alvo.includes(buscaLower);
  });

  return (
    <div>
      <p style={{ margin: 0, fontSize: 10, color: C.textSub, letterSpacing: '0.1em', fontWeight: 700 }}>OPERAÇÃO REAL</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '6px 0 18px', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Heading size={26}>Pacotes da Apollo Rigor</Heading>
          <p style={{ margin: '6px 0 0', fontSize: 12.5, color: C.textSub }}>Cadastre e acompanhe os pacotes, prazos, contratos e comparecimentos.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <BtnOut>Padronizações</BtnOut>
          <BtnGold onClick={onNovoPacote}>+ Cadastrar pacote</BtnGold>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Pacotes cadastrados" value={pacotes.length} color={C.gold} />
        <Stat label="Participantes" value={totalParticipantes} color={C.text} />
      </div>

      <Inp label="⌕  Buscar casal, participante, contrato ou traje" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="" />

      <SaidasPorData pacotes={pacotes} produtos={produtos} />

      {filtrados.length === 0 ? (
        <Card><p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>Nenhum pacote padronizado encontrado.</p></Card>
      ) : (
        <Card>
          {[...filtrados].reverse().map((t) => <PacoteRow key={t.id} t={t} onAbrir={onAbrirPacote} />)}
        </Card>
      )}
    </div>
  );
}

// ── Card de categoria/papel (Padronização do grupo) ──────────────────
function CategoriaCard({ papel, produto, preco, confidencial }) {
  const isNoivo = papel.toLowerCase().startsWith('noivo');
  if (confidencial && isNoivo) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.goldDim}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: C.goldText, background: C.bgElevated }}>✦</div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 9.5, color: C.goldText, fontWeight: 700, letterSpacing: '0.06em', margin: '0 0 4px' }}>{papel.toUpperCase()}</p>
          <Heading size={14}>Surpresa Do Noivo</Heading>
          <p style={{ fontSize: 10.5, color: C.textSub, margin: '4px 0 0' }}>Os detalhes foram mantidos confidenciais.</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ height: 130, overflow: 'hidden' }}>
        <img src={produto?.foto} alt={produto?.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 9.5, color: C.goldText, fontWeight: 700, letterSpacing: '0.06em', margin: '0 0 4px' }}>{papel.toUpperCase()}</p>
        <Heading size={14} style={{ marginBottom: 2 }}>{produto?.nome || '—'}</Heading>
        <p style={{ fontSize: 10.5, color: C.textSub, margin: '0 0 6px' }}>{produto?.linha}{produto?.colecao ? ` · ${produto.colecao}` : ''}</p>
        <p style={{ fontSize: 10, color: C.textSub, margin: '0 0 8px' }}>{produto?.tecido} · Cor {produto?.cor}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.goldText, margin: 0 }}>R$ {fmt(preco)}</p>
      </div>
    </div>
  );
}

// ── Linha de participante (Contratos individuais) ────────────────────
function ParticipanteRow({ integrante, produto, onEditar }) {
  const compareceu = integranteCompareceu(integrante);
  const pagInfo = PAGAMENTO_MAP[integrante.pagamento] || PAGAMENTO_MAP['Pendente'];
  const valor = integrante.excecaoPreco !== '' && integrante.excecaoPreco != null ? integrante.excecaoPreco : integrante.precoNegociado;
  return (
    <div style={{ padding: '13px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '96px 1.3fr 1fr 1fr auto', gap: 14, alignItems: 'center' }}>
        <div>
          {compareceu ? (
            <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: 6, background: C.gold, color: C.accentInk, fontWeight: 700, fontSize: 12 }}>{integrante.numeroContrato}</span>
          ) : (
            <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: 6, border: `1px dashed ${C.border}`, color: C.textSub, fontSize: 10.5 }}>Sem contrato</span>
          )}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: 13.5 }}>{integrante.nome}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>{integrante.papel}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 9.5, color: C.textSub, letterSpacing: '0.06em' }}>TRAJE</p>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C.text }}>{produto?.nome || '—'}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 9.5, color: C.textSub, letterSpacing: '0.06em' }}>VALOR A COBRAR</p>
          <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: C.goldText }}>R$ {fmt(valor)}</p>
          <p style={{ margin: '2px 0 0', fontSize: 10.5, color: pagInfo.color }}>{integrante.pagamento}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ padding: '4px 9px', borderRadius: 4, fontSize: 10, fontWeight: 600, ...MONO, border: `1px solid ${compareceu ? C.gold : C.border}`, color: compareceu ? C.goldText : C.textSub }}>
            {compareceu ? '✓ Contrato aberto' : 'Aguardando contrato'}
          </span>
          <BtnOut onClick={onEditar}>Editar</BtnOut>
        </div>
      </div>
    </div>
  );
}

// ── Modal "Atualizar [Nome]" ──────────────────────────────────────────
function EditarIntegranteModal({ integrante, onClose, onSalvar }) {
  const [f, setF] = useState({
    numeroContrato: integrante.numeroContrato || '',
    precoNegociado: integrante.precoNegociado ?? '',
    excecaoPreco: integrante.excecaoPreco === '' || integrante.excecaoPreco == null ? '' : integrante.excecaoPreco,
    pagamento: integrante.pagamento || 'Pendente',
  });

  const salvar = () => onSalvar({
    numeroContrato: f.numeroContrato,
    precoNegociado: Number(f.precoNegociado) || 0,
    excecaoPreco: f.excecaoPreco === '' ? '' : Number(f.excecaoPreco),
    pagamento: f.pagamento,
  });

  return (
    <Modal title={`Atualizar ${integrante.nome}`} onClose={onClose}>
      <p style={{ margin: '-8px 0 18px', fontSize: 12.5, color: C.textSub }}>Vincule o contrato quando a pessoa comparecer e fizer a locação.</p>

      <Inp label="Número do contrato" value={f.numeroContrato} onChange={(e) => setF((x) => ({ ...x, numeroContrato: e.target.value }))} placeholder="Ex: 1409" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Inp label="Preço negociado do pacote" type="number" value={f.precoNegociado} onChange={(e) => setF((x) => ({ ...x, precoNegociado: e.target.value }))} />
        <Inp label="Exceção de preço" type="number" value={f.excecaoPreco} onChange={(e) => setF((x) => ({ ...x, excecaoPreco: e.target.value }))} placeholder="Somente se for diferente" />
      </div>

      <Sel label="Pagamento" value={f.pagamento} onChange={(e) => setF((x) => ({ ...x, pagamento: e.target.value }))} options={PAGAMENTO_OPCOES} />

      {f.numeroContrato && !integrante.numeroContrato && (
        <Alert tone="info">Ao salvar um número de contrato, o participante será considerado comparecido automaticamente.</Alert>
      )}

      <BtnGold onClick={salvar}>Salvar atualização</BtnGold>
    </Modal>
  );
}

// ── Portal do Noivo — página pública (somente leitura) por pacote ───
function PortalNoivoPreview({ t, produtos, onClose }) {
  const integrantes = t.integrantes || [];
  const { total, compareceram, faltam } = comparecimentoPacote(t);
  const hoje = new Date().toISOString().slice(0, 10);
  const atrasado = faltam > 0 && t.limiteComparecimento && hoje > t.limiteComparecimento;
  const categorias = categoriasDoGrupo(integrantes, produtos);

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 300, overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'fixed', top: 16, right: 16, zIndex: 310, padding: '9px 16px', borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
        ✕ Fechar pré-visualização
      </button>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, border: `1px solid ${C.goldDim}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.goldText }}>AR</div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: C.textSub, letterSpacing: '0.08em' }}>PORTAL EXCLUSIVO DO CASAL</p>
            <Heading size={15}>Apollo Rigor</Heading>
          </div>
        </div>

        <Card style={{ borderColor: C.goldDim, padding: '28px 30px' }}>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>SEU PACOTE</p>
          <p style={{ margin: '8px 0 4px', fontFamily: C.fontDisplay, fontSize: 32, fontWeight: 700, color: C.text, textTransform: 'uppercase' }}>{t.noivos}</p>
          <p style={{ margin: '0 0 20px', fontSize: 12.5, color: C.textSub }}>Evento em {fmtDate(t.dataEvento)}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[{ v: total, l: 'participantes' }, { v: compareceram, l: 'já compareceram' }, { v: faltam, l: 'ainda faltam' }].map((m) => (
              <div key={m.l} style={{ background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.goldText }}>{m.v}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>{m.l}</p>
              </div>
            ))}
          </div>
        </Card>

        {atrasado && (
          <div style={{ margin: '16px 0' }}>
            <Alert tone="warn"><b>A data-limite chegou.</b> Ainda faltam {faltam} participante(s) comparecerem à loja.</Alert>
          </div>
        )}

        <Card style={{ margin: '16px 0' }}>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>ROUPAS DO CASAMENTO</p>
          <Heading size={19} style={{ margin: '6px 0 16px' }}>Padronização escolhida</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {categorias.map((c) => (
              <div key={c.papel} style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                {t.trajeConfidencial && c.papel.toLowerCase().startsWith('noivo') ? (
                  <>
                    <div style={{ height: 120, background: C.bgElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.goldText }}>✦</div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, color: C.goldText, letterSpacing: '0.06em' }}>{c.papel.toUpperCase()}</p>
                      <Heading size={14} style={{ marginTop: 4 }}>Surpresa Do Noivo</Heading>
                      <p style={{ margin: '4px 0 0', fontSize: 10.5, color: C.textSub }}>Os detalhes foram mantidos confidenciais.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ height: 120, overflow: 'hidden' }}>
                      <img src={c.produto?.foto} alt={c.produto?.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, color: C.goldText, letterSpacing: '0.06em' }}>{c.papel.toUpperCase()}</p>
                      <Heading size={14} style={{ margin: '4px 0 2px' }}>{c.produto?.nome}</Heading>
                      <p style={{ margin: 0, fontSize: 10, color: C.textSub }}>{c.produto?.linha}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>ACOMPANHAMENTO</p>
              <Heading size={19} style={{ margin: '6px 0 16px' }}>Seu grupo</Heading>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: C.textSub }}>Limite: {fmtDate(t.limiteComparecimento)}</p>
          </div>
          <div>
            {integrantes.map((i, idx) => {
              const compareceu = integranteCompareceu(i);
              const badgeLabel = compareceu ? i.numeroContrato : i.nome.split(' ')[0].slice(0, 8).toUpperCase();
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < integrantes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{
                      minWidth: 64, textAlign: 'center', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: compareceu ? C.gold : 'transparent', color: compareceu ? C.accentInk : C.textSub,
                      border: compareceu ? 'none' : `1px dashed ${C.border}`,
                    }}>{compareceu ? badgeLabel : 'Aguardando'}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.text }}>{i.nome}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>{i.papel}</p>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, ...MONO, background: compareceu ? 'var(--status-green-bg)' : 'var(--status-orange-bg)', color: compareceu ? 'var(--status-green-fg)' : 'var(--status-orange-fg)', border: `1px solid ${compareceu ? 'var(--status-green-border)' : 'var(--status-orange-border)'}` }}>
                    {compareceu ? 'Compareceu' : 'Ainda precisa ir'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.textSub, margin: '20px 0 0' }}>
          Este acesso mostra somente o pacote de {t.noivos}. Alterações devem ser solicitadas à loja.
        </p>
      </div>
    </div>
  );
}

// ── "□ Pacote selecionado" — detalhe completo de um pacote ──────────
function PacoteDetalhe({ t, produtos, trans, setTrans, ajustes, setAjustes, onVoltar }) {
  const integrantes = t.integrantes || [];
  const alerta = alertaPacote(t);
  const { total, compareceram } = comparecimentoPacote(t);
  const categorias = categoriasDoGrupo(integrantes, produtos);

  const EMPTY_ADD = { nome: '', documento: '', papel: 'Padrinho', produtoId: '', tam: '' };
  const [addAberto, setAddAberto] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [addErro, setAddErro] = useState('');
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [portalAberto, setPortalAberto] = useState(false);

  const produtoAddSel = produtos.find((p) => p.id === Number(addForm.produtoId));
  const tamOptionsAdd = (produtoAddSel?.variantes || []).map((v) => v.tam);

  const confirmarAdicao = () => {
    if (!addForm.nome || !addForm.produtoId || !addForm.tam) { setAddErro('Preencha nome, traje e tamanho.'); return; }
    const produto = produtos.find((p) => p.id === Number(addForm.produtoId));
    const r = buscarTamanhoComFlexibilidade(produto, addForm.tam, t.retirada, t.devolucao, trans, ajustes);
    if (!r.disponivel) {
      setAddErro(`"${produto.nome}" tamanho ${addForm.tam} está esgotado, mesmo considerando tamanhos maiores.`);
      return;
    }
    setTrans((prev) => prev.map((x) => x.id !== t.id ? x : {
      ...x,
      integrantes: [...(x.integrantes || []), {
        nome: addForm.nome, documento: addForm.documento, papel: addForm.papel,
        produtoId: produto.id, tam: addForm.tam, tamEntregue: r.tam,
        numeroContrato: '', precoNegociado: produto.aluguel, excecaoPreco: '', pagamento: 'Pendente',
        devolvido: false, avarias: '',
      }],
    }));
    if (r.precisaAjuste) {
      setAjustes((prev) => [...prev, {
        id: _ajusteId++, produtoId: produto.id, transId: t.id,
        desc: `Ajuste de caimento: peça retirada no tamanho ${r.tam} para atender pedido do tamanho ${addForm.tam}.`,
        tamOriginal: addForm.tam, tamEntregue: r.tam, entrega: t.retirada || '', status: 'Pendente',
      }]);
    }
    setAddForm(EMPTY_ADD); setAddAberto(false); setAddErro('');
  };

  const salvarEdicao = (idx, dados) => {
    setTrans((prev) => prev.map((x) => x.id !== t.id ? x : {
      ...x, integrantes: x.integrantes.map((i, iIdx) => iIdx === idx ? { ...i, ...dados } : i),
    }));
    setEditandoIdx(null);
  };

  const toggleTrajeConfidencial = () => {
    setTrans((prev) => prev.map((x) => x.id === t.id ? { ...x, trajeConfidencial: !x.trajeConfidencial } : x));
  };

  return (
    <div>
      <BtnOut onClick={onVoltar}>← Voltar aos pacotes</BtnOut>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0 6px', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>APOLLO RIGOR</p>
          <p style={{ margin: '4px 0 4px', fontFamily: C.fontDisplay, fontSize: 26, fontWeight: 700, color: C.text, textTransform: 'uppercase' }}>{t.noivos}</p>
          <p style={{ margin: 0, fontSize: 12.5, color: C.textSub }}>Evento em {fmtDate(t.dataEvento)}</p>
        </div>
        <BtnGold onClick={() => setAddAberto(true)}>+ Adicionar participante</BtnGold>
      </div>

      {alerta && <Alert tone="warn">{alerta.texto}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '14px 0 18px' }}>
        {[
          { label: 'Fechamento do pacote', val: fmtDate(t.dataFechamento) },
          { label: 'Data do evento', val: fmtDate(t.dataEvento) },
          { label: 'Limite para comparecimento', val: fmtDate(t.limiteComparecimento) },
          { label: 'Preços por categoria', val: `${categorias.length} definido${categorias.length !== 1 ? 's' : ''}` },
        ].map((c) => (
          <div key={c.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '12px 14px 14px' }}>
            <TickRule style={{ height: 5, marginBottom: 9 }} />
            <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: C.textSub, ...MONO, textTransform: 'uppercase' }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: C.text, ...MONO }}>{c.val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 18, alignItems: 'start' }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>PADRONIZAÇÃO DO GRUPO</p>
                <Heading size={16} style={{ marginTop: 4 }}>Roupa e preço por categoria</Heading>
              </div>
              <BtnOut>Alterar roupas e preços</BtnOut>
            </div>
            {categorias.length === 0 ? (
              <p style={{ color: C.textSub, fontSize: 13 }}>Nenhuma categoria definida ainda.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 14 }}>
                {categorias.map((c) => <CategoriaCard key={c.papel} papel={c.papel} produto={c.produto} preco={c.preco} confidencial={t.trajeConfidencial} />)}
              </div>
            )}
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>CONTRATOS INDIVIDUAIS</p>
                <Heading size={16} style={{ marginTop: 4 }}>Participantes</Heading>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{compareceram}/{total} compareceram</p>
            </div>
            {integrantes.length === 0 ? (
              <p style={{ color: C.textSub, fontSize: 13 }}>Nenhum participante neste pacote ainda.</p>
            ) : integrantes.map((i, idx) => (
              <ParticipanteRow key={idx} integrante={i} produto={produtos.find((p) => p.id === i.produtoId)} onEditar={() => setEditandoIdx(idx)} />
            ))}
          </Card>
        </div>

        <div>
          <Card style={{ borderColor: C.goldDim, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.goldText }}>ACESSO EXCLUSIVO</p>
            <Heading size={19} style={{ margin: '6px 0 8px' }}>Portal do noivo</Heading>
            <p style={{ margin: '0 0 12px', fontSize: 11.5, color: C.textSub }}>Este endereço mostra somente este pacote e seus participantes.</p>
            <div style={{ background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 10.5, color: C.goldText, wordBreak: 'break-all', marginBottom: 10 }}>
              https://portal-do-noivo.apollorigor.com.br/pacote/{t.id}
            </div>
            <BtnOut onClick={() => setPortalAberto(true)} color={C.gold}>Pré-visualizar portal do noivo</BtnOut>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.text }}>Traje confidencial</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>Oculto no acesso compartilhado</p>
              </div>
              <button onClick={toggleTrajeConfidencial} style={{
                padding: '6px 13px', borderRadius: C.radiusSm, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: t.trajeConfidencial ? C.gold : C.border, color: t.trajeConfidencial ? C.accentInk : C.textSub,
              }}>{t.trajeConfidencial ? 'Ativado' : 'Desativado'}</button>
            </div>
          </Card>
        </div>
      </div>

      {addAberto && (
        <Modal title="Adicionar participante" onClose={() => setAddAberto(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Inp label="Nome completo" value={addForm.nome} onChange={(e) => setAddForm((x) => ({ ...x, nome: e.target.value }))} placeholder="Nome" />
            <Inp label="Documento" value={addForm.documento} onChange={(e) => setAddForm((x) => ({ ...x, documento: e.target.value }))} placeholder="CPF" />
            <Sel label="Papel" value={addForm.papel} onChange={(e) => setAddForm((x) => ({ ...x, papel: e.target.value }))} options={PAPEIS} />
            <Sel label="Traje" value={addForm.produtoId} onChange={(e) => setAddForm((x) => ({ ...x, produtoId: e.target.value, tam: '' }))} options={produtos.map((p) => ({ value: p.id, label: `${p.nome} — ${p.cor}` }))} />
            <Sel label="Tam." value={addForm.tam} onChange={(e) => setAddForm((x) => ({ ...x, tam: e.target.value }))} options={tamOptionsAdd} />
          </div>
          {addErro && <Alert tone="error">{addErro}</Alert>}
          <BtnGold onClick={confirmarAdicao}>Checar disponibilidade e adicionar</BtnGold>
        </Modal>
      )}

      {editandoIdx !== null && (
        <EditarIntegranteModal
          integrante={integrantes[editandoIdx]}
          onClose={() => setEditandoIdx(null)}
          onSalvar={(dados) => salvarEdicao(editandoIdx, dados)}
        />
      )}

      {portalAberto && <PortalNoivoPreview t={t} produtos={produtos} onClose={() => setPortalAberto(false)} />}
    </div>
  );
}

// ── Aba "Pacotes Padronizados": menu lateral + modal de cadastro ────
function PacotesPadronizados({ produtos, trans, setTrans, ajustes, setAjustes, registrarPadronizada }) {
  const [view, setView] = useState('geral'); // 'geral' | 'selecionado'
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const pacotes = trans.filter((t) => t.tipo === 'locacao_padronizada');
  const selecionado = pacotes.find((t) => t.id === selecionadoId);

  const abrirPacote = (id) => { setSelecionadoId(id); setView('selecionado'); };

  return (
    <div style={{ display: 'flex', gap: 22 }}>
      <div style={{ width: 176, flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: '0.1em', margin: '4px 0 10px' }}>PADRONIZAÇÕES</p>
        <button onClick={() => setView('geral')} style={navItemStyle(view === 'geral')}>⌂ Visão geral</button>
        <button
          onClick={() => selecionado && setView('selecionado')}
          disabled={!selecionado}
          style={{ ...navItemStyle(view === 'selecionado'), opacity: selecionado ? 1 : 0.4, cursor: selecionado ? 'pointer' : 'not-allowed' }}
        >
          □ Pacote selecionado
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {view === 'geral' && (
          <VisaoGeral pacotes={pacotes} produtos={produtos} busca={busca} setBusca={setBusca} onAbrirPacote={abrirPacote} onNovoPacote={() => setModalAberto(true)} />
        )}
        {view === 'selecionado' && (
          selecionado ? (
            <PacoteDetalhe t={selecionado} produtos={produtos} trans={trans} setTrans={setTrans} ajustes={ajustes} setAjustes={setAjustes} onVoltar={() => setView('geral')} />
          ) : (
            <Card><p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>Nenhum pacote selecionado ainda. Volte para "Visão geral" e escolha um pacote na lista.</p></Card>
          )
        )}
      </div>

      {modalAberto && (
        <Modal title="Cadastrar pacote" onClose={() => setModalAberto(false)} width={860}>
          <LocacaoPadronizada
            produtos={produtos} trans={trans} ajustes={ajustes}
            registrarPadronizada={(f) => { registrarPadronizada(f); setModalAberto(false); }}
          />
        </Modal>
      )}
    </div>
  );
}

export default function Locacoes({ produtos, setProdutos, trans, setTrans, ajustes, setAjustes }) {
  const [aba, setAba] = useState('hist');

  const criarAjusteSeNecessario = (produtoId, tamPedido, tamEntregue, transId, entrega) => {
    if (tamPedido === tamEntregue) return;
    setAjustes((prev) => [...prev, {
      id: _ajusteId++, produtoId, transId,
      desc: `Ajuste de caimento: peça retirada no tamanho ${tamEntregue} para atender pedido do tamanho ${tamPedido}.`,
      tamOriginal: tamPedido, tamEntregue, entrega: entrega || '', status: 'Pendente',
    }]);
  };

  const registrarVenda = (f) => {
    const id = _transId++;
    setTrans((prev) => [...prev, {
      id, tipo: 'venda', produtoId: f.produtoId, tamPedido: f.tam, tamEntregue: f.tam,
      cliente: f.cliente, tel: f.tel, documento: f.documento,
      retirada: null, devolucao: null, valor: f.valor,
      data: new Date().toISOString().slice(0, 10), devolvido: null, avarias: '',
      contrato: 'Confirmado', noivos: '', dataEvento: '', integrantes: [],
    }]);
    setProdutos((prev) => prev.map((p) => p.id !== f.produtoId ? p : {
      ...p, variantes: p.variantes.map((v) => v.tam === f.tam ? { ...v, qtd: Math.max(0, v.qtd - 1) } : v),
    }));
    setAba('hist');
  };

  const registrarLocacao = (f) => {
    const id = _transId++;
    setTrans((prev) => [...prev, {
      id, tipo: 'locacao_avulsa', produtoId: f.produtoId, tamPedido: f.tamPedido, tamEntregue: f.tamEntregue,
      cliente: f.cliente, tel: f.tel, documento: f.documento,
      retirada: f.retirada, devolucao: f.devolucao, valor: f.valor,
      data: new Date().toISOString().slice(0, 10), devolvido: false, avarias: '',
      contrato: 'Rascunho', noivos: '', dataEvento: '', integrantes: [],
    }]);
    if (f.precisaAjuste) criarAjusteSeNecessario(f.produtoId, f.tamPedido, f.tamEntregue, id, f.retirada);
    setAba('hist');
  };

  const registrarPadronizada = (f) => {
    const id = _transId++;
    setTrans((prev) => [...prev, {
      id, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
      cliente: f.cliente, tel: f.tel, documento: '',
      retirada: f.retirada, devolucao: f.devolucao, valor: f.valor,
      data: new Date().toISOString().slice(0, 10), devolvido: false, avarias: '',
      contrato: 'Rascunho', noivos: f.noivos, dataEvento: f.dataEvento,
      dataFechamento: f.dataFechamento, limiteComparecimento: f.limiteComparecimento,
      trajeConfidencial: false,
      integrantes: f.integrantes,
    }]);
    f.integrantes.forEach((i) => {
      if (i.precisaAjuste) criarAjusteSeNecessario(i.produtoId, i.tam, i.tamEntregue, id, f.retirada);
    });
  };

  const onAvancarContrato = (transId) => {
    setTrans((prev) => prev.map((t) => {
      if (t.id !== transId) return t;
      if (t.contrato === 'Rascunho') return { ...t, contrato: 'Aguardando assinatura loja' };
      if (t.contrato === 'Aguardando assinatura loja') return { ...t, contrato: 'Aguardando assinatura cliente' };
      if (t.contrato === 'Aguardando assinatura cliente') return { ...t, contrato: 'Confirmado' };
      return t;
    }));
  };

  const abas = [
    { key: 'hist', label: 'Histórico' },
    { key: 'venda', label: 'Venda Avulsa' },
    { key: 'avulsa', label: 'Locação Avulsa' },
    { key: 'pacotes', label: 'Pacotes Padronizados' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
        {abas.map(({ key, label }) => (
          <button key={key} onClick={() => setAba(key)} style={{
            padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            background: aba === key ? C.gold : 'transparent', color: aba === key ? C.accentInk : C.textSub,
            border: aba === key ? 'none' : `1px solid ${C.border}`,
          }}>{label}</button>
        ))}
      </div>

      {aba === 'hist' && <Historico produtos={produtos} trans={trans} onAvancarContrato={onAvancarContrato} />}
      {aba === 'venda' && <VendaAvulsa produtos={produtos} trans={trans} ajustes={ajustes} registrarVenda={registrarVenda} />}
      {aba === 'avulsa' && <LocacaoAvulsa produtos={produtos} trans={trans} ajustes={ajustes} registrarLocacao={registrarLocacao} />}
      {aba === 'pacotes' && <PacotesPadronizados produtos={produtos} trans={trans} setTrans={setTrans} ajustes={ajustes} setAjustes={setAjustes} registrarPadronizada={registrarPadronizada} />}
    </div>
  );
}
