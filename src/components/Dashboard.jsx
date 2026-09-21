import { C, MONO, fmt, fmtDate } from '../constants';
import { contagemProduto } from '../logic';
import { Card, SectionTitle, Heading, TH, TD, Chip, Stat } from './UI';

export default function Dashboard({ produtos, trans, ajustes }) {
  const contagens = produtos.map((p) => contagemProduto(p, trans, ajustes));
  const totalPecas = contagens.reduce((s, c) => s + c.total, 0);
  const disp  = contagens.reduce((s, c) => s + c.disponivel, 0);
  const alug  = contagens.reduce((s, c) => s + c.alugado, 0);
  const ajust = contagens.reduce((s, c) => s + c.ajuste, 0);
  const fat   = trans.reduce((s, t) => s + t.valor, 0);
  const ocupacao = totalPecas > 0 ? Math.round((alug / totalPecas) * 100) : 0;

  const metrics = [
    { label: 'Peças em acervo', val: totalPecas,     color: C.text },
    { label: 'Disponíveis',     val: disp,           color: 'var(--status-green-fg)' },
    { label: 'Alugadas',        val: alug,           color: 'var(--status-orange-fg)' },
    { label: 'Em ajuste',       val: ajust,          color: 'var(--status-yellow-fg)' },
  ];

  const recent = [...trans].sort((a, b) => b.id - a.id).slice(0, 6);
  const hoje = new Date().toISOString().slice(0, 10);
  const proximos = trans
    .filter((t) => t.tipo !== 'venda' && t.devolvido === false && t.retirada >= hoje)
    .sort((a, b) => a.retirada.localeCompare(b.retirada))
    .slice(0, 6);

  return (
    <div className="apollo-anim-in">
      {/* Faturamento em destaque + taxa de ocupação do acervo */}
      <Card accent style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <SectionTitle style={{ margin: '0 0 8px' }}>Faturamento acumulado · vendas + locações</SectionTitle>
          <p style={{ margin: 0, fontSize: 40, fontWeight: 500, color: C.goldText, ...MONO, lineHeight: 1 }}>
            R$ {fmt(fat)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px', fontSize: 9.5, color: C.textSub, letterSpacing: '0.13em', ...MONO, textTransform: 'uppercase' }}>Ocupação do acervo</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 500, color: C.text, ...MONO, lineHeight: 1 }}>{ocupacao}%</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: C.textSub, ...MONO }}>{alug} / {totalPecas} unid.</p>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {metrics.map((m) => <Stat key={m.label} label={m.label} value={m.val} color={m.color} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, alignItems: 'start' }}>
        <Card>
          <SectionTitle>Últimas transações</SectionTitle>
          {recent.length === 0 ? <p style={{ color: C.textSub, fontSize: 13 }}>Nenhuma transação registrada.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr><TH>Cliente</TH><TH>Tipo</TH><TH style={{ textAlign: 'right' }}>Valor</TH><TH style={{ textAlign: 'right' }}>Data</TH></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <TD><span style={{ color: C.text, fontWeight: 500 }}>{t.cliente}</span></TD>
                    <TD>
                      <Chip color={t.tipo === 'venda' ? 'var(--status-green-fg)' : t.tipo === 'locacao_avulsa' ? 'var(--status-orange-fg)' : 'var(--status-blue-fg)'}>
                        {t.tipo === 'venda' ? 'Venda' : t.tipo === 'locacao_avulsa' ? 'Locação' : 'Padronizada'}
                      </Chip>
                    </TD>
                    <TD style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><span style={{ color: C.goldText, fontWeight: 500, ...MONO }}>R$ {fmt(t.valor)}</span></TD>
                    <TD style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><span style={{ color: C.textSub, fontSize: 11.5, ...MONO }}>{fmtDate(t.data)}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <SectionTitle>Próximos eventos / retiradas</SectionTitle>
          {proximos.length === 0 ? <p style={{ color: C.textSub, fontSize: 13 }}>Nenhum evento agendado.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {proximos.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', gap: 13, padding: '11px 0', borderBottom: i < proximos.length - 1 ? `1px solid ${C.borderSoft}` : 'none' }}>
                  <span style={{ fontSize: 10.5, color: C.goldText, fontWeight: 600, ...MONO, whiteSpace: 'nowrap', paddingTop: 1 }}>{fmtDate(t.retirada)}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: C.text, fontWeight: 500 }}>{t.tipo === 'locacao_padronizada' ? t.noivos : t.cliente}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSub }}>
                      {t.tipo === 'locacao_padronizada' ? `${t.integrantes.length} trajes · pacote` : 'locação avulsa'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
