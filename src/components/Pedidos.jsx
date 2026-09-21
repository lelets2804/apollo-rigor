import { useMemo, useState } from 'react';
import { C, MONO, fmt, fmtDate } from '../constants';
import { Card, SectionTitle, Heading, TH, TD, Chip, Badge, Drawer, BtnGold, BtnOut, TextArea, Stat, Alert } from './UI';
import { usePedidos, atualizarStatus, TIPO_LABEL } from '../store/pedidos';

const STATUS_MAP = {
  'Novo':        { color: 'var(--status-blue-fg)',   bg: 'var(--status-blue-bg)',   border: 'var(--status-blue-border)' },
  'Em análise':  { color: 'var(--status-yellow-fg)', bg: 'var(--status-yellow-bg)', border: 'var(--status-yellow-border)' },
  'Aprovado':    { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
  'Recusado':    { color: 'var(--status-red-fg)',    bg: 'var(--status-red-bg)',    border: 'var(--status-red-border)' },
};

const TIPO_COR = {
  locacao_avulsa: 'var(--status-orange-fg)',
  venda: 'var(--status-green-fg)',
  locacao_padronizada: 'var(--status-blue-fg)',
};

const hoje = () => new Date().toISOString().slice(0, 10);
const menosDias = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
const dataHora = (ms) => new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Constrói a transação equivalente ao pedido aprovado, no formato de src/constants.
function pedidoParaTransacao(pedido, trans) {
  const id = Math.max(1000, ...trans.map((t) => t.id)) + 1;
  const base = {
    id, cliente: pedido.noivos || pedido.cliente.nome, tel: pedido.cliente.tel,
    documento: pedido.cliente.documento || '', valor: pedido.valorEstimado || 0,
    data: hoje(), avarias: '', contrato: 'Rascunho',
    noivos: pedido.noivos || '', dataEvento: pedido.dataEvento || '', integrantes: [],
  };
  if (pedido.tipo === 'venda') {
    return { ...base, tipo: 'venda', produtoId: pedido.produtoId, tamPedido: pedido.tam, tamEntregue: pedido.tam, retirada: null, devolucao: null, devolvido: null };
  }
  if (pedido.tipo === 'locacao_avulsa') {
    return { ...base, tipo: 'locacao_avulsa', produtoId: pedido.produtoId, tamPedido: pedido.tam, tamEntregue: pedido.tam, retirada: pedido.retirada, devolucao: pedido.devolucao, devolvido: false };
  }
  // pacote padronizado — entra como rascunho para o ateliê montar os integrantes
  return {
    ...base, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    retirada: pedido.retirada, devolucao: pedido.devolucao, devolvido: false,
    dataFechamento: hoje(),
    limiteComparecimento: pedido.dataEvento ? menosDias(pedido.dataEvento, 14) : '',
    trajeConfidencial: false,
  };
}

function Linha({ k, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${C.borderSoft}`, fontSize: 12.5 }}>
      <span style={{ color: C.textSub }}>{k}</span>
      <span style={{ color: C.text, textAlign: 'right', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function Detalhe({ pedido, trans, setTrans, onClose }) {
  const [motivo, setMotivo] = useState('');
  const [recusando, setRecusando] = useState(false);
  const jaAprovado = pedido.status === 'Aprovado';
  const terminal = jaAprovado || pedido.status === 'Recusado';

  const aprovar = () => {
    const t = pedidoParaTransacao(pedido, trans);
    setTrans((prev) => [...prev, t]);
    atualizarStatus(pedido.id, 'Aprovado', `Transação #${t.id} criada em Vendas e Locações (rascunho).`, { transId: t.id });
    onClose();
  };

  const emAnalise = () => atualizarStatus(pedido.id, 'Em análise', 'Em triagem pelo ateliê.');

  const recusar = () => {
    atualizarStatus(pedido.id, 'Recusado', motivo.trim() || 'Sem disponibilidade para o pedido.', { motivoRecusa: motivo.trim() });
    onClose();
  };

  return (
    <Drawer
      title={pedido.protocolo}
      subtitle={`${TIPO_LABEL[pedido.tipo]} · recebido ${dataHora(pedido.criadoEm)}`}
      onClose={onClose}
      width={460}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Badge label={pedido.status} map={STATUS_MAP} />
        {jaAprovado && pedido.transId && <Chip color="var(--status-green-fg)">Transação #{pedido.transId}</Chip>}
      </div>

      {pedido.foto && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 66, height: 88, overflow: 'hidden', border: `1px solid ${C.border}`, borderRadius: C.radiusSm, flexShrink: 0 }}>
            <img src={pedido.foto} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <Heading size={15}>{pedido.produtoNome || pedido.modeloBaseNome || 'Modelo a definir'}</Heading>
            {pedido.cor && <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSub }}>{pedido.cor}{pedido.tam ? ` · tam. ${pedido.tam}` : ''}</p>}
          </div>
        </div>
      )}

      <SectionTitle style={{ margin: '18px 0 6px' }}>Cliente</SectionTitle>
      <Linha k="Nome">{pedido.cliente.nome}</Linha>
      <Linha k="E-mail">{pedido.cliente.email}</Linha>
      <Linha k="Telefone">{pedido.cliente.tel}</Linha>
      {pedido.cliente.documento && <Linha k="CPF">{pedido.cliente.documento}</Linha>}

      <SectionTitle style={{ margin: '18px 0 6px' }}>Pedido</SectionTitle>
      <Linha k="Modalidade">{TIPO_LABEL[pedido.tipo]}</Linha>
      {pedido.noivos && <Linha k="Noivos">{pedido.noivos}</Linha>}
      {pedido.dataEvento && <Linha k="Data do evento">{fmtDate(pedido.dataEvento)}</Linha>}
      {pedido.nIntegrantes != null && <Linha k="Integrantes">{pedido.nIntegrantes}</Linha>}
      {pedido.retirada && <Linha k="Retirada">{fmtDate(pedido.retirada)}</Linha>}
      {pedido.devolucao && <Linha k="Devolução">{fmtDate(pedido.devolucao)}</Linha>}
      <Linha k="Valor estimado"><span style={{ ...MONO, color: C.goldText }}>R$ {fmt(pedido.valorEstimado || 0)}</span></Linha>

      {pedido.observacoes && (
        <>
          <SectionTitle style={{ margin: '18px 0 6px' }}>Observações do cliente</SectionTitle>
          <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '10px 12px' }}>
            {pedido.observacoes}
          </p>
        </>
      )}

      <SectionTitle style={{ margin: '20px 0 8px' }}>Histórico</SectionTitle>
      {[...pedido.historico].reverse().map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: C.textSub, padding: '5px 0' }}>
          <span style={{ ...MONO, color: C.textMuted, whiteSpace: 'nowrap' }}>{dataHora(h.em)}</span>
          <span><b style={{ color: C.text }}>{h.status}</b>{h.nota ? ` — ${h.nota}` : ''}</span>
        </div>
      ))}

      {!terminal && (
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          {recusando ? (
            <>
              <TextArea label="Motivo da recusa (enviado ao acompanhamento do cliente)" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: modelo indisponível para a data. Propor alternativa em contato." />
              <div style={{ display: 'flex', gap: 8 }}>
                <BtnGold onClick={recusar}>Confirmar recusa</BtnGold>
                <BtnOut onClick={() => setRecusando(false)}>Cancelar</BtnOut>
              </div>
            </>
          ) : (
            <>
              <Alert tone="info">
                Aprovar cria uma transação em <b>Vendas e Locações</b> (rascunho) já preenchida com os dados do pedido.
              </Alert>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <BtnGold onClick={aprovar}>Aprovar e criar no sistema</BtnGold>
                {pedido.status === 'Novo' && <BtnOut onClick={emAnalise}>Marcar em análise</BtnOut>}
                <BtnOut color="var(--status-red-fg)" onClick={() => setRecusando(true)}>Recusar</BtnOut>
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}

export default function Pedidos({ trans, setTrans }) {
  const pedidos = usePedidos();
  const [filtro, setFiltro] = useState('Novo');
  const [aberto, setAberto] = useState(null);

  const contagem = useMemo(() => {
    const c = { Novo: 0, 'Em análise': 0, Aprovado: 0, Recusado: 0 };
    pedidos.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [pedidos]);

  const lista = filtro === 'Todos' ? pedidos : pedidos.filter((p) => p.status === filtro);
  const pedidoAberto = aberto ? pedidos.find((p) => p.id === aberto) : null;

  return (
    <div className="apollo-anim-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <Stat label="Novos" value={contagem.Novo} color="var(--status-blue-fg)" hint="aguardando triagem" />
        <Stat label="Em análise" value={contagem['Em análise']} color="var(--status-yellow-fg)" />
        <Stat label="Aprovados" value={contagem.Aprovado} color="var(--status-green-fg)" />
        <Stat label="Recusados" value={contagem.Recusado} color="var(--status-red-fg)" />
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['Novo', 'Em análise', 'Aprovado', 'Recusado', 'Todos'].map((f) => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              padding: '6px 14px', borderRadius: C.radiusSm, cursor: 'pointer', fontFamily: C.fontSans,
              fontSize: 11.5, fontWeight: filtro === f ? 600 : 500,
              background: filtro === f ? C.gold : 'transparent',
              color: filtro === f ? C.accentInk : C.textSub,
              border: filtro === f ? 'none' : `1px solid ${C.border}`,
            }}>
              {f}{f !== 'Todos' && contagem[f] ? ` · ${contagem[f]}` : ''}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <p style={{ color: C.textSub, fontSize: 13, padding: '28px 0', textAlign: 'center' }}>
            Nenhum pedido {filtro !== 'Todos' ? `com status "${filtro}"` : 'recebido'}. Pedidos enviados pelo site aparecem aqui.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                <TH>Protocolo</TH><TH>Tipo</TH><TH>Cliente</TH><TH>Item / evento</TH>
                <TH style={{ textAlign: 'right' }}>Estimado</TH><TH style={{ textAlign: 'right' }}>Recebido</TH><TH style={{ textAlign: 'right' }}>Status</TH>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} onClick={() => setAberto(p.id)} style={{ cursor: 'pointer' }}>
                  <TD><span style={{ ...MONO, fontWeight: 600, color: C.goldText }}>{p.protocolo}</span></TD>
                  <TD><Chip color={TIPO_COR[p.tipo]}>{TIPO_LABEL[p.tipo]}</Chip></TD>
                  <TD><span style={{ color: C.text, fontWeight: 500 }}>{p.cliente.nome}</span></TD>
                  <TD><span style={{ color: C.textSub }}>{p.produtoNome || p.modeloBaseNome || (p.noivos ? `${p.noivos} · ${p.nIntegrantes} trajes` : '—')}</span></TD>
                  <TD style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><span style={{ ...MONO, color: C.goldText }}>R$ {fmt(p.valorEstimado || 0)}</span></TD>
                  <TD style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><span style={{ ...MONO, fontSize: 11.5, color: C.textSub }}>{dataHora(p.criadoEm)}</span></TD>
                  <TD style={{ textAlign: 'right' }}><Badge label={p.status} map={STATUS_MAP} /></TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {pedidoAberto && (
        <Detalhe pedido={pedidoAberto} trans={trans} setTrans={setTrans} onClose={() => setAberto(null)} />
      )}
    </div>
  );
}
