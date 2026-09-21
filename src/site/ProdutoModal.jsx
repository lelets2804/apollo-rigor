import { useEffect, useMemo, useState } from 'react';
import { Field, ChipGroup, TextInput, Button, Eyebrow, onImgError, muted, sub, ink, line, brass } from './ui';
import { tamanhosDe, money } from './siteData';

const mono = "var(--font-mono)";
const hoje = () => new Date().toISOString().slice(0, 10);
const maisDias = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

// Detalhe do modelo + opções do pedido (modalidade, tamanho, datas).
// Ao continuar, devolve o rascunho para o fluxo de checkout — não cria nada ainda.
export default function ProdutoModal({ produto, onClose, onContinuar }) {
  const [modalidade, setModalidade] = useState('locacao_avulsa');
  const [tam, setTam] = useState('');
  const [retirada, setRetirada] = useState(maisDias(hoje(), 7));
  const [devolucao, setDevolucao] = useState(maisDias(hoje(), 10));
  const [erro, setErro] = useState('');

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onEsc); document.body.style.overflow = ''; };
  }, [onClose]);

  const aluguel = modalidade === 'locacao_avulsa';
  const valor = aluguel ? produto.aluguel : produto.venda;
  const tamanhos = useMemo(() => tamanhosDe(produto).map((t) => ({ value: t, label: t })), [produto]);

  const continuar = () => {
    if (!tam) return setErro('Escolha um tamanho de referência.');
    if (aluguel) {
      if (!retirada || !devolucao) return setErro('Informe as datas de retirada e devolução.');
      if (retirada < maisDias(hoje(), 2)) return setErro('A retirada precisa ser com pelo menos 2 dias de antecedência.');
      if (devolucao <= retirada) return setErro('A devolução deve ser depois da retirada.');
    }
    onContinuar({
      tipo: modalidade,
      produtoId: produto.id,
      produtoNome: produto.nome,
      foto: produto.foto,
      cor: produto.cor,
      tam,
      retirada: aluguel ? retirada : null,
      devolucao: aluguel ? devolucao : null,
      valorEstimado: valor,
    });
  };

  return (
    <div onClick={onClose} className="apollo-anim-in" style={{
      position: 'fixed', inset: 0, background: 'rgba(12,13,16,0.6)', zIndex: 120,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '4vh 16px',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="apollo-scale-in" style={{
        width: '100%', maxWidth: 860, background: 'var(--card)', border: `1px solid ${line}`,
        display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
      }} data-produto-modal>
        <div style={{ minHeight: 320, background: 'var(--bg-elevated)' }}>
          <img src={produto.foto} alt={produto.nome} onError={onImgError} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 320 }} />
        </div>

        <div style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <Eyebrow>{produto.categoria} · {produto.linha}</Eyebrow>
            <button onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: sub, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: ink, margin: '14px 0 4px', letterSpacing: '-0.015em' }}>
            {produto.nome}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: sub }}>{produto.cor} · {produto.tecido} · coleção {produto.colecao}</p>

          <div style={{ margin: '22px 0 0' }}>
            <Field label="Modalidade">
              <ChipGroup
                value={modalidade}
                onChange={setModalidade}
                columns={2}
                options={[
                  { value: 'locacao_avulsa', label: 'Alugar', sub: money(produto.aluguel) },
                  { value: 'venda', label: 'Comprar', sub: money(produto.venda) },
                ]}
              />
            </Field>

            <Field label="Tamanho de referência" hint="A equipe confirma a disponibilidade e ajusta na prova.">
              <ChipGroup value={tam} onChange={setTam} options={tamanhos} />
            </Field>

            {aluguel && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Retirada">
                  <TextInput type="date" value={retirada} min={maisDias(hoje(), 2)} onChange={(e) => setRetirada(e.target.value)} />
                </Field>
                <Field label="Devolução">
                  <TextInput type="date" value={devolucao} min={retirada} onChange={(e) => setDevolucao(e.target.value)} />
                </Field>
              </div>
            )}

            {erro && <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--status-red-fg)' }}>{erro}</p>}

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 0', borderTop: `1px solid ${line}`, marginTop: 4 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: sub, fontFamily: mono }}>
                {aluguel ? 'Aluguel estimado' : 'Valor estimado'}
              </span>
              <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: brass }}>{money(valor)}</span>
            </div>

            <Button style={{ width: '100%' }} onClick={continuar}>Continuar para o pedido</Button>
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: muted, textAlign: 'center' }}>
              O pedido é enviado ao ateliê para confirmação. Nada é cobrado agora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
