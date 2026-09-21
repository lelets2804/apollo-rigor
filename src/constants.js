// Tokens de cor — resolvidos via CSS variables (ver index.css), para que Light/Dark
// funcionem sem que cada componente precise saber qual tema está ativo.
export const C = {
  bg:         'var(--bg)',
  bgElevated: 'var(--bg-elevated)',
  card:       'var(--card)',
  sidebar:    'var(--sidebar)',
  sidebarText:'var(--sidebar-text)',
  inputBg:    'var(--input-bg)',
  border:     'var(--border)',
  borderSoft: 'var(--border-soft)',
  gold:       'var(--gold)',
  goldDim:    'var(--gold-dim)',
  goldText:   'var(--gold-text)',
  goldStrong: 'var(--gold-strong)',
  text:       'var(--text)',
  textSub:    'var(--text-sub)',
  textMuted:  'var(--text-muted)',
  shadow:     'var(--shadow)',
  accentInk:  'var(--accent-ink)',
  paper:      'var(--paper)',
  fontDisplay:'var(--font-display)',
  fontSans:   'var(--font-sans)',
  fontMono:   'var(--font-mono)',
  radius:     'var(--radius)',
  radiusSm:   'var(--radius-sm)',
};

// aplicado em spans/p que mostram números, datas, tamanhos, valores e nº de contrato —
// garante algarismos tabulares (IBM Plex Mono) para leitura de dados operacionais.
export const MONO = { fontFamily: 'var(--font-mono)', fontFeatureSettings: "'tnum' 1, 'zero' 1" };

// ── Status de estoque (Módulo 4) ──────────────────────────────
export const STATUS_MAP = {
  'Disponível':   { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
  'Alugado':      { color: 'var(--status-orange-fg)', bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)' },
  'Em Ajuste':    { color: 'var(--status-yellow-fg)', bg: 'var(--status-yellow-bg)', border: 'var(--status-yellow-border)' },
  'Indisponível': { color: 'var(--status-red-fg)',    bg: 'var(--status-red-bg)',    border: 'var(--status-red-border)' },
  'Vendido':      { color: 'var(--status-grey-fg)',   bg: 'var(--status-grey-bg)',   border: 'var(--status-grey-border)' },
  'Misto':        { color: 'var(--status-blue-fg)',   bg: 'var(--status-blue-bg)',   border: 'var(--status-blue-border)' },
};

export const AJUSTE_MAP = {
  'Pendente':   { color: 'var(--status-grey-fg)', bg: 'var(--status-grey-bg)', border: 'var(--status-grey-border)' },
  'Em costura': { color: 'var(--status-blue-fg)', bg: 'var(--status-blue-bg)', border: 'var(--status-blue-border)' },
  'Concluído':  { color: 'var(--status-green-fg)',bg: 'var(--status-green-bg)',border: 'var(--status-green-border)' },
};

export const CONTRATO_MAP = {
  'Rascunho':                      { color: 'var(--status-grey-fg)',  bg: 'var(--status-grey-bg)',  border: 'var(--status-grey-border)' },
  'Aguardando assinatura loja':    { color: 'var(--status-orange-fg)',bg: 'var(--status-orange-bg)',border: 'var(--status-orange-border)' },
  'Aguardando assinatura cliente': { color: 'var(--status-blue-fg)',  bg: 'var(--status-blue-bg)',  border: 'var(--status-blue-border)' },
  'Confirmado':                    { color: 'var(--status-green-fg)', bg: 'var(--status-green-bg)', border: 'var(--status-green-border)' },
};

// ── Status individual de um integrante de pacote padronizado (módulo Vendas e Locações · Pacotes) ──
export const INTEGRANTE_STATUS_MAP = {
  'Aguardando retirada':     { color: 'var(--status-grey-fg)',   bg: 'var(--status-grey-bg)',   border: 'var(--status-grey-border)' },
  'Comparecimento pendente': { color: 'var(--status-orange-fg)', bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)' },
  'Com o cliente':           { color: 'var(--status-blue-fg)',   bg: 'var(--status-blue-bg)',   border: 'var(--status-blue-border)' },
  'Devolvido':               { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
  'Atrasado':                { color: 'var(--status-red-fg)',    bg: 'var(--status-red-bg)',    border: 'var(--status-red-border)' },
};

// papéis possíveis dos integrantes autorizados a retirar trajes num pacote padronizado
export const PAPEIS_PADRONIZADO = ['Noivo(a)', 'Padrinho', 'Madrinha', 'Pai', 'Mãe', 'Pajem', 'Convidado'];

// ── Status de pagamento de integrante (Pacotes Padronizados) ─────
// Mesma paleta de status usada no resto do app (STATUS_MAP / CONTRATO_MAP / AJUSTE_MAP).
export const PAGAMENTO_MAP = {
  'Pendente':          { color: 'var(--status-orange-fg)', bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)' },
  'Parcial':           { color: 'var(--status-yellow-fg)', bg: 'var(--status-yellow-bg)', border: 'var(--status-yellow-border)' },
  'Pago':              { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
  'Incluso no pacote': { color: 'var(--status-grey-fg)',   bg: 'var(--status-grey-bg)',   border: 'var(--status-grey-border)' },
};
export const PAGAMENTO_OPCOES = ['Pendente', 'Parcial', 'Pago', 'Incluso no pacote'];

export const stockInfo = (qtd) => {
  if (qtd === 0) return { color: 'var(--status-red-fg)',    bg: 'var(--status-red-bg)',    border: 'var(--status-red-border)',    label: 'Esgotado' };
  if (qtd <= 2)  return { color: 'var(--status-orange-fg)', bg: 'var(--status-orange-bg)', border: 'var(--status-orange-border)', label: 'Baixo' };
                 return { color: 'var(--status-green-fg)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)',  label: 'Normal' };
};

// ── Catálogo (Módulo 1) ────────────────────────────────────────
export const CATEGORIAS = ['Terno', 'Vestido', 'Sapato', 'Gravata', 'Camisa', 'Acessório'];
export const COLECOES   = ['Clássica', 'Verão 2026', 'Inverno 2026', 'Noivos Premium', 'Black Tie'];
export const TECIDOS    = ['Lã Fria', 'Linho', 'Algodão', 'Poliéster', 'Seda', 'Couro', 'Renda'];
export const LINHAS     = ['Padronizada', 'Premium'];

// ordem de tamanhos para a grade e para a lógica de flexibilidade do ateliê
export const NUMERIC_SIZES = Array.from({ length: 24 }, (_, i) => String(34 + i)); // 34..57
export const LETTER_SIZES  = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
export const TAM_OPTIONS   = [...LETTER_SIZES, ...NUMERIC_SIZES];

export function sizeFamily(tam) {
  return LETTER_SIZES.includes(tam) ? LETTER_SIZES : NUMERIC_SIZES;
}

// tamanhos maiores que `tam`, na mesma família, em ordem crescente de proximidade
export function largerSizes(tam) {
  const fam = sizeFamily(tam);
  const idx = fam.indexOf(tam);
  if (idx === -1) return [];
  return fam.slice(idx + 1);
}

export const fmt     = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
export const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—';

const UNS = 'https://images.unsplash.com/photo';

// ── Dados iniciais ──────────────────────────────────────────────
// Cada produto é um MODELO/COLEÇÃO único (nome + cor). O estoque por tamanho vive em
// `variantes`: [{ tam, qtd }]. Isso evita cadastrar o mesmo modelo várias vezes — o
// tamanho vira apenas mais uma linha da grade do produto, com sua própria quantidade.
export const PRODUTOS_INIT = [
  { id: 1, nome: 'Terno Oxford Slim',      categoria: 'Terno',   colecao: 'Clássica',       tecido: 'Lã Fria',   cor: 'Azul Marinho', linha: 'Padronizada', aluguel: 180, venda: 850,
    foto: `${UNS}-1507679799987-c73779587ccf?w=480&h=640&fit=crop&q=80`,
    variantes: [{ tam: 'PP', qtd: 1 }, { tam: 'P', qtd: 2 }, { tam: 'M', qtd: 4 }, { tam: 'G', qtd: 2 }, { tam: 'GG', qtd: 0 }] },
  { id: 2, nome: 'Smoking Black Tie',       categoria: 'Terno',   colecao: 'Black Tie',      tecido: 'Lã Fria',   cor: 'Preto',         linha: 'Premium',      aluguel: 280, venda: 1200,
    foto: '/produtos/smoking-black-tie.jpg',
    variantes: [{ tam: 'P', qtd: 1 }, { tam: 'M', qtd: 2 }, { tam: 'G', qtd: 2 }, { tam: 'GG', qtd: 1 }] },
  { id: 3, nome: 'Terno Casamento Marfim',  categoria: 'Terno',   colecao: 'Noivos Premium', tecido: 'Linho',     cor: 'Off-White',     linha: 'Premium',      aluguel: 220, venda: 1100,
    foto: '/produtos/terno-casamento-marfim.jpg',
    variantes: [{ tam: 'PP', qtd: 5 }, { tam: 'P', qtd: 3 }, { tam: 'M', qtd: 3 }] },
  { id: 4, nome: 'Terno Cinza Oxford',      categoria: 'Terno',   colecao: 'Clássica',       tecido: 'Lã Fria',   cor: 'Cinza Claro',   linha: 'Padronizada', aluguel: 160, venda: 780,
    foto: '/produtos/terno-cinza-oxford.webp',
    variantes: [{ tam: 'P', qtd: 0 }, { tam: 'M', qtd: 1 }, { tam: 'G', qtd: 0 }] },
  { id: 5, nome: 'Conjunto Padrinho Royal', categoria: 'Terno',   colecao: 'Noivos Premium', tecido: 'Lã Fria',   cor: 'Azul Royal',    linha: 'Padronizada', aluguel: 150, venda: 680,
    foto: '/produtos/conjunto-padrinho-royal.jpg',
    variantes: [{ tam: 'P', qtd: 1 }, { tam: 'M', qtd: 1 }, { tam: 'G', qtd: 3 }, { tam: 'GG', qtd: 1 }] },
  { id: 6, nome: 'Terno Palazzo Classic',   categoria: 'Terno',   colecao: 'Clássica',       tecido: 'Poliéster', cor: 'Preto',         linha: 'Padronizada', aluguel: 200, venda: 950,
    foto: '/produtos/terno-palazzo-classic.jpg',
    variantes: [{ tam: 'P', qtd: 2 }, { tam: 'M', qtd: 3 }, { tam: 'G', qtd: 1 }] },
  { id: 7, nome: 'Vestido Madrinha Ilhéu',  categoria: 'Vestido', colecao: 'Verão 2026',     tecido: 'Seda',      cor: 'Verde Sálvia',  linha: 'Premium',      aluguel: 240, venda: 980,
    foto: `${UNS}-1595777457583-95e059d581b8?w=480&h=640&fit=crop&q=80`,
    variantes: [{ tam: 'PP', qtd: 1 }, { tam: 'P', qtd: 2 }, { tam: 'M', qtd: 1 }] },
  { id: 8, nome: 'Sapato Social Verniz',    categoria: 'Sapato',  colecao: 'Black Tie',      tecido: 'Couro',     cor: 'Preto',         linha: 'Premium',      aluguel: 60,  venda: 420,
    foto: '/produtos/sapato-social-verniz.webp',
    variantes: [{ tam: '39', qtd: 2 }, { tam: '40', qtd: 3 }, { tam: '41', qtd: 4 }, { tam: '42', qtd: 2 }] },
  { id: 9, nome: 'Gravata Seda Bordô',      categoria: 'Gravata', colecao: 'Clássica',       tecido: 'Seda',      cor: 'Bordô',         linha: 'Padronizada', aluguel: 25,  venda: 120,
    foto: '/produtos/gravata-seda-bordo.jpg',
    variantes: [{ tam: 'Único', qtd: 8 }] },
  { id: 10, nome: 'Camisa Social Verde',    categoria: 'Camisa',  colecao: 'Clássica',       tecido: 'Algodão',   cor: 'Verde',         linha: 'Padronizada', aluguel: 45,  venda: 220,
    foto: '/produtos/camisa-social-verde.webp',
    variantes: [{ tam: '43', qtd: 3 }, { tam: '44', qtd: 2 }, { tam: '45', qtd: 0 }, { tam: '46', qtd: 1 }, { tam: '47', qtd: 2 }] },
];

// tipo: 'venda' | 'locacao_avulsa' | 'locacao_padronizada'
// referência ao item alugado/vendido agora é (produtoId, tam) — não mais um id de linha por tamanho.
export const TRANS_INIT = [
  {
    id: 1, tipo: 'locacao_avulsa', produtoId: 2, tamPedido: 'G', tamEntregue: 'G',
    cliente: 'Carlos Eduardo Mello', tel: '(11) 98765-4321', documento: '123.456.789-00',
    retirada: '2026-08-14', devolucao: '2026-08-22', valor: 280,
    data: '2026-08-05', devolvido: false, avarias: '',
    contrato: 'Confirmado', noivos: '', dataEvento: '', integrantes: [],
  },
  {
    id: 2, tipo: 'venda', produtoId: 5, tamPedido: 'G', tamEntregue: 'G',
    cliente: 'João Paulo Ferreira', tel: '(11) 91234-5678', documento: '987.654.321-00',
    retirada: null, devolucao: null, valor: 680,
    data: '2026-07-28', devolvido: null, avarias: '',
    contrato: 'Confirmado', noivos: '', dataEvento: '', integrantes: [],
  },
  {
    id: 3, tipo: 'locacao_avulsa', produtoId: 1, tamPedido: 'M', tamEntregue: 'M',
    cliente: 'Rafael Augusto Lima', tel: '(11) 99876-5432', documento: '111.222.333-44',
    retirada: '2026-07-20', devolucao: '2026-07-27', valor: 180,
    data: '2026-07-18', devolvido: true, avarias: 'Nenhuma avaria identificada.',
    contrato: 'Confirmado', noivos: '', dataEvento: '', integrantes: [],
  },
  {
    id: 4, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Cerimonial Silva & Andrade', tel: '(11) 93333-2222', documento: '',
    retirada: '2026-09-10', devolucao: '2026-09-16', valor: 1350,
    data: '2026-08-01', devolvido: false, avarias: '',
    contrato: 'Aguardando assinatura cliente',
    noivos: 'Marcos Silva & Ana Andrade', dataEvento: '2026-09-13',
    dataFechamento: '2026-08-01', limiteComparecimento: '2026-08-25',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Marcos Silva',  documento: '222.333.444-55', produtoId: 3, tam: 'PP', papel: 'Noivo',    tamEntregue: 'PP',
        numeroContrato: '1201', precoNegociado: 220, excecaoPreco: '', pagamento: 'Parcial', devolvido: false, avarias: '' },
      { nome: 'Pedro Andrade', documento: '333.444.555-66', produtoId: 5, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Sr. Andrade',   documento: '444.555.666-77', produtoId: 6, tam: 'M',  papel: 'Pai',      tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 5, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Bruno Carvalho & Letícia Nunes', tel: '(11) 94444-1010', documento: '',
    retirada: '2026-07-02', devolucao: '2026-07-08', valor: 880,
    data: '2026-06-10', devolvido: false, avarias: '',
    contrato: 'Confirmado',
    noivos: 'Bruno Carvalho & Letícia Nunes', dataEvento: '2026-07-05',
    dataFechamento: '2026-06-10', limiteComparecimento: '2026-06-25',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Bruno Carvalho',   documento: '505.606.707-08', produtoId: 3, tam: 'M',  papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '1102', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pago', devolvido: true,  avarias: 'Nenhuma avaria identificada.' },
      { nome: 'Thiago Nunes',     documento: '606.707.808-09', produtoId: 1, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '1103', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pago', devolvido: true,  avarias: 'Nenhuma avaria identificada.' },
      { nome: 'Rodrigo Carvalho', documento: '707.808.909-10', produtoId: 6, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '1104', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pago', devolvido: true,  avarias: '' },
      { nome: 'Sr. Nunes',        documento: '808.909.010-11', produtoId: 2, tam: 'GG', papel: 'Pai',      tamEntregue: 'GG',
        numeroContrato: '1105', precoNegociado: 280, excecaoPreco: '', pagamento: 'Pago', devolvido: true,  avarias: '' },
    ],
  },
  {
    id: 6, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'André Tavares & Camila Rocha', tel: '(11) 95555-2020', documento: '',
    retirada: '2026-10-15', devolucao: '2026-10-21', valor: 750,
    data: '2026-08-12', devolvido: false, avarias: '',
    contrato: 'Aguardando assinatura loja',
    noivos: 'André Tavares & Camila Rocha', dataEvento: '2026-10-18',
    dataFechamento: '2026-08-12', limiteComparecimento: '2026-10-01',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'André Tavares',    documento: '111.212.313-14', produtoId: 3, tam: 'M', papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 220, excecaoPreco: '', pagamento: 'Parcial',  devolvido: false, avarias: '' },
      { nome: 'Felipe Rocha',     documento: '212.313.414-15', produtoId: 5, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Gustavo Tavares',  documento: '313.414.515-16', produtoId: 1, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Rodrigo Rocha',    documento: '414.515.616-17', produtoId: 6, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 7, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Diego Moraes & Patrícia Lemos', tel: '(11) 96666-3030', documento: '',
    retirada: '2026-08-27', devolucao: '2026-09-02', valor: 750,
    data: '2026-07-30', devolvido: false, avarias: '',
    contrato: 'Confirmado',
    noivos: 'Diego Moraes & Patrícia Lemos', dataEvento: '2026-08-30',
    dataFechamento: '2026-07-30', limiteComparecimento: '2026-08-20',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Diego Moraes',    documento: '515.616.717-18', produtoId: 3, tam: 'P', papel: 'Noivo',    tamEntregue: 'P',
        numeroContrato: '1301', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pago',     devolvido: false, avarias: '' },
      { nome: 'Henrique Lemos',  documento: '616.717.818-19', produtoId: 5, tam: 'G', papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '1302', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pago',     devolvido: false, avarias: '' },
      { nome: 'Otávio Moraes',   documento: '717.818.919-20', produtoId: 6, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Sr. Lemos',       documento: '818.919.020-21', produtoId: 1, tam: 'P', papel: 'Pai',      tamEntregue: 'P',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Parcial',  devolvido: false, avarias: '' },
    ],
  },
  {
    id: 8, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Vinícius Prado & Isabela Fonseca', tel: '(11) 97777-4040', documento: '',
    retirada: '2026-11-19', devolucao: '2026-11-25', valor: 700,
    data: '2026-08-24', devolvido: false, avarias: '',
    contrato: 'Rascunho',
    noivos: 'Vinícius Prado & Isabela Fonseca', dataEvento: '2026-11-22',
    dataFechamento: '2026-08-24', limiteComparecimento: '2026-11-08',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Vinícius Prado',  documento: '919.020.121-22', produtoId: 3, tam: 'M', papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Lucas Fonseca',   documento: '020.121.222-23', produtoId: 2, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 280, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Caio Prado',      documento: '121.222.323-24', produtoId: 6, tam: 'P', papel: 'Padrinho', tamEntregue: 'P',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 9, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Eduardo Ramalho & Sofia Bittencourt', tel: '(11) 98888-5050', documento: '',
    retirada: '2026-06-17', devolucao: '2026-06-23', valor: 980,
    data: '2026-05-02', devolvido: false, avarias: '',
    contrato: 'Confirmado',
    noivos: 'Eduardo Ramalho & Sofia Bittencourt', dataEvento: '2026-06-20',
    dataFechamento: '2026-05-02', limiteComparecimento: '2026-06-05',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Eduardo Ramalho',   documento: '222.323.424-25', produtoId: 3, tam: 'P', papel: 'Noivo',    tamEntregue: 'P',
        numeroContrato: '1401', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pago', devolvido: true, avarias: 'Nenhuma avaria identificada.' },
      { nome: 'Marcelo Ramalho',   documento: '323.424.525-26', produtoId: 1, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '1402', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pago', devolvido: true, avarias: '' },
      { nome: 'Fábio Bittencourt', documento: '424.525.626-27', produtoId: 6, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '1403', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pago', devolvido: true, avarias: 'Pequena mancha na lapela — enviada à lavanderia.' },
      { nome: 'Ricardo Bittencourt', documento: '525.626.727-28', produtoId: 6, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '1404', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pago', devolvido: true, avarias: '' },
      { nome: 'Sr. Ramalho',       documento: '626.727.828-29', produtoId: 1, tam: 'P', papel: 'Pai',      tamEntregue: 'P',
        numeroContrato: '1405', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pago', devolvido: true, avarias: '' },
    ],
  },
  {
    id: 10, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Cerimonial Encanto / Rafael Queiroz & Beatriz Antunes', tel: '(11) 99999-6060', documento: '',
    retirada: '2027-02-11', devolucao: '2027-02-17', valor: 1010,
    data: '2026-08-19', devolvido: false, avarias: '',
    contrato: 'Aguardando assinatura cliente',
    noivos: 'Rafael Queiroz & Beatriz Antunes', dataEvento: '2027-02-14',
    dataFechamento: '2026-08-19', limiteComparecimento: '2027-01-30',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Rafael Queiroz',   documento: '727.828.929-30', produtoId: 3, tam: 'M',  papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 220, excecaoPreco: '', pagamento: 'Parcial',           devolvido: false, avarias: '' },
      { nome: 'Bruno Antunes',    documento: '828.929.030-31', produtoId: 5, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pendente',          devolvido: false, avarias: '' },
      { nome: 'Leonardo Queiroz', documento: '929.030.131-32', produtoId: 2, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 280, excecaoPreco: '', pagamento: 'Pendente',          devolvido: false, avarias: '' },
      { nome: 'Igor Antunes',     documento: '030.131.232-33', produtoId: 1, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pendente',          devolvido: false, avarias: '' },
      { nome: 'Theo Queiroz',     documento: '131.232.333-34', produtoId: 1, tam: 'PP', papel: 'Pajem',    tamEntregue: 'PP',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Incluso no pacote', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 11, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Gabriel Fontes & Marina Vasques', tel: '(11) 97070-7070', documento: '',
    retirada: '2026-09-24', devolucao: '2026-09-30', valor: 810,
    data: '2026-07-15', devolvido: false, avarias: '',
    contrato: 'Confirmado',
    noivos: 'Gabriel Fontes & Marina Vasques', dataEvento: '2026-09-27',
    dataFechamento: '2026-07-15', limiteComparecimento: '2026-09-10',
    trajeConfidencial: true,
    // senha que o casal usa para revelar o traje do noivo no portal (Área do cliente)
    senhaRevelacao: 'FiapNext26',
    // detalhamento da padronização por papel — mostrado nos cards do Portal do noivo
    padronizacao: {
      Noivo:    { corte: 'Slim · 2 botões', colete: 'Com colete', gravata: 'Laço em seda preta', lenco: 'Lenço dourado', nota: 'Acabamento cerimônia com vivo dourado na lapela.' },
      Padrinho: { corte: 'Slim · 2 botões', colete: 'Sem colete',  gravata: 'Gravata azul-marinho', lenco: 'Lenço azul-marinho' },
      Pai:      { corte: 'Slim · 2 botões', colete: 'Com colete',  gravata: 'Gravata grafite em seda', lenco: 'Lenço branco' },
    },
    integrantes: [
      { nome: 'Gabriel Fontes',   documento: '232.333.434-35', produtoId: 2, tam: 'M',  papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '1501', precoNegociado: 280, excecaoPreco: '', pagamento: 'Pago',     devolvido: false, avarias: '' },
      { nome: 'Diego Vasques',    documento: '333.434.535-36', produtoId: 6, tam: 'G',  papel: 'Padrinho', tamEntregue: 'G',
        numeroContrato: '1502', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pago',     devolvido: false, avarias: '' },
      { nome: 'Murilo Fontes',    documento: '434.535.636-37', produtoId: 5, tam: 'GG', papel: 'Padrinho', tamEntregue: 'GG',
        numeroContrato: '1503', precoNegociado: 150, excecaoPreco: '', pagamento: 'Parcial',  devolvido: false, avarias: '' },
      { nome: 'Sr. Vasques',      documento: '535.636.737-38', produtoId: 1, tam: 'G',  papel: 'Pai',      tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 12, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Lucas Amaral & Carolina Pires', tel: '(11) 96060-8080', documento: '',
    retirada: '2026-11-05', devolucao: '2026-11-11', valor: 600,
    data: '2026-08-22', devolvido: false, avarias: '',
    contrato: 'Rascunho',
    noivos: 'Lucas Amaral & Carolina Pires', dataEvento: '2026-11-08',
    dataFechamento: '2026-08-22', limiteComparecimento: '2026-10-25',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Lucas Amaral',    documento: '636.737.838-39', produtoId: 3, tam: 'P',  papel: 'Noivo',    tamEntregue: 'P',
        numeroContrato: '', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Gustavo Pires',   documento: '737.838.939-40', produtoId: 1, tam: 'P',  papel: 'Padrinho', tamEntregue: 'P',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Rafael Amaral',   documento: '838.939.040-41', produtoId: 6, tam: 'P',  papel: 'Padrinho', tamEntregue: 'P',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 13, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Henrique Salles & Débora Camargo', tel: '(11) 95050-9090', documento: '',
    retirada: '2027-04-22', devolucao: '2027-04-28', valor: 750,
    data: '2026-08-25', devolvido: false, avarias: '',
    contrato: 'Aguardando assinatura loja',
    noivos: 'Henrique Salles & Débora Camargo', dataEvento: '2027-04-25',
    dataFechamento: '2026-08-25', limiteComparecimento: '2027-04-05',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Henrique Salles',  documento: '939.040.141-42', produtoId: 3, tam: 'M', papel: 'Noivo',    tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 220, excecaoPreco: '', pagamento: 'Parcial',  devolvido: false, avarias: '' },
      { nome: 'Vitor Camargo',    documento: '040.141.242-43', produtoId: 1, tam: 'P', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: 'Desconto fidelidade — cliente recorrente', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'André Salles',     documento: '141.242.343-44', produtoId: 6, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
      { nome: 'Rodrigo Camargo',  documento: '242.343.444-45', produtoId: 5, tam: 'M', papel: 'Padrinho', tamEntregue: 'M',
        numeroContrato: '', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pendente', devolvido: false, avarias: '' },
    ],
  },
  {
    id: 14, tipo: 'locacao_padronizada', produtoId: null, tamPedido: '', tamEntregue: '',
    cliente: 'Paulo Nogueira & Tatiane Rios', tel: '(11) 94040-1212', documento: '',
    retirada: '2026-08-13', devolucao: '2026-08-19', valor: 750,
    data: '2026-07-01', devolvido: false, avarias: '',
    contrato: 'Confirmado',
    noivos: 'Paulo Nogueira & Tatiane Rios', dataEvento: '2026-08-16',
    dataFechamento: '2026-07-01', limiteComparecimento: '2026-08-01',
    trajeConfidencial: false,
    integrantes: [
      { nome: 'Paulo Nogueira',  documento: '343.444.545-46', produtoId: 3, tam: 'P',     papel: 'Noivo',     tamEntregue: 'P',
        numeroContrato: '1601', precoNegociado: 220, excecaoPreco: '', pagamento: 'Pago',              devolvido: true,  avarias: 'Nenhuma avaria identificada.' },
      { nome: 'Sérgio Rios',     documento: '444.545.646-47', produtoId: 5, tam: 'M',     papel: 'Padrinho',  tamEntregue: 'M',
        numeroContrato: '1602', precoNegociado: 150, excecaoPreco: '', pagamento: 'Pago',              devolvido: true,  avarias: '' },
      { nome: 'Wagner Nogueira', documento: '545.646.747-48', produtoId: 6, tam: 'G',     papel: 'Padrinho',  tamEntregue: 'G',
        numeroContrato: '', precoNegociado: 200, excecaoPreco: '', pagamento: 'Pendente',          devolvido: false, avarias: '' },
      { nome: 'Diego Rios',      documento: '646.747.848-49', produtoId: 1, tam: 'PP',    papel: 'Pajem',     tamEntregue: 'PP',
        numeroContrato: '', precoNegociado: 180, excecaoPreco: '', pagamento: 'Incluso no pacote', devolvido: false, avarias: '' },
    ],
  },
];

// status: 'Pendente' | 'Em costura' | 'Concluído'
export const AJUSTES_INIT = [
  { id: 1, produtoId: 4, transId: null, desc: 'Ajuste na cintura e bainha das calças', tamOriginal: 'M', tamEntregue: 'M', entrega: '2026-08-20', status: 'Em costura' },
];