// ── Sessão da vitrine ─────────────────────────────────────────────────────────
// Ambiente de demonstração, sem backend e sem senha: a tela "Entrar" é só um
// seletor de perfil. O administrador é levado ao sistema interno (/sistema); o
// cliente exemplo (noivo) fica logado na área do cliente, com a sessão guardada
// em localStorage e sincronizada entre abas — mesmo padrão do store de pedidos.
import { useEffect, useState } from 'react';
import { TRANS_INIT } from '../constants';

const KEY = 'apollo-sessao';
const EVT = 'apollo-sessao';

// Pacote padronizado de exemplo vinculado à conta do noivo (fonte: TRANS_INIT).
const PACOTE_EXEMPLO_ID = 11;

// A conta do cliente de exemplo é o noivo desse pacote. Os dados do perfil são
// derivados do próprio registro do sistema (TRANS_INIT) para não divergirem do
// que o ateliê vê na tela de Locações — nome, telefone, CPF e papel batem com o
// integrante "Noivo" do pacote. O e-mail não existe no sistema, então é gerado
// de forma determinística a partir do nome.
const _pacoteExemplo = TRANS_INIT.find((t) => t.id === PACOTE_EXEMPLO_ID) || {};
const _noivoExemplo =
  (_pacoteExemplo.integrantes || []).find((i) => String(i.papel).toLowerCase().startsWith('noivo')) || {};

function emailDoNome(nome) {
  const slug = String(nome || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '') // tira acentos
    .trim().toLowerCase().replace(/\s+/g, '.');
  return `${slug || 'cliente'}@exemplo.com`;
}

export const PERFIS = {
  admin: {
    tipo: 'admin',
    nome: 'Equipe do ateliê',
    destino: '/sistema',
  },
  cliente: {
    tipo: 'cliente',
    nome: _noivoExemplo.nome || 'Gabriel Fontes',
    email: emailDoNome(_noivoExemplo.nome || 'Gabriel Fontes'),
    tel: _pacoteExemplo.tel || '',
    documento: _noivoExemplo.documento || '',
    papel: _noivoExemplo.papel || 'Noivo',
    pacoteId: PACOTE_EXEMPLO_ID,
  },
};

// Pacote do casamento associado à sessão do cliente (ou null).
export function pacoteDaSessao(sessao) {
  if (!sessao || sessao.tipo !== 'cliente') return null;
  return TRANS_INIT.find((t) => t.id === sessao.pacoteId) || null;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s ? reconciliar(s) : null;
  } catch {
    return null;
  }
}

// Sessões do cliente de exemplo já gravadas em localStorage (formato antigo,
// sem CPF etc.) são completadas com o registro atual do sistema — sem sobrepor
// o que o cliente tiver editado em "Meus dados".
function reconciliar(s) {
  if (!s || s.tipo !== 'cliente' || s.pacoteId !== PACOTE_EXEMPLO_ID) return s;
  const base = PERFIS.cliente;
  const out = { ...s };
  for (const k of ['nome', 'email', 'tel', 'documento', 'papel']) {
    if (!String(out[k] ?? '').trim()) out[k] = base[k];
  }
  return out;
}

function write(v) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage indisponível — segue sem persistir */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

// Cria a sessão do cliente exemplo. O admin não persiste sessão: quem chama
// redireciona direto para PERFIS.admin.destino.
export function entrarComoCliente() {
  const { tipo, nome, email, tel, documento, papel, pacoteId } = PERFIS.cliente;
  write({ tipo, nome, email, tel, documento, papel, pacoteId, em: Date.now() });
}

// Aplica alterações do perfil sobre a sessão atual (área do cliente).
export function atualizarSessao(patch) {
  const atual = read();
  if (!atual) return;
  write({ ...atual, ...patch });
}

export function sair() {
  write(null);
}

export function useSessao() {
  const [sessao, setSessao] = useState(read);

  useEffect(() => {
    const sync = () => setSessao(read());
    const onStorage = (e) => { if (e.key === KEY) sync(); };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return sessao;
}
