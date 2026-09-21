import { useEffect, useMemo, useState } from 'react';
import { Section, Wrap, Eyebrow, H2, Lead, Button, Field, TextInput, TextArea, Select, Tape, ink, sub, muted, line, brass, card } from './ui';
import { emailOk, telOk, money } from './siteData';
import { CATALOGO } from './siteData';
import { criarPedido } from '../store/pedidos';
import Confirmacao from './Confirmacao';

const mono = "var(--font-mono)";
const hoje = () => new Date().toISOString().slice(0, 10);
const maisDias = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

// modelos que fazem sentido como base de um pacote (ternos)
const MODELOS_BASE = CATALOGO.filter((p) => p.categoria === 'Terno');

export default function Pacote({ go, cliente }) {
  const [form, setForm] = useState({
    noivos: '', dataEvento: maisDias(hoje(), 60), nIntegrantes: 4, modeloBase: '',
    contato: cliente?.nome || '', email: cliente?.email || '', tel: cliente?.tel || '', observacoes: '',
  });
  const [erros, setErros] = useState({});
  const [feito, setFeito] = useState(null);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [feito]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const modelo = useMemo(() => MODELOS_BASE.find((m) => String(m.id) === String(form.modeloBase)), [form.modeloBase]);
  const estimativa = modelo ? modelo.aluguel * Math.max(1, Number(form.nIntegrantes) || 0) : 0;

  if (feito) {
    return <Confirmacao pedido={feito} go={go} resumo={`${feito.noivos} · ${feito.nIntegrantes} integrantes`} />;
  }

  const enviar = () => {
    const er = {};
    if (form.noivos.trim().length < 3) er.noivos = 'Informe o nome dos noivos.';
    if (!form.dataEvento || form.dataEvento < hoje()) er.dataEvento = 'Data do evento inválida.';
    if (!(Number(form.nIntegrantes) >= 1)) er.nIntegrantes = 'Ao menos 1 integrante.';
    if (form.contato.trim().length < 3) er.contato = 'Informe o nome do responsável.';
    if (!emailOk(form.email)) er.email = 'E-mail inválido.';
    if (!telOk(form.tel)) er.tel = 'Telefone com DDD.';
    setErros(er);
    if (Object.keys(er).length) return;

    const evento = form.dataEvento;
    const pedido = criarPedido({
      tipo: 'locacao_padronizada',
      cliente: { nome: form.contato.trim(), email: form.email.trim(), tel: form.tel.trim(), documento: cliente?.documento || '' },
      noivos: form.noivos.trim(),
      dataEvento: evento,
      nIntegrantes: Number(form.nIntegrantes),
      modeloBaseId: modelo ? modelo.id : null,
      modeloBaseNome: modelo ? modelo.nome : '',
      foto: modelo ? modelo.foto : null,
      retirada: maisDias(evento, -4),
      devolucao: maisDias(evento, 3),
      valorEstimado: estimativa,
      observacoes: form.observacoes.trim(),
    });
    setFeito(pedido);
  };

  return (
    <Section style={{ paddingTop: 'clamp(2.5rem, 6vw, 4rem)' }}>
      <Wrap>
        <Eyebrow>Pacote de casamento</Eyebrow>
        <H2 style={{ marginTop: 14, marginBottom: 8 }}>Abra a solicitação do grupo.</H2>
        <Lead style={{ marginBottom: 36 }}>
          Com esses dados o ateliê monta o pacote, define o prazo de comparecimento e
          libera cada integrante para retirar o traje no próprio nome.
        </Lead>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: 'clamp(1.5rem, 4vw, 3rem)', alignItems: 'start' }} className="pedido-grid">
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: brass, fontFamily: mono, fontWeight: 600 }}>O evento</p>
            <Field label="Nome dos noivos" error={erros.noivos}>
              <TextInput value={form.noivos} onChange={set('noivos')} placeholder="Ex.: Marcos Silva & Ana Andrade" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Data do evento" error={erros.dataEvento}>
                <TextInput type="date" value={form.dataEvento} min={hoje()} onChange={set('dataEvento')} />
              </Field>
              <Field label="Integrantes (trajes)" error={erros.nIntegrantes} hint="Noivo, padrinhos, pais, pajens.">
                <TextInput type="number" min={1} max={30} value={form.nIntegrantes} onChange={set('nIntegrantes')} />
              </Field>
            </div>
            <Field label="Modelo base" hint="Opcional — dá para decidir na prova.">
              <Select
                value={form.modeloBase}
                onChange={set('modeloBase')}
                placeholder="Escolher depois"
                options={MODELOS_BASE.map((m) => ({ value: m.id, label: `${m.nome} · ${m.cor} · ${money(m.aluguel)}` }))}
              />
            </Field>

            <p style={{ margin: '26px 0 16px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: brass, fontFamily: mono, fontWeight: 600 }}>Responsável pelo pacote</p>
            <Field label="Nome" error={erros.contato}>
              <TextInput value={form.contato} onChange={set('contato')} placeholder="Quem organiza os trajes" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="E-mail" error={erros.email}>
                <TextInput type="email" value={form.email} onChange={set('email')} placeholder="voce@email.com" />
              </Field>
              <Field label="Telefone / WhatsApp" error={erros.tel}>
                <TextInput value={form.tel} onChange={set('tel')} placeholder="(11) 90000-0000" />
              </Field>
            </div>
            <Field label="Observações" hint="Cores, cerimonial, integrantes de outra cidade, prazos.">
              <TextArea value={form.observacoes} onChange={set('observacoes')} placeholder="Ex.: 2 padrinhos moram fora e só chegam na semana do casamento." />
            </Field>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <Button onClick={enviar}>Enviar solicitação</Button>
              <Button variant="ghost" onClick={() => go('colecao')}>Ver modelos primeiro</Button>
            </div>
          </div>

          <aside style={{ border: `1px solid ${line}`, background: card }}>
            <Tape height={8} style={{ opacity: 0.5 }} />
            <div style={{ padding: 18 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: ink }}>Estimativa do pacote</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: sub }}>{form.nIntegrantes || 0} trajes{modelo ? ` · ${modelo.nome}` : ' · modelo a definir'}</p>
            </div>
            <dl style={{ margin: 0, padding: '0 18px 6px', fontSize: 12.5 }}>
              <Row k="Aluguel / traje" v={modelo ? money(modelo.aluguel) : '—'} />
              <Row k="Integrantes" v={String(form.nIntegrantes || 0)} />
              <Row k="Total estimado" v={estimativa ? money(estimativa) : '—'} strong />
            </dl>
            <p style={{ margin: 0, padding: '12px 18px 18px', fontSize: 11, color: muted, borderTop: `1px solid ${line}` }}>
              Estimativa sem ajustes individuais. O ateliê fecha o valor por integrante.
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
