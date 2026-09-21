import { useEffect } from 'react';
import { Section, Wrap, Eyebrow, Display, H2, Lead, Button, Tape, ProdutoCard, onImgError, ink, sub, muted, line, card, brass } from './ui';
import { CATALOGO, VITRINES, PASSOS, ATELIE, aluguelMinimo } from './siteData';

const mono = "var(--font-mono)";
const HERO_IMG = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1100&h=1400&fit=crop&q=80';
const PACOTE_IMG = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1100&h=900&fit=crop&q=80';

export default function Home({ go, openProduto, scrollTo }) {
  // âncora vinda da navegação (ex.: "Como funciona")
  useEffect(() => {
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0 });
    }
  }, [scrollTo]);

  const destaques = [CATALOGO[2], CATALOGO[1], CATALOGO[6], CATALOGO[0], CATALOGO[4], CATALOGO[7]].filter(Boolean);

  return (
    <>
      {/* ── Hero ── */}
      <Section bleed style={{ paddingTop: 'clamp(2.5rem, 6vw, 5rem)' }}>
        <Wrap>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', gap: 'clamp(1.5rem, 5vw, 4rem)', alignItems: 'center' }} className="hero-grid">
            <div>
              <Eyebrow>Ateliê · {ATELIE.cidade}</Eyebrow>
              <Display style={{ margin: '22px 0 0' }}>
                O traje certo raramente<br />sai da prateleira pronto.
              </Display>
              <Lead style={{ margin: '24px 0 0', maxWidth: '42ch' }}>
                Locação e venda de trajes de cerimônia, com prova e ajustes de ateliê
                inclusos. Para o noivo, para os padrinhos e para quem só precisa
                acertar o traje da festa.
              </Lead>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
                <Button onClick={() => go('colecao')}>Ver a coleção</Button>
                <Button variant="ghost" onClick={() => go('pacote')}>Montar pacote de casamento</Button>
              </div>
              <p style={{ margin: '26px 0 0', fontSize: 12, color: muted, fontFamily: mono }}>
                Aluguel a partir de <span style={{ color: brass, fontWeight: 600 }}>R$ {aluguelMinimo()}</span> · devolução após o evento
              </p>
            </div>

            <figure style={{ margin: 0, position: 'relative' }}>
              <div style={{ aspectRatio: '4 / 5', overflow: 'hidden', border: `1px solid ${line}`, background: card }}>
                <img src={HERO_IMG} alt="Terno de cerimônia no ateliê Apollo Rigor" onError={onImgError} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <figcaption style={{
                position: 'absolute', bottom: 16, left: 16, background: 'var(--bg-elevated)',
                border: `1px solid ${line}`, padding: '8px 12px', fontSize: 10.5,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: sub, fontFamily: mono,
              }}>
                Prova · barra · cintura · ombro
              </figcaption>
            </figure>
          </div>
        </Wrap>
        <Wrap style={{ marginTop: 'clamp(2.5rem, 6vw, 4.5rem)' }}><Tape height={14} /></Wrap>
      </Section>

      {/* ── Coleção por finalidade ── */}
      <Section id="colecao-preview">
        <Wrap>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
            <div>
              <Eyebrow>A coleção</Eyebrow>
              <H2 style={{ marginTop: 14 }}>Comece pelo papel que você vai ocupar<br />no evento.</H2>
            </div>
            <Button variant="ghost" onClick={() => go('colecao')}>Ver tudo</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 1, background: line, border: `1px solid ${line}`, marginBottom: 48 }}>
            {VITRINES.map((v) => (
              <button key={v.id} onClick={() => go('colecao', v.id)} style={{
                background: card, border: 'none', textAlign: 'left', cursor: 'pointer',
                padding: '22px 20px', fontFamily: 'var(--font-sans)',
              }}>
                <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: brass, fontFamily: mono, fontWeight: 600 }}>
                  {String(VITRINES.indexOf(v) + 1).padStart(2, '0')}
                </p>
                <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, color: ink }}>{v.titulo}</p>
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: sub, lineHeight: 1.5 }}>{v.desc}</p>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {destaques.map((p) => <ProdutoCard key={p.id} produto={p} onOpen={openProduto} />)}
          </div>
        </Wrap>
      </Section>

      {/* ── Pacotes de casamento ── */}
      <Section style={{ background: 'var(--bg-elevated)', borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
        <Wrap>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(1.5rem, 5vw, 4rem)', alignItems: 'center' }} className="hero-grid">
            <div style={{ aspectRatio: '5 / 4', overflow: 'hidden', border: `1px solid ${line}` }}>
              <img src={PACOTE_IMG} alt="Grupo de padrinhos em trajes coordenados" onError={onImgError} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <Eyebrow>Pacote de casamento</Eyebrow>
              <H2 style={{ marginTop: 14 }}>Um pedido só para vestir<br />o grupo inteiro.</H2>
              <Lead style={{ marginTop: 20 }}>
                Você abre a solicitação com a data do evento, o número de integrantes e o
                modelo base. Cada padrinho, pai e pajem retira o traje no próprio nome,
                dentro do prazo de comparecimento — e o ateliê acompanha peça por peça.
              </Lead>
              <ul style={{ margin: '22px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {['Modelo padronizado para todos os integrantes', 'Prazo de comparecimento e prova para cada um', 'Preço fechado por traje, ajuste incluso'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: sub }}>
                    <span style={{ color: brass, fontFamily: mono }}>—</span>{t}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 28 }}>
                <Button onClick={() => go('pacote')}>Montar pacote de casamento</Button>
              </div>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* ── Como funciona ── */}
      <Section id="como-funciona">
        <Wrap>
          <Eyebrow>Como funciona</Eyebrow>
          <H2 style={{ marginTop: 14, marginBottom: 40 }}>Do pedido à devolução, quatro passos.</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: line, border: `1px solid ${line}` }}>
            {PASSOS.map((p) => (
              <div key={p.n} style={{ background: card, padding: '24px 22px 28px' }}>
                <p style={{ margin: 0, fontFamily: mono, fontSize: 13, color: brass, fontWeight: 600, letterSpacing: '0.1em' }}>{p.n}</p>
                <div style={{ height: 1, background: line, margin: '14px 0 16px' }} />
                <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: ink }}>{p.t}</p>
                <p style={{ margin: '9px 0 0', fontSize: 13, color: sub, lineHeight: 1.55 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* ── Ateliê / rodapé ── */}
      <footer id="atelie" style={{ borderTop: `1px solid ${line}`, background: 'var(--sidebar)', color: 'var(--sidebar-text)' }}>
        <Tape height={10} opacity={0.25} />
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--gold)' }}>Apollo Rigor</p>
              <p style={{ margin: '8px 0 0', fontSize: 11, letterSpacing: '0.3em', color: 'rgba(231,227,215,0.45)', fontFamily: mono }}>ATELIÊ DE CERIMÔNIA</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(231,227,215,0.5)', fontFamily: mono }}>Ateliê</p>
              <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.7, color: 'rgba(231,227,215,0.82)' }}>
                {ATELIE.endereco}<br />{ATELIE.cidade}<br />{ATELIE.horario}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(231,227,215,0.5)', fontFamily: mono }}>Contato</p>
              <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.7, color: 'rgba(231,227,215,0.82)' }}>
                {ATELIE.tel}<br />{ATELIE.email}
              </p>
              <button onClick={() => go('conta', 'pedidos')} style={{
                marginTop: 14, background: 'transparent', border: '1px solid rgba(231,227,215,0.28)',
                color: 'var(--sidebar-text)', padding: '9px 16px', borderRadius: 2, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                Meus pedidos
              </button>
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.09)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'rgba(231,227,215,0.4)', fontFamily: mono }}>© {new Date().getFullYear()} Apollo Rigor</span>
            <a href="/sistema" style={{ fontSize: 11, color: 'rgba(231,227,215,0.4)', fontFamily: mono, textDecoration: 'none' }}>Acesso da equipe →</a>
          </div>
        </div>
      </footer>
    </>
  );
}
