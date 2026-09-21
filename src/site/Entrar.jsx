import { useEffect, useState } from 'react';
import { Section, Wrap, Eyebrow, H2, Lead, Button, Field, TextInput, Tape, ink, sub, muted, line, card, brass } from './ui';
import { PERFIS, entrarComoCliente } from './auth';

const mono = 'var(--font-mono)';

// Tela de acesso da vitrine. Ambiente de demonstração: os campos são reais mas
// não autenticam nada — qualquer um dos botões entra direto no destino certo.
// Administrador → sistema interno; cliente → área do cliente.
export default function Entrar({ go }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const entrarAdmin = () => { window.location.href = PERFIS.admin.destino; };
  const entrarCliente = () => { entrarComoCliente(); go('conta'); };

  return (
    <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
      <Wrap narrow style={{ maxWidth: 460 }}>
        <Eyebrow>Acesso</Eyebrow>
        <H2 style={{ marginTop: 14 }}>Entrar</H2>
        <Lead style={{ marginTop: 16 }}>
          Acesse o painel do ateliê ou a sua área de cliente.
        </Lead>

        <div style={{ border: `1px solid ${line}`, background: card, marginTop: 30 }}>
          <Tape height={8} style={{ opacity: 0.5 }} />
          <form
            onSubmit={(e) => { e.preventDefault(); entrarCliente(); }}
            style={{ padding: 'clamp(1.4rem, 4vw, 2rem)' }}
          >
            <Field label="E-mail">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </Field>

            <Field label="Senha" style={{ marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <TextInput
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 68 }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  style={{
                    position: 'absolute', top: 0, right: 0, height: '100%', padding: '0 12px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: mono, fontSize: 10.5, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: sub,
                  }}
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '0 0 22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: sub }}>
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
                />
                Manter conectado
              </label>
              <a
                href="#entrar"
                onClick={(e) => e.preventDefault()}
                style={{ fontSize: 12.5, color: 'var(--gold-text)', textDecoration: 'none' }}
              >
                Esqueceu a senha?
              </a>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <Button type="submit">Entrar como cliente</Button>
              <Button type="button" variant="ghost" onClick={entrarAdmin}>Entrar como administrador</Button>
            </div>

            <p style={{ margin: '18px 0 0', fontSize: 11, color: muted, lineHeight: 1.5 }}>
              Ambiente de demonstração — o acesso não usa senha. Qualquer um dos botões
              entra direto: <b style={{ color: sub }}>cliente</b> abre a área do noivo de exemplo,
              <b style={{ color: sub }}> administrador</b> abre o sistema em{' '}
              <span style={{ fontFamily: mono }}>/sistema</span>.
            </p>
          </form>
        </div>

        <p style={{ marginTop: 20, fontSize: 12.5, color: sub }}>
          Ainda não tem pedido?{' '}
          <button
            onClick={() => go('colecao')}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--gold-text)', fontFamily: 'var(--font-sans)', fontSize: 12.5 }}
          >
            Ver a coleção
          </button>
        </p>
      </Wrap>
    </Section>
  );
}
