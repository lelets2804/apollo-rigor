import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../middleware.js';

const r = Router();

const integranteSchema = z.object({
  nome: z.string().min(2),
  documento: z.string().optional().default(''),
  produtoId: z.number().int().positive().nullable().optional(),
  tam: z.string().optional().default(''),
  tamEntregue: z.string().optional().default(''),
  papel: z.string().optional().default(''),
  numeroContrato: z.string().optional().default(''),
  precoNegociado: z.number().min(0).optional().default(0),
  excecaoPreco: z.union([z.string(), z.number()]).optional().default(''),
  pagamento: z.enum(['Pendente', 'Parcial', 'Pago', 'Incluso no pacote']).optional().default('Pendente'),
  devolvido: z.boolean().optional().default(false),
  avarias: z.string().optional().default(''),
});

const transacaoSchema = z.object({
  tipo: z.enum(['venda', 'locacao_avulsa', 'locacao_padronizada']),
  produtoId: z.number().int().positive().nullable().optional(),
  tamPedido: z.string().optional().default(''),
  tamEntregue: z.string().optional().default(''),
  cliente: z.string().min(2),
  tel: z.string().optional().default(''),
  documento: z.string().optional().default(''),
  retirada: z.string().nullable().optional(),
  devolucao: z.string().nullable().optional(),
  valor: z.number().min(0).default(0),
  data: z.string().optional(),
  devolvido: z.boolean().nullable().optional(),
  avarias: z.string().optional().default(''),
  contrato: z.enum(['Rascunho', 'Aguardando assinatura loja', 'Aguardando assinatura cliente', 'Confirmado']).optional().default('Rascunho'),
  noivos: z.string().optional().default(''),
  dataEvento: z.string().nullable().optional(),
  dataFechamento: z.string().nullable().optional(),
  limiteComparecimento: z.string().nullable().optional(),
  trajeConfidencial: z.boolean().optional().default(false),
  senhaRevelacao: z.string().optional().default(''),
  integrantes: z.array(integranteSchema).optional().default([]),
});

async function comIntegrantes(transacoes) {
  if (!transacoes.length) return [];
  const ids = transacoes.map((t) => t.id);
  const { rows } = await pool.query(`SELECT * FROM integrantes WHERE transacao_id = ANY($1) ORDER BY id`, [ids]);
  const porTrans = {};
  rows.forEach((i) => { (porTrans[i.transacao_id] ||= []).push(mapearIntegrante(i)); });
  return transacoes.map((t) => ({ ...mapearTransacao(t), integrantes: porTrans[t.id] || [] }));
}

function mapearTransacao(t) {
  return {
    id: t.id, tipo: t.tipo, produtoId: t.produto_id, tamPedido: t.tam_pedido, tamEntregue: t.tam_entregue,
    cliente: t.cliente, tel: t.tel, documento: t.documento, retirada: t.retirada, devolucao: t.devolucao,
    valor: Number(t.valor), data: t.data, devolvido: t.devolvido, avarias: t.avarias, contrato: t.contrato,
    noivos: t.noivos, dataEvento: t.data_evento, dataFechamento: t.data_fechamento,
    limiteComparecimento: t.limite_comparecimento, trajeConfidencial: t.traje_confidencial,
    senhaRevelacao: t.senha_revelacao, padronizacao: t.padronizacao,
  };
}

function mapearIntegrante(i) {
  return {
    id: i.id, nome: i.nome, documento: i.documento, produtoId: i.produto_id, tam: i.tam, tamEntregue: i.tam_entregue,
    papel: i.papel, numeroContrato: i.numero_contrato, precoNegociado: Number(i.preco_negociado || 0),
    excecaoPreco: i.excecao_preco, pagamento: i.pagamento, devolvido: i.devolvido, avarias: i.avarias,
  };
}

r.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM transacoes ORDER BY id DESC`);
    res.json(await comIntegrantes(rows));
  } catch (e) { next(e); }
});

r.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const d = transacaoSchema.parse(req.body);
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO transacoes (tipo, produto_id, tam_pedido, tam_entregue, cliente, tel, documento, retirada, devolucao, valor, data, devolvido, avarias, contrato, noivos, data_evento, data_fechamento, limite_comparecimento, traje_confidencial, senha_revelacao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
      [d.tipo, d.produtoId || null, d.tamPedido || '', d.tamEntregue || '', d.cliente, d.tel || '', d.documento || '',
       d.retirada || null, d.devolucao || null, d.valor, d.data || new Date().toISOString().slice(0, 10),
       d.devolvido ?? null, d.avarias || '', d.contrato, d.noivos || '',
       d.dataEvento || null, d.dataFechamento || null, d.limiteComparecimento || null,
       d.trajeConfidencial || false, d.senhaRevelacao || ''],
    );
    const t = rows[0];
    for (const i of d.integrantes) {
      await client.query(
        `INSERT INTO integrantes (transacao_id, nome, documento, produto_id, tam, tam_entregue, papel, numero_contrato, preco_negociado, excecao_preco, pagamento, devolvido, avarias)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [t.id, i.nome, i.documento || '', i.produtoId || null, i.tam || '', i.tamEntregue || '', i.papel || '',
         i.numeroContrato || '', i.precoNegociado || 0, String(i.excecaoPreco ?? ''), i.pagamento || 'Pendente',
         i.devolvido || false, i.avarias || ''],
      );
    }
    await client.query('COMMIT');
    const [completo] = await comIntegrantes([t]);
    res.status(201).json(completo);
  } catch (e) { await client.query('ROLLBACK'); next(e); }
  finally { client.release(); }
});

r.put('/:id', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const d = transacaoSchema.parse(req.body);
    await client.query('BEGIN');
    const { rowCount } = await client.query(
      `UPDATE transacoes SET tipo=$1, produto_id=$2, tam_pedido=$3, tam_entregue=$4, cliente=$5, tel=$6, documento=$7, retirada=$8, devolucao=$9, valor=$10, devolvido=$11, avarias=$12, contrato=$13, noivos=$14, data_evento=$15, data_fechamento=$16, limite_comparecimento=$17, traje_confidencial=$18, senha_revelacao=$19 WHERE id=$20`,
      [d.tipo, d.produtoId || null, d.tamPedido || '', d.tamEntregue || '', d.cliente, d.tel || '', d.documento || '',
       d.retirada || null, d.devolucao || null, d.valor, d.devolvido ?? null, d.avarias || '', d.contrato, d.noivos || '',
       d.dataEvento || null, d.dataFechamento || null, d.limiteComparecimento || null,
       d.trajeConfidencial || false, d.senhaRevelacao || '', id],
    );
    if (!rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ erro: 'Transação não encontrada' }); }
    await client.query(`DELETE FROM integrantes WHERE transacao_id=$1`, [id]);
    for (const i of d.integrantes) {
      await client.query(
        `INSERT INTO integrantes (transacao_id, nome, documento, produto_id, tam, tam_entregue, papel, numero_contrato, preco_negociado, excecao_preco, pagamento, devolvido, avarias)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [id, i.nome, i.documento || '', i.produtoId || null, i.tam || '', i.tamEntregue || '', i.papel || '',
         i.numeroContrato || '', i.precoNegociado || 0, String(i.excecaoPreco ?? ''), i.pagamento || 'Pendente',
         i.devolvido || false, i.avarias || ''],
      );
    }
    await client.query('COMMIT');
    const { rows } = await pool.query(`SELECT * FROM transacoes WHERE id=$1`, [id]);
    const [completo] = await comIntegrantes(rows);
    res.json(completo);
  } catch (e) { await client.query('ROLLBACK'); next(e); }
  finally { client.release(); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query(`DELETE FROM transacoes WHERE id=$1`, [id]);
    if (!rowCount) return res.status(404).json({ erro: 'Transação não encontrada' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;
