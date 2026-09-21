import { largerSizes } from './constants';

// duas faixas de datas se sobrepõem?
export function overlaps(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

export function getVariante(produto, tam) {
  return produto?.variantes?.find((v) => v.tam === tam) || null;
}

export function qtdVariante(produto, tam) {
  return getVariante(produto, tam)?.qtd ?? 0;
}

// transações de locação ativas (não devolvidas) que reservam um (produtoId, tam) em um período
export function reservasAtivas(produtoId, tam, retirada, devolucao, trans, ignoreTransId = null) {
  return trans.filter((t) => {
    if (t.id === ignoreTransId) return false;
    if (t.tipo === 'locacao_avulsa') {
      if (t.devolvido !== false) return false;
      return t.produtoId === produtoId && t.tamEntregue === tam && overlaps(retirada, devolucao, t.retirada, t.devolucao);
    }
    if (t.tipo === 'locacao_padronizada') {
      return (t.integrantes || []).some((i) => i.produtoId === produtoId && i.tamEntregue === tam && !i.devolvido) &&
        overlaps(retirada, devolucao, t.retirada, t.devolucao);
    }
    return false;
  }).length;
}

// quantas unidades de um (produto, tam) estão em ajuste (fora de circulação) agora
export function qtdEmAjuste(produtoId, tam, ajustes) {
  return ajustes.filter((a) => a.produtoId === produtoId && a.tamEntregue === tam && a.status !== 'Concluído').length;
}

// disponibilidade real de um tamanho específico de um produto num período
export function checkDisponibilidade(produto, tam, retirada, devolucao, trans, ajustes, ignoreTransId = null) {
  const variante = getVariante(produto, tam);
  if (!produto || !variante) return { disponivel: false, qtdLivre: 0, motivo: 'Tamanho não cadastrado para este modelo.' };
  const reservado = reservasAtivas(produto.id, tam, retirada, devolucao, trans, ignoreTransId);
  const ajuste    = qtdEmAjuste(produto.id, tam, ajustes);
  const livre     = variante.qtd - reservado - ajuste;
  return {
    disponivel: livre > 0,
    qtdLivre: Math.max(0, livre),
    motivo: livre > 0 ? '' : 'Quantidade esgotada para as datas selecionadas.',
  };
}

// contagem em tempo real (hoje) de um tamanho específico — para o painel de estoque
export function contagemVariante(produto, tam, trans, ajustes) {
  const variante = getVariante(produto, tam);
  const total = variante?.qtd ?? 0;
  const alugado = trans.filter((t) => {
    if (t.tipo === 'locacao_avulsa') return t.devolvido === false && t.produtoId === produto.id && t.tamEntregue === tam;
    if (t.tipo === 'locacao_padronizada') return (t.integrantes || []).some((i) => i.produtoId === produto.id && i.tamEntregue === tam && !i.devolvido);
    return false;
  }).length;
  const ajuste = qtdEmAjuste(produto.id, tam, ajustes);
  const disponivel = Math.max(0, total - alugado - ajuste);
  return { total, alugado, ajuste, disponivel };
}

// contagem agregada de TODAS as variantes de um produto
export function contagemProduto(produto, trans, ajustes) {
  return (produto.variantes || []).reduce((acc, v) => {
    const c = contagemVariante(produto, v.tam, trans, ajustes);
    return {
      total: acc.total + c.total,
      alugado: acc.alugado + c.alugado,
      ajuste: acc.ajuste + c.ajuste,
      disponivel: acc.disponivel + c.disponivel,
    };
  }, { total: 0, alugado: 0, ajuste: 0, disponivel: 0 });
}

// status de UM tamanho específico
export function statusVariante(produto, tam, trans, ajustes) {
  const c = contagemVariante(produto, tam, trans, ajustes);
  if (c.total === 0) return 'Indisponível';
  if (c.disponivel > 0) return 'Disponível';
  if (c.ajuste > 0 && c.alugado === 0) return 'Em Ajuste';
  if (c.alugado > 0) return 'Alugado';
  return 'Indisponível';
}

// status agregado do produto (para exibição no card): "Disponível" se qualquer
// tamanho estiver livre; senão o status predominante; "Misto" quando há mais de
// um status relevante entre os tamanhos ativos.
export function statusProduto(produto, trans, ajustes) {
  const statuses = (produto.variantes || []).map((v) => statusVariante(produto, v.tam, trans, ajustes));
  if (statuses.length === 0) return 'Indisponível';
  if (statuses.every((s) => s === 'Indisponível')) return 'Indisponível';
  if (statuses.some((s) => s === 'Disponível')) return 'Disponível';
  const naoIndisp = statuses.filter((s) => s !== 'Indisponível');
  const unico = new Set(naoIndisp);
  if (unico.size === 1) return [...unico][0];
  return 'Misto';
}

// Módulo 5 — flexibilidade de tamanho:
// procura, dentro da grade do MESMO produto, o tamanho pedido; se esgotado,
// procura o próximo tamanho maior disponível e sinaliza necessidade de ajuste.
export function buscarTamanhoComFlexibilidade(produto, tamDesejado, retirada, devolucao, trans, ajustes) {
  const exata = checkDisponibilidade(produto, tamDesejado, retirada, devolucao, trans, ajustes);
  if (exata.disponivel) return { tam: tamDesejado, precisaAjuste: false, disponivel: true };

  for (const tamMaior of largerSizes(tamDesejado)) {
    if (!getVariante(produto, tamMaior)) continue;
    const disp = checkDisponibilidade(produto, tamMaior, retirada, devolucao, trans, ajustes);
    if (disp.disponivel) return { tam: tamMaior, precisaAjuste: true, disponivel: true };
  }

  return { tam: null, precisaAjuste: false, disponivel: false };
}

// ── Controle de pacotes padronizados (módulo Vendas e Locações · Pacotes) ──────
// Comparecimento = ter um número de contrato vinculado ("Ao salvar um número de
// contrato, o participante será considerado comparecido automaticamente").
// Devolução continua sendo um passo separado, posterior.
export function integranteCompareceu(integrante) {
  return !!(integrante.numeroContrato && String(integrante.numeroContrato).trim());
}

export function statusIntegrante(trans, integrante) {
  if (integrante.devolvido) return 'Devolvido';
  if (integranteCompareceu(integrante)) return 'Com o cliente';
  const hoje = new Date().toISOString().slice(0, 10);
  if (trans.limiteComparecimento && hoje > trans.limiteComparecimento) return 'Comparecimento pendente';
  return 'Aguardando retirada';
}

// contagem de comparecimento do pacote inteiro
export function comparecimentoPacote(trans) {
  const integrantes = trans.integrantes || [];
  const compareceram = integrantes.filter(integranteCompareceu).length;
  return { total: integrantes.length, compareceram, faltam: integrantes.length - compareceram };
}

// pagamento em dia? ('Pago' ou 'Incluso no pacote' contam como quitado)
export function integrantePago(i) {
  return i.pagamento === 'Pago' || i.pagamento === 'Incluso no pacote';
}

// resumo de pagamentos do grupo — barra de progresso e filtros do Portal do noivo
export function pagamentosPacote(trans) {
  const integrantes = trans.integrantes || [];
  const pagos = integrantes.filter(integrantePago).length;
  return { total: integrantes.length, pagos, aPagar: integrantes.length - pagos };
}

// status do pacote na lista "Todos os pacotes": Grupo completo / N pendente(s) / Prazo vencido
export function statusPacote(trans) {
  const { total, faltam } = comparecimentoPacote(trans);
  if (total === 0 || faltam === 0) return { nivel: 'completo', texto: 'Grupo completo' };
  const hoje = new Date().toISOString().slice(0, 10);
  if (trans.limiteComparecimento && hoje > trans.limiteComparecimento) {
    return { nivel: 'atraso', texto: `Prazo vencido · ${faltam} pendente(s)` };
  }
  return { nivel: 'pendente', texto: `${faltam} pendente(s)` };
}

// alerta de prazo mostrado no topo do detalhe do pacote
export function alertaPacote(trans) {
  if (trans.tipo !== 'locacao_padronizada') return null;
  const { faltam } = comparecimentoPacote(trans);
  if (faltam === 0) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  if (trans.limiteComparecimento && hoje > trans.limiteComparecimento) {
    return { nivel: 'atraso', texto: `Data-limite atingida. Ainda existem ${faltam} participante(s) que não compareceram.` };
  }
  return null;
}
