import { useEffect, useState } from 'react';
import { Section, Wrap, Eyebrow, H2, Lead, Button, Field, TextInput, TextArea, Tape, onImgError, ink, sub, muted, line, brass, card } from './ui';
import { money } from './siteData';
import { emailOk, telOk } from './siteData';
import { fmtDate } from '../constants';
import { criarPedido, TIPO_LABEL } from '../store/pedidos';
import Confirmacao from './Confirmacao';

const mono = "var(--font-mono)";

export default function Pedido({ rascunho, go, cliente }) {
  const [form, setForm] = useState({
    nome: cliente?.nome || '', email: cliente?.email || '', tel: cliente?.tel || '',
    documento: cliente?.documento || '', observacoes: '',
  });
  const [erros, setErros] = useState({});
  const [feito, setFeito] = useState(null);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [feito]);

  if (!rascunho && !feito) {
    return (
      <Section>
        <Wrap narrow>
          <Eyebrow>Pedido</Eyebrow>
          <H2 style={{ marginTop: 14 }}>Escolha um traje para começar.</H2>
          <Lead style={{ marginTop: 16 }}>Seu pedido monta a partir de um modelo da coleção — tamanho, modalidade e datas.</Lead>
          <div style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={() => go('colecao')}>Ver a coleção</Button>
            <Button variant="ghost" onClick={() => go('pacote')}>Montar pacote de casamento</Button>
          </div>
        </Wrap>
      </Section>
    );
  }

  if (feito) {
    return <Confirmacao pedido={feito} go={go} resumo={`${feito.produtoNome} · tam. ${feito.tam} · ${feito.cliente.nome}`} />;
  }

  const r = rascunho;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const enviar = () => {
    const er = {};
    if (form.nome.trim().length < 3) er.nome = 'Informe seu nome completo.';
    if (!emailOk(form.email)) er.email = 'E-mail inválido.';
    if (!telOk(form.tel)) er.tel = 'Telefone com DDD.';
    setErros(er);
    if (Object.keys(er).length) return;

    const pedido = criarPedido({
      tipo: r.tipo,
      cliente: { nome: form.nome.trim(), email: form.email.trim(), tel: form.tel.trim(), documento: form.documento.trim() },
      produtoId: r.produtoId,
      produtoNome: r.produtoNome,
      foto: r.foto,
      cor: r.cor,
      tam: r.tam,
      retirada: r.retirada,
      devolucao: r.devolucao,
      valorEstimado: r.valorEstimado,
      observacoes: form.observacoes.trim(),
    });
    setFeito(pedido);
  };

  return (
    <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
      <Wrap>
        <Eyebrow>Pedido · {TIPO_LABEL[r.tipo]}</Eyebrow>
        <H2 style={{ marginTop: 14, marginBottom: 8 }}>Confirme os dados e envie.</H2>
        <Lead style={{ marginBottom: 36 }}>O ateliê confirma disponibilidade e valores antes de qualquer cobrança.</Lead>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: 'clamp(1.5rem, 4vw, 3rem)', alignItems: 'start' }} className="pedido-grid">
          {/* formulário */}
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: brass, fontFamily: mono, fontWeight: 600 }}>Seus dados</p>
            <Field label="Nome completo" error={erros.nome}>
              <TextInput value={form.nome} onChange={set('nome')} placeholder="Como está no documento" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="E-mail" error={erros.email}>
                <TextInput type="email" value={form.email} onChange={set('email')} placeholder="voce@email.com" />
              </Field>
              <Field label="Telefone / WhatsApp" error={erros.tel}>
                <TextInput value={form.tel} onChange={set('tel')} placeholder="(11) 90000-0000" />
              </Field>
            </div>
            <Field label="CPF" hint="Opcional agora — necessário na retirada.">
              <TextInput value={form.documento} onChange={set('documento')} placeholder="000.000.000-00" />
            </Field>
            <Field label="Observações" hint="Ajustes conhecidos, cor de referência, ocasião.">
              <TextArea value={form.observacoes} onChange={set('observacoes')} placeholder="Ex.: casamento no dia 14, prefiro lapela fina, já sei que preciso encurtar a barra." />
            </Field>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <Button onClick={enviar}>Enviar pedido</Button>
              <Button variant="ghost" onClick={() => go('colecao')}>Trocar de traje</Button>
            </div>
          </div>

          {/* resumo do item */}
          <aside style={{ border: `1px solid ${line}`, background: card }}>
            <Tape height={8} style={{ opacity: 0.5 }} />
            <div style={{ display: 'flex', gap: 14, padding: 18 }}>
              {r.foto && (
                <div style={{ width: 72, height: 96, flexShrink: 0, overflow: 'hidden', border: `1px solid ${line}` }}>
                  <img src={r.foto} alt={r.produtoNome} onError={onImgError} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: ink }}>{r.produtoNome}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: sub }}>{r.cor} · tam. {r.tam}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11.5, color: muted, fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{TIPO_LABEL[r.tipo]}</p>
              </div>
            </div>
            <dl style={{ margin: 0, padding: '0 18px 6px', fontSize: 12.5 }}>
              {r.retirada && <Row k="Retirada" v={fmtDate(r.retirada)} />}
              {r.devolucao && <Row k="Devolução" v={fmtDate(r.devolucao)} />}
              <Row k={r.tipo === 'locacao_avulsa' ? 'Aluguel estimado' : 'Valor estimado'} v={money(r.valorEstimado)} strong />
            </dl>
            <p style={{ margin: 0, padding: '12px 18px 18px', fontSize: 11, color: muted, borderTop: `1px solid ${line}` }}>
              Valores sujeitos à confirmação do ateliê.
            </p>
          </aside>
        </div>
      </Wrap>
    </Section>
  );
}

function Row({ k, v, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <dt style={{ color: 'var(--text-sub)' }}>{k}</dt>
      <dd style={{ margin: 0, fontFamily: mono, color: strong ? brass : 'var(--text)', fontWeight: strong ? 600 : 500 }}>{v}</dd>
    </div>
  );
}
