import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { hashSenha, conferirSenha, gerarAccessToken, criarRefreshToken, acharRefreshValido, revogarRefresh } from '../auth.js';
import { requireAuth } from '../middleware.js';

const r = Router();

r.post('/registrar', async (req, res, next) => {
  try {
    const d = z.object({ nome: z.string().min(3), email: z.string().email(), senha: z.string().min(6) }).parse(req.body);
    const existe = await pool.query(`SELECT 1 FROM usuarios WHERE email=$1`, [d.email.toLowerCase()]);
    if (existe.rowCount) return res.status(409).json({ erro: 'E-mail já cadastrado' });
    const hash = await hashSenha(d.senha);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1,$2,$3,'cliente') RETURNING id, nome, email, papel`,
      [d.nome, d.email.toLowerCase(), hash],
    );
    const u = rows[0];
    const access = gerarAccessToken(u);
    const { token: refresh } = await criarRefreshToken(u.id);
    res.status(201).json({ usuario: u, access, refresh });
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const d = z.object({ email: z.string().email(), senha: z.string().min(1) }).parse(req.body);
    const { rows } = await pool.query(`SELECT * FROM usuarios WHERE email=$1`, [d.email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const u = rows[0];
    if (!(await conferirSenha(d.senha, u.senha_hash))) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const access = gerarAccessToken(u);
    const { token: refresh } = await criarRefreshToken(u.id);
    res.json({ usuario: { id: u.id, nome: u.nome, email: u.email, papel: u.papel }, access, refresh });
  } catch (e) { next(e); }
});

r.post('/refresh', async (req, res, next) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ erro: 'refresh ausente' });
    const linha = await acharRefreshValido(refresh);
    if (!linha) return res.status(401).json({ erro: 'Refresh inválido ou expirado' });
    const { rows } = await pool.query(`SELECT * FROM usuarios WHERE id=$1`, [linha.usuario_id]);
    if (!rows.length) return res.status(401).json({ erro: 'Usuário não encontrado' });
    const u = rows[0];
    await revogarRefresh(refresh);
    const access = gerarAccessToken(u);
    const { token: novoRefresh } = await criarRefreshToken(u.id);
    res.json({ usuario: { id: u.id, nome: u.nome, email: u.email, papel: u.papel }, access, refresh: novoRefresh });
  } catch (e) { next(e); }
});

r.post('/logout', async (req, res, next) => {
  try { const { refresh } = req.body; if (refresh) await revogarRefresh(refresh); res.status(204).end(); }
  catch (e) { next(e); }
});

r.get('/eu', requireAuth, (req, res) => res.json({ usuario: req.user }));

export default r;
