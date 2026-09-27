import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../middleware.js';

const r = Router();

const varianteSchema = z.object({ tam: z.string().min(1), qtd: z.number().int().min(0) });

const produtoSchema = z.object({
  nome: z.string().min(2),
  categoria: z.string().min(1),
  colecao: z.string().min(1),
  tecido: z.string().min(1),
  cor: z.string().min(1),
  linha: z.string().min(1),
  aluguel: z.number().min(0),
  venda: z.number().min(0),
  foto: z.string().optional().default(''),
  variantes: z.array(varianteSchema).optional().default([]),
});

async function comVariantes(produtos) {
  if (!produtos.length) return [];
  const ids = produtos.map((p) => p.id);
  const { rows } = await pool.query(`SELECT produto_id, tam, qtd FROM variantes WHERE produto_id = ANY($1) ORDER BY id`, [ids]);
  const porProduto = {};
  rows.forEach((v) => { (porProduto[v.produto_id] ||= []).push({ tam: v.tam, qtd: v.qtd }); });
  return produtos.map((p) => ({ ...p, aluguel: Number(p.aluguel), venda: Number(p.venda), variantes: porProduto[p.id] || [] }));
}

r.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM produtos ORDER BY id DESC`);
    res.json(await comVariantes(rows));
  } catch (e) { next(e); }
});

r.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const d = produtoSchema.parse(req.body);
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO produtos (nome, categoria, colecao, tecido, cor, linha, aluguel, venda, foto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [d.nome, d.categoria, d.colecao, d.tecido, d.cor, d.linha, d.aluguel, d.venda, d.foto || ''],
    );
    const p = rows[0];
    for (const v of d.variantes) {
      await client.query(`INSERT INTO variantes (produto_id, tam, qtd) VALUES ($1,$2,$3)`, [p.id, v.tam, v.qtd]);
    }
    await client.query('COMMIT');
    const [completo] = await comVariantes([p]);
    res.status(201).json(completo);
  } catch (e) { await client.query('ROLLBACK'); next(e); }
  finally { client.release(); }
});

r.put('/:id', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const d = produtoSchema.parse(req.body);
    await client.query('BEGIN');
    const { rowCount } = await client.query(
      `UPDATE produtos SET nome=$1, categoria=$2, colecao=$3, tecido=$4, cor=$5, linha=$6, aluguel=$7, venda=$8, foto=$9 WHERE id=$10`,
      [d.nome, d.categoria, d.colecao, d.tecido, d.cor, d.linha, d.aluguel, d.venda, d.foto || '', id],
    );
    if (!rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ erro: 'Produto não encontrado' }); }
    await client.query(`DELETE FROM variantes WHERE produto_id=$1`, [id]);
    for (const v of d.variantes) {
      await client.query(`INSERT INTO variantes (produto_id, tam, qtd) VALUES ($1,$2,$3)`, [id, v.tam, v.qtd]);
    }
    await client.query('COMMIT');
    const { rows } = await pool.query(`SELECT * FROM produtos WHERE id=$1`, [id]);
    const [completo] = await comVariantes(rows);
    res.json(completo);
  } catch (e) { await client.query('ROLLBACK'); next(e); }
  finally { client.release(); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query(`DELETE FROM produtos WHERE id=$1`, [id]);
    if (!rowCount) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;
