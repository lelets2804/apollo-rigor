import { useEffect, useMemo, useState } from 'react';
import { Section, Wrap, Eyebrow, H2, Lead, ProdutoCard, Tape, ink, sub, line, brass } from './ui';
import { CATALOGO, VITRINES } from './siteData';
import { CATEGORIAS } from '../constants';

const mono = "var(--font-mono)";

export default function Colecao({ openProduto, foco }) {
  const [vitrine, setVitrine] = useState(foco || 'todos');
  const [categoria, setCategoria] = useState('');

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  useEffect(() => { if (foco) setVitrine(foco); }, [foco]);

  const lista = useMemo(() => {
    let arr = CATALOGO;
    const v = VITRINES.find((x) => x.id === vitrine);
    if (v) arr = arr.filter(v.filtro);
    if (categoria) arr = arr.filter((p) => p.categoria === categoria);
    return arr;
  }, [vitrine, categoria]);

  const abas = [{ id: 'todos', titulo: 'Tudo' }, ...VITRINES];

  return (
    <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
      <Wrap>
        <Eyebrow>Coleção</Eyebrow>
        <H2 style={{ marginTop: 14 }}>Trajes de cerimônia para alugar ou comprar.</H2>
        <Lead style={{ marginTop: 16, maxWidth: '52ch' }}>
          Todos os modelos saem com prova e ajuste de ateliê. Escolha um traje para
          ver tamanhos, valores e abrir o pedido.
        </Lead>

        <div style={{ margin: '32px 0 8px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {abas.map((a) => (
            <button key={a.id} onClick={() => setVitrine(a.id)} style={{
              padding: '8px 15px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontSize: 12.5, fontWeight: vitrine === a.id ? 600 : 500,
              background: vitrine === a.id ? 'var(--gold-dim)' : 'transparent',
              color: vitrine === a.id ? 'var(--gold-strong)' : ink,
              border: `1px solid ${vitrine === a.id ? 'var(--gold)' : line}`,
            }}>
              {a.titulo}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 28px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: sub, fontFamily: mono }}>Categoria</span>
          <button onClick={() => setCategoria('')} style={pill(categoria === '')}>Todas</button>
          {CATEGORIAS.map((c) => (
            <button key={c} onClick={() => setCategoria(c === categoria ? '' : c)} style={pill(categoria === c)}>{c}</button>
          ))}
        </div>

        <Tape height={10} style={{ marginBottom: 32 }} />

        {lista.length === 0 ? (
          <p style={{ color: sub, fontSize: 14, padding: '40px 0' }}>
            Nenhum modelo nesse recorte. <button onClick={() => { setVitrine('todos'); setCategoria(''); }} style={{ background: 'none', border: 'none', color: brass, cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Limpar filtros</button>
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {lista.map((p) => <ProdutoCard key={p.id} produto={p} onOpen={openProduto} />)}
          </div>
        )}
      </Wrap>
    </Section>
  );
}

const pill = (on) => ({
  padding: '5px 12px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-sans)',
  fontSize: 12, fontWeight: on ? 600 : 500,
  background: on ? 'var(--gold-dim)' : 'transparent',
  color: on ? 'var(--gold-strong)' : 'var(--text-sub)',
  border: `1px solid ${on ? 'var(--gold)' : 'var(--border)'}`,
});
