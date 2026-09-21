// ── Portal do casamento ──────────────────────────────────────────────────────
// Página dedicada (fora da Área do cliente). Abre ao clicar no pedido do pacote
// padronizado em Conta → Pedidos. Banner com o nome dos noivos + o portal
// (PortalNoivo) logo abaixo.
import { useEffect } from 'react';
import { Section, Wrap, Eyebrow, Display, Lead, sub, muted, brass } from './ui';
import { pacoteDaSessao } from './auth';
import PortalNoivo from './PortalNoivo';

const mono = 'var(--font-mono)';

const dataLonga = (iso) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

function VoltarLink({ go }) {
  return (
    <button
      onClick={() => go('conta', 'pedidos')}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0',
        fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: sub,
      }}
    >
      ← Meus pedidos
    </button>
  );
}

export default function Casamento({ go, cliente }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  useEffect(() => {
    if (!cliente) go('entrar');
  }, [cliente, go]);

  if (!cliente) return null;

  const pacote = pacoteDaSessao(cliente);

  if (!pacote) {
    return (
      <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
        <Wrap narrow>
          <VoltarLink go={go} />
          <Eyebrow style={{ marginTop: 18 }}>Portal do casamento</Eyebrow>
          <p style={{ marginTop: 16, fontSize: 14, color: sub }}>
            Nenhum pacote de casamento vinculado à sua conta.
          </p>
        </Wrap>
      </Section>
    );
  }

  const nomes = String(pacote.noivos || '')
    .split(/\s*&\s*/)
    .map((n) => n.trim().split(/\s+/)[0])
    .filter(Boolean);

  const titulo =
    nomes.length === 2 ? (
      <>
        {nomes[0]}
        <span style={{ color: brass, fontStyle: 'italic', fontWeight: 400, padding: '0 0.12em' }}>&</span>
        {nomes[1]}
      </>
    ) : (
      nomes.join(' & ') || pacote.noivos
    );

  return (
    <>
      {/* Banner — nome dos noivos */}
      <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)', paddingBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <Wrap>
          <VoltarLink go={go} />
          <Eyebrow style={{ marginTop: 20 }}>Portal do casamento</Eyebrow>
          <Display style={{ marginTop: 18 }}>{titulo}</Display>
          <Lead style={{ marginTop: 16 }}>Cerimônia em {dataLonga(pacote.dataEvento)}</Lead>
          <p style={{ margin: '10px 0 0', fontSize: 11.5, color: muted, fontFamily: mono }}>
            {pacote.noivos}
          </p>
        </Wrap>
      </Section>

      {/* Conteúdo do portal */}
      <Section style={{ paddingTop: 0, paddingBottom: 'clamp(3.5rem, 8vw, 7rem)' }}>
        <Wrap>
          <PortalNoivo pacote={pacote} />
        </Wrap>
      </Section>
    </>
  );
}
