import { useEffect, useState } from 'react';
import { Section, Wrap, Eyebrow, H2, Lead, Button, Field, TextInput, Tape, ink, sub, muted, line, card, brass } from './ui';
import { useSessao, sair, pacoteDaSessao, atualizarSessao } from './auth';
import { listPedidos, TIPO_LABEL } from '../store/pedidos';
import { emailOk, telOk } from './siteData';
import { fmt, fmtDate } from '../constants';
import { comparecimentoPacote } from '../logic';
import RastreioPedido from './RastreioPedido';

const mono = 'var(--font-mono)';
const dataHora = (ms) => new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const STATUS_COR = {
  Novo: 'var(--status-blue-fg)',
  'Em análise': 'var(--status-yellow-fg)',
  Aprovado: 'var(--status-green-fg)',
  Recusado: 'var(--status-red-fg)',
};

// cartão-linha clicável da lista de pedidos
function RowShell({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', textAlign: 'left', width: '100%', cursor: 'pointer',
      border: `1px solid ${line}`, background: card, padding: '16px 18px', fontFamily: 'var(--font-sans)',
    }}>
      {children}
    </button>
  );
}

// Área do cliente (perfil "noivo" de exemplo). Abas: Pedidos (avulsos + o pacote
// padronizado) e Meus dados. O Portal do noivo não é mais aba: abre ao clicar no
// pedido do pacote de casamento.
const ABAS_VALIDAS = ['pedidos', 'perfil'];

export default function Conta({ go, arg }) {
  const sessao = useSessao();
  // 'portal' era uma aba antiga — cai em 'pedidos'
  const [aba, setAba] = useState(ABAS_VALIDAS.includes(arg) ? arg : 'pedidos');

  useEffect(() => { window.scrollTo({ top: 0 }); }, [aba]);
  useEffect(() => {
    if (sessao === null || (sessao && sessao.tipo !== 'cliente')) go('entrar');
  }, [sessao, go]);

  if (!sessao || sessao.tipo !== 'cliente') return null;

  const pacote = pacoteDaSessao(sessao);
  // Pedidos avulsos (locação/compra individuais feitas pelo site).
  const meusPedidos = listPedidos().filter(
    (p) => (p.cliente?.email || '').toLowerCase() === sessao.email.toLowerCase()
      && p.tipo !== 'locacao_padronizada',
  );

  const totalPedidos = meusPedidos.length + (pacote ? 1 : 0);
  const abas = [
    { key: 'pedidos', label: `Pedidos${totalPedidos ? ` · ${totalPedidos}` : ''}` },
    { key: 'perfil', label: 'Meus dados' },
  ];

  return (
    <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
      <Wrap>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Área do cliente</Eyebrow>
            <H2 style={{ marginTop: 14 }}>Olá, {sessao.nome.split(' ')[0]}.</H2>
            <Lead style={{ marginTop: 14 }}>
              {sessao.papel} · {sessao.email}
            </Lead>
          </div>
          <button onClick={() => { sair(); go('home'); }} style={{
            background: 'transparent', border: `1px solid ${line}`, borderRadius: 2, cursor: 'pointer',
            padding: '9px 16px', fontFamily: mono, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: sub,
          }}>
            Sair
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
          <Button onClick={() => go('colecao')}>Abrir novo pedido</Button>
          <Button variant="ghost" onClick={() => go('pacote')}>Montar pacote de casamento</Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: `1px solid ${line}`, margin: '32px 0 28px' }}>
          {abas.map((a) => (
            <button key={a.key} onClick={() => setAba(a.key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '10px 2px', marginRight: 26, fontFamily: 'var(--font-sans)',
              fontSize: 14, fontWeight: aba === a.key ? 600 : 500,
              color: aba === a.key ? 'var(--gold-text)' : ink,
              borderBottom: `2px solid ${aba === a.key ? 'var(--gold)' : 'transparent'}`,
            }}>
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'pedidos' && <MeusPedidos pedidos={meusPedidos} pacote={pacote} go={go} />}

        {aba === 'perfil' && <EditarPerfil sessao={sessao} />}
      </Wrap>
    </Section>
  );
}

function EditarPerfil({ sessao }) {
  const base = {
    nome: sessao.nome || '',
    email: sessao.email || '',
    tel: sessao.tel || '',
    documento: sessao.documento || '',
  };
  const [form, setForm] = useState(base);
  const [erros, setErros] = useState({});
  const [salvo, setSalvo] = useState(false);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSalvo(false); };

  const sujo = ['nome', 'email', 'tel', 'documento'].some((k) => form[k] !== base[k]);

  const salvar = (e) => {
    e.preventDefault();
    const er = {};
    if (form.nome.trim().length < 3) er.nome = 'Informe seu nome completo.';
    if (!emailOk(form.email)) er.email = 'E-mail inválido.';
    if (form.tel.trim() && !telOk(form.tel)) er.tel = 'Telefone com DDD.';
    setErros(er);
    if (Object.keys(er).length) return;
    atualizarSessao({
      nome: form.nome.trim(),
      email: form.email.trim(),
      tel: form.tel.trim(),
      documento: form.documento.trim(),
    });
    setErros({});
    setSalvo(true);
  };

  return (
    <form onSubmit={salvar} style={{ border: `1px solid ${line}`, background: card, maxWidth: 540 }}>
      <Tape height={8} style={{ opacity: 0.5 }} />
      <div style={{ padding: 'clamp(1.4rem, 4vw, 2rem)' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: ink }}>
          Dados da conta
        </p>
        <p style={{ margin: '8px 0 22px', fontSize: 13, color: sub, lineHeight: 1.6, maxWidth: '48ch' }}>
          Usados para preencher seus pedidos e para o ateliê entrar em contato. O
          papel no casamento ({sessao.papel}) é definido pelo ateliê.
        </p>

        <Field label="Nome completo" error={erros.nome}>
          <TextInput value={form.nome} onChange={set('nome')} autoComplete="name" placeholder="Como está no documento" />
        </Field>
        <Field label="E-mail" error={erros.email}>
          <TextInput type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="voce@email.com" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Telefone / WhatsApp" error={erros.tel}>
            <TextInput value={form.tel} onChange={set('tel')} placeholder="(11) 90000-0000" />
          </Field>
          <Field label="CPF" hint="Opcional — necessário na retirada.">
            <TextInput value={form.documento} onChange={set('documento')} placeholder="000.000.000-00" />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
          <Button type="submit" disabled={!sujo}>Salvar alterações</Button>
          {sujo && (
            <Button type="button" variant="ghost" onClick={() => { setForm(base); setErros({}); setSalvo(false); }}>
              Descartar
            </Button>
          )}
          {salvo && !sujo && (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--status-green-fg)', fontFamily: mono }}>
              ✓ Dados atualizados
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

// Aba "Pedidos": lista o pacote padronizado (se houver) + os pedidos avulsos.
// Clicar no pacote leva à página do casamento (fora do perfil); clicar num
// avulso abre o rastreio embutido aqui.
function MeusPedidos({ pedidos, pacote, go }) {
  const [sel, setSel] = useState(null);

  const aberto = sel && pedidos.find((p) => p.id === sel);
  if (aberto) {
    return <RastreioPedido pedido={aberto} onVoltar={() => setSel(null)} />;
  }

  if (!pacote && pedidos.length === 0) {
    return (
      <div style={{ border: `1px solid ${line}`, background: card }}>
        <Tape height={8} style={{ opacity: 0.5 }} />
        <div style={{ padding: '28px 24px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: ink }}>
            Você ainda não tem pedidos.
          </p>
          <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: sub, lineHeight: 1.6, maxWidth: '52ch' }}>
            Locações, compras e o pacote de casamento aparecem aqui. Clique num pedido para ver o andamento.
          </p>
          <Button onClick={() => go('colecao')}>Ver a coleção</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {pacote && (
        <RowShell onClick={() => go('casamento')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontFamily: mono, fontSize: 12, fontWeight: 700, color: brass, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Pacote
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: ink }}>
                {TIPO_LABEL.locacao_padronizada} · {pacote.noivos}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11.5, color: muted, fontFamily: mono }}>
                Evento em {fmtDate(pacote.dataEvento)} · abrir a página do casamento →
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--status-green-fg)', fontFamily: mono, letterSpacing: '0.06em' }}>
                {(() => { const { compareceram, total } = comparecimentoPacote(pacote); return `${compareceram}/${total} retiraram`; })()}
              </span>
              {pacote.valor > 0 && (
                <p style={{ margin: '6px 0 0', fontFamily: mono, fontSize: 13, color: ink }}>R$ {fmt(pacote.valor)}</p>
              )}
            </div>
          </div>
        </RowShell>
      )}

      {pedidos.map((p) => (
        <RowShell key={p.id} onClick={() => setSel(p.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontFamily: mono, fontSize: 12, fontWeight: 700, color: brass, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {TIPO_LABEL[p.tipo]}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: ink }}>
                {p.produtoNome
                  ? `${p.produtoNome}${p.tam ? ` · tam. ${p.tam}` : ''}`
                  : p.noivos || 'Pedido'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11.5, color: muted, fontFamily: mono }}>
                {p.protocolo} · enviado em {dataHora(p.criadoEm)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: STATUS_COR[p.status] || sub, fontFamily: mono, letterSpacing: '0.06em' }}>
                {p.status}
              </span>
              {p.valorEstimado > 0 && (
                <p style={{ margin: '6px 0 0', fontFamily: mono, fontSize: 13, color: ink }}>R$ {fmt(p.valorEstimado)}</p>
              )}
            </div>
          </div>
        </RowShell>
      ))}
    </div>
  );
}
