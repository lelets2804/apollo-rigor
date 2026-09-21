import { Tape, ink, sub, muted, line, brass, card } from './ui';
import { TIPO_LABEL } from '../store/pedidos';
import { fmt } from '../constants';

const mono = 'var(--font-mono)';

const PASSOS_STATUS = [
  { key: 'Novo', label: 'Recebido', d: 'Pedido na fila de triagem do ateliê.' },
  { key: 'Em análise', label: 'Em análise', d: 'Conferindo disponibilidade, tamanhos e datas.' },
  { key: 'Aprovado', label: 'Confirmado', d: 'Reservado. A equipe entra em contato para a prova.' },
];

const dataHora = (ms) => new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Painel de rastreio de um pedido avulso — o mesmo stepper que ficava na antiga
// tela "Acompanhar pedido", agora usado direto na área do cliente (ao clicar num
// pedido) e na confirmação de envio. Sem busca por protocolo: recebe o pedido.
export default function RastreioPedido({ pedido, onVoltar }) {
  if (!pedido) return null;

  const recusado = pedido.status === 'Recusado';
  const etapaAtual = PASSOS_STATUS.findIndex((s) => s.key === pedido.status);

  return (
    <div>
      {onVoltar && (
        <button
          onClick={onVoltar}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0',
            marginBottom: 18, fontFamily: mono, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: sub,
          }}
        >
          ← Voltar aos pedidos
        </button>
      )}

      <Tape height={10} style={{ marginBottom: 24 }} />

      <div style={{ border: `1px solid ${line}`, background: card, padding: '20px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontFamily: mono, fontSize: 18, fontWeight: 600, color: brass, letterSpacing: '0.06em' }}>{pedido.protocolo}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: ink }}>
              {TIPO_LABEL[pedido.tipo]}
              {pedido.produtoNome ? ` · ${pedido.produtoNome}${pedido.tam ? ` · tam. ${pedido.tam}` : ''}` : ''}
              {pedido.noivos ? ` · ${pedido.noivos}${pedido.nIntegrantes ? ` · ${pedido.nIntegrantes} integrantes` : ''}` : ''}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: sub }}>Enviado em {dataHora(pedido.criadoEm)} · {pedido.cliente.nome}</p>
          </div>
          {pedido.valorEstimado > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: sub, fontFamily: mono }}>Estimado</p>
              <p style={{ margin: '4px 0 0', fontFamily: mono, fontSize: 17, fontWeight: 600, color: ink }}>R$ {fmt(pedido.valorEstimado)}</p>
            </div>
          )}
        </div>
      </div>

      {recusado ? (
        <div style={{ border: `1px solid var(--status-red-border)`, background: 'var(--status-red-bg)', padding: '16px 18px' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: 'var(--status-red-fg)' }}>Pedido não confirmado</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--status-red-fg)' }}>
            {pedido.motivoRecusa || 'O ateliê entrará em contato para propor uma alternativa.'}
          </p>
        </div>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {PASSOS_STATUS.map((s, i) => {
            const done = i <= etapaAtual;
            const atual = i === etapaAtual;
            return (
              <li key={s.key} style={{ display: 'flex', gap: 14, paddingBottom: i < PASSOS_STATUS.length - 1 ? 18 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    background: done ? 'var(--gold)' : 'transparent',
                    border: `2px solid ${done ? 'var(--gold)' : line}`,
                  }} />
                  {i < PASSOS_STATUS.length - 1 && (
                    <span style={{ width: 2, flex: 1, minHeight: 22, background: i < etapaAtual ? 'var(--gold)' : line, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: atual ? 700 : 600, color: done ? ink : muted }}>{s.label}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12.5, color: done ? sub : muted }}>{s.d}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: sub, fontFamily: mono }}>
          Histórico
        </summary>
        <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
          {[...pedido.historico].reverse().map((h, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, fontSize: 12.5, color: sub, padding: '6px 0', borderBottom: `1px solid var(--border-soft)` }}>
              <span style={{ fontFamily: mono, color: muted, whiteSpace: 'nowrap' }}>{dataHora(h.em)}</span>
              <span><b style={{ color: ink }}>{h.status}</b>{h.nota ? ` — ${h.nota}` : ''}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
