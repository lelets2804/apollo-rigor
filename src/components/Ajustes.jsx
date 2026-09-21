import { useState } from 'react';
import { C, AJUSTE_MAP, fmtDate } from '../constants';
import { Badge, Card, SectionTitle, BtnOut, BtnGold, Sel, TextArea, Inp, Alert } from './UI';

let _ajusteId = 100;

// ── Painel de acompanhamento do ateliê ──────────────────────
function PainelAteliê({ produtos, ajustes, setAjustes }) {
  const colunas = ['Pendente', 'Em costura', 'Concluído'];
  const avancar = (id, status) => setAjustes((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {colunas.map((col) => {
        const itens = ajustes.filter((a) => a.status === col);
        const s = AJUSTE_MAP[col];
        return (
          <div key={col}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>{col.toUpperCase()} ({itens.length})</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {itens.length === 0 && (
                <Card style={{ padding: 14 }}><p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>Nenhum item.</p></Card>
              )}
              {itens.map((a) => {
                const produto = produtos.find((p) => p.id === a.produtoId);
                return (
                  <Card key={a.id} style={{ padding: 15, borderLeft: `3px solid ${s.color}` }}>
                    <p style={{ fontWeight: 700, color: C.text, fontSize: 13.5, margin: '0 0 4px', fontFamily: C.fontDisplay }}>{produto?.nome || '—'}</p>
                    <p style={{ color: C.textSub, fontSize: 12, margin: '0 0 6px' }}>{a.desc}</p>
                    {a.tamOriginal && a.tamEntregue && a.tamOriginal !== a.tamEntregue && (
                      <p style={{ color: C.textMuted, fontSize: 11, margin: '0 0 6px' }}>Tam. pedido {a.tamOriginal} → entregue {a.tamEntregue}</p>
                    )}
                    <p style={{ color: C.textSub, fontSize: 11, margin: '0 0 10px' }}>Entrega prevista: <span style={{ color: C.text }}>{fmtDate(a.entrega)}</span></p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {col === 'Pendente' && <BtnOut color="var(--status-blue-fg)" onClick={() => avancar(a.id, 'Em costura')}>Iniciar costura</BtnOut>}
                      {col === 'Em costura' && <BtnOut color="var(--status-green-fg)" onClick={() => avancar(a.id, 'Concluído')}>Concluir</BtnOut>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Fluxo de registro de devoluções ─────────────────────────
function Devolucoes({ produtos, trans, setTrans, setAjustes }) {
  const opcoes = [];
  trans.forEach((t) => {
    if (t.tipo === 'locacao_avulsa' && t.devolvido === false) {
      const p = produtos.find((x) => x.id === t.produtoId);
      opcoes.push({ key: `av-${t.id}`, transId: t.id, integranteIdx: null, label: `${p?.nome || '—'} (${t.tamEntregue}) — ${t.cliente}`, produtoId: t.produtoId, tam: t.tamEntregue });
    }
    if (t.tipo === 'locacao_padronizada' && t.devolvido === false) {
      (t.integrantes || []).forEach((i, idx) => {
        if (i.devolvido) return;
        const p = produtos.find((x) => x.id === i.produtoId);
        opcoes.push({ key: `pad-${t.id}-${idx}`, transId: t.id, integranteIdx: idx, label: `${p?.nome || '—'} (${i.tamEntregue}) — ${i.nome} (${t.noivos})`, produtoId: i.produtoId, tam: i.tamEntregue });
      });
    }
  });

  const EMPTY = { key: '', avarias: '', precisaAjuste: false, desc: '', entrega: '' };
  const [d, setD] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const sel = opcoes.find((o) => o.key === d.key);

  const confirmar = () => {
    if (!sel) return;
    const t = trans.find((x) => x.id === sel.transId);
    if (!t) return;

    if (sel.integranteIdx === null) {
      setTrans((prev) => prev.map((x) => x.id === t.id ? { ...x, devolvido: true, avarias: d.avarias } : x));
    } else {
      setTrans((prev) => prev.map((x) => {
        if (x.id !== t.id) return x;
        const integrantes = x.integrantes.map((i, idx) => idx === sel.integranteIdx ? { ...i, devolvido: true, avarias: d.avarias } : i);
        const todosDevolvidos = integrantes.every((i) => i.devolvido);
        return { ...x, integrantes, devolvido: todosDevolvidos ? true : x.devolvido };
      }));
    }

    if (d.precisaAjuste) {
      setAjustes((prev) => [...prev, {
        id: _ajusteId++, produtoId: sel.produtoId, transId: sel.transId,
        desc: d.desc || 'Ajuste de costura solicitado na devolução.',
        tamOriginal: sel.tam, tamEntregue: sel.tam, entrega: d.entrega || '', status: 'Pendente',
      }]);
    }

    setMsg(`Devolução de "${sel.label}" registrada com sucesso.${d.precisaAjuste ? ' Encaminhado ao ateliê.' : ' Peça liberada para o estoque.'}`);
    setD(EMPTY);
  };

  return (
    <Card style={{ borderColor: `${C.gold}55` }}>
      <SectionTitle>REGISTRAR DEVOLUÇÃO</SectionTitle>
      {msg && <Alert tone="success">{msg}</Alert>}
      {opcoes.length === 0 ? (
        <p style={{ color: C.textSub, fontSize: 13 }}>Não há locações em aberto para devolução.</p>
      ) : (
        <>
          <Sel label="Locação em aberto" value={d.key} onChange={(e) => { setD((x) => ({ ...x, key: e.target.value })); setMsg(''); }}
            options={opcoes.map((o) => ({ value: o.key, label: o.label }))} />
          <TextArea label="Avarias ou problemas identificados na peça" value={d.avarias}
            onChange={(e) => setD((x) => ({ ...x, avarias: e.target.value }))}
            placeholder="Descreva manchas, rasgos, botões faltando, odor, etc. Deixe em branco se a peça voltou em bom estado." />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px' }}>
            <input type="checkbox" id="cb-ajuste" checked={d.precisaAjuste}
              onChange={(e) => setD((x) => ({ ...x, precisaAjuste: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--gold)' }} />
            <label htmlFor="cb-ajuste" style={{ fontSize: 13, color: C.textSub, cursor: 'pointer' }}>
              Peça precisa de ajuste ou reparo no ateliê antes de voltar ao estoque
            </label>
          </div>
          {d.precisaAjuste && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <Inp label="Descrição do reparo" value={d.desc} onChange={(e) => setD((x) => ({ ...x, desc: e.target.value }))} placeholder="Ex: Costurar bainha rasgada" />
              <Inp label="Data Prevista de Entrega" type="date" value={d.entrega} onChange={(e) => setD((x) => ({ ...x, entrega: e.target.value }))} />
            </div>
          )}
          <BtnGold onClick={confirmar}>Confirmar Devolução</BtnGold>
        </>
      )}
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Ajustes({ produtos, trans, setTrans, ajustes, setAjustes }) {
  const [aba, setAba] = useState('painel');

  return (
    <div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
        {[{ key: 'painel', label: 'Painel do Ateliê' }, { key: 'dev', label: 'Registrar Devolução' }].map(({ key, label }) => (
          <button key={key} onClick={() => setAba(key)} style={{
            padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: C.fontSans,
            background: aba === key ? C.gold : 'transparent', color: aba === key ? C.accentInk : C.textSub,
            border: aba === key ? 'none' : `1px solid ${C.border}`,
          }}>{label}</button>
        ))}
      </div>

      {aba === 'painel' && (
        ajustes.length === 0 ? (
          <Card><p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>Nenhum ajuste em andamento. Ajustes são criados automaticamente quando uma locação usa um tamanho maior que o pedido, ou manualmente ao registrar uma devolução.</p></Card>
        ) : <PainelAteliê produtos={produtos} ajustes={ajustes} setAjustes={setAjustes} />
      )}

      {aba === 'dev' && <Devolucoes produtos={produtos} trans={trans} setTrans={setTrans} setAjustes={setAjustes} />}
    </div>
  );
}
