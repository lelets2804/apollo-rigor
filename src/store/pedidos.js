// ── Store de Pedidos ──────────────────────────────────────────────────────────
// Ponte entre o site do cliente (/) e o sistema interno (/sistema). Sem backend:
// os pedidos vivem em localStorage e são compartilhados entre as duas telas do
// mesmo navegador. Trocas em outra aba chegam via evento 'storage'; trocas na
// mesma aba via evento customizado 'apollo-pedidos'.
import { useEffect, useState, useCallback } from 'react';
import { PRODUTOS_INIT } from '../constants';
import { PERFIS } from '../site/auth';

const KEY = 'apollo-pedidos';
const EVT = 'apollo-pedidos';

export const STATUS_FLUXO = ['Novo', 'Em análise', 'Aprovado', 'Recusado'];

export const TIPO_LABEL = {
  locacao_avulsa: 'Locação',
  venda: 'Compra',
  locacao_padronizada: 'Pacote de casamento',
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch { /* storage indisponível — mantém em memória na sessão */ }
  window.dispatchEvent(new CustomEvent(EVT));
}

// protocolo curto e legível para o cliente acompanhar: AR-7F3K2
function novoProtocolo(existentes) {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p;
  do {
    p = 'AR-' + Array.from({ length: 5 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
  } while (existentes.some((x) => x.protocolo === p));
  return p;
}

export function listPedidos() {
  return read().sort((a, b) => b.criadoEm - a.criadoEm);
}

export function getPedido(protocolo) {
  const alvo = String(protocolo || '').trim().toUpperCase();
  return read().find((p) => p.protocolo === alvo) || null;
}

// Cria um pedido a partir do site. `dados` traz tipo, cliente e os campos
// específicos da modalidade. Devolve o pedido criado (com protocolo).
export function criarPedido(dados) {
  const arr = read();
  const agora = Date.now();
  const pedido = {
    id: 'p' + agora + Math.floor(Math.random() * 1000),
    protocolo: novoProtocolo(arr),
    criadoEm: agora,
    status: 'Novo',
    transId: null,
    motivoRecusa: '',
    historico: [{ status: 'Novo', em: agora, nota: 'Pedido recebido pelo site.' }],
    ...dados,
  };
  write([pedido, ...arr]);
  return pedido;
}

// Atualiza status (uso interno, tela Pedidos). `extra` pode trazer transId/motivo.
export function atualizarStatus(id, status, nota = '', extra = {}) {
  const arr = read().map((p) => {
    if (p.id !== id) return p;
    return {
      ...p,
      status,
      ...extra,
      historico: [...p.historico, { status, em: Date.now(), nota }],
    };
  });
  write(arr);
}

export function removerPedido(id) {
  write(read().filter((p) => p.id !== id));
}

// Hook reativo — re-renderiza quando qualquer tela mexe no store.
export function usePedidos() {
  const [pedidos, setPedidos] = useState(listPedidos);

  useEffect(() => {
    const sync = () => setPedidos(listPedidos());
    const onStorage = (e) => { if (e.key === KEY) sync(); };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return pedidos;
}

// Só o número de pedidos aguardando triagem — para o selo na navegação.
export function useContagemNovos() {
  const pedidos = usePedidos();
  return pedidos.filter((p) => p.status === 'Novo').length;
}

export function useAcao() {
  return useCallback((id, status, nota, extra) => atualizarStatus(id, status, nota, extra), []);
}

// ── Semente de demonstração ──────────────────────────────────────────────────
// Numa primeira visita o store nasce vazio: o Portal do noivo (dado do sistema,
// em constants.js) aparece cheio, mas "Meus pedidos" fica sem nada. Para a demo
// bater, semeamos alguns pedidos já ligados ao cliente exemplo — os dados do
// cliente saem de PERFIS.cliente (auth.js), a mesma fonte da sessão. Roda só uma
// vez: se o usuário apagar os pedidos depois, não voltam (a chave passa a
// existir com [] e não é mais nula).
const DIA = 86_400_000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

function pedidosDemo() {
  const agora = Date.now();
  const { nome, email, tel, documento } = PERFIS.cliente;
  const cliente = { nome, email, tel, documento };
  const prod = (id) => PRODUTOS_INIT.find((p) => p.id === id) || {};
  const smoking = prod(2);
  const sapato = prod(8);

  return [
    {
      id: 'p-demo-smoking',
      protocolo: 'AR-GF7K2',
      criadoEm: agora - 9 * DIA,
      status: 'Aprovado',
      transId: null,
      motivoRecusa: '',
      tipo: 'locacao_avulsa',
      cliente,
      produtoId: smoking.id,
      produtoNome: smoking.nome,
      foto: smoking.foto,
      cor: smoking.cor,
      tam: 'M',
      retirada: iso(agora + 12 * DIA),
      devolucao: iso(agora + 18 * DIA),
      valorEstimado: smoking.aluguel,
      observacoes: 'Para o jantar de véspera. Combinar a prova numa quinta à noite, se possível.',
      historico: [
        { status: 'Novo', em: agora - 9 * DIA, nota: 'Pedido recebido pelo site.' },
        { status: 'Em análise', em: agora - 8 * DIA, nota: 'Em triagem pelo ateliê.' },
        { status: 'Aprovado', em: agora - 7 * DIA, nota: 'Disponibilidade e datas confirmadas. A equipe entra em contato para a prova.' },
      ],
    },
    {
      id: 'p-demo-sapato',
      protocolo: 'AR-GF9M4',
      criadoEm: agora - 2 * DIA,
      status: 'Novo',
      transId: null,
      motivoRecusa: '',
      tipo: 'venda',
      cliente,
      produtoId: sapato.id,
      produtoNome: sapato.nome,
      foto: sapato.foto,
      cor: sapato.cor,
      tam: '42',
      retirada: null,
      devolucao: null,
      valorEstimado: sapato.venda,
      observacoes: 'Quero comprar para ficar, não devolver.',
      historico: [
        { status: 'Novo', em: agora - 2 * DIA, nota: 'Pedido recebido pelo site.' },
      ],
    },
  ];
}

// Chamada uma vez no start (main.jsx). Só semeia se o store nunca foi tocado.
export function seedPedidosDemo() {
  try {
    if (localStorage.getItem(KEY) !== null) return;
    write(pedidosDemo());
  } catch {
    /* storage indisponível — segue sem semente */
  }
}
