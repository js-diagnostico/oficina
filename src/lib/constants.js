export const COLORS = {
  ink: '#1B1B1B',
  paper: '#F5F4F0',
  card: '#FFFFFF',
  red: '#E2242B',
  redDark: '#B81920',
  redSoft: '#FBE1DF',
  navy: '#233A7E',
  navySoft: '#DEE4F5',
  line: '#E2DED3',
  lineStrong: '#C9C4B6',
  textMuted: '#726D62',
  green: '#2F7D52',
  greenSoft: '#DEF2E6',
  gold: '#B7791F',
  goldSoft: '#FBEFD4',
  maroon: '#8B3A3A',
  maroonSoft: '#F1E0DD',
};

export const STATUS = {
  aberta: { label: 'Aberta', fg: COLORS.gold, bg: COLORS.goldSoft },
  andamento: { label: 'Em andamento', fg: COLORS.navy, bg: COLORS.navySoft },
  concluida: { label: 'Concluída', fg: COLORS.green, bg: COLORS.greenSoft },
  cancelada: { label: 'Cancelada', fg: COLORS.maroon, bg: COLORS.maroonSoft },
};

export const PAPEL_FUNCIONARIO = {
  mecanico: 'Mecânico',
  vendedor: 'Vendedor',
  ambos: 'Mecânico e vendedor',
};

export const PAPEL_USUARIO = {
  admin: 'Dono / Administrador',
  funcionario: 'Funcionário',
};

export const ABAS_FUNCIONARIO = ['dashboard', 'form', 'view', 'clientes', 'servicos', 'estoque'];

export const CATEGORIAS_SERVICO = ['Populares', 'Intermediários', 'SUV', 'Caminhonete', 'Premium', 'Híbrido', '100% Elétrico'];

export const FORMAS_PAGAMENTO = ['Dinheiro', 'PIX', 'Cartão de débito', 'Cartão de crédito à vista', 'Cartão de crédito parcelado', 'Boleto', 'Transferência', 'A combinar'];

export const CHECKLIST_PADRAO = ['Estepe', 'Macaco e chave de roda', 'Triângulo de segurança', 'Extintor', 'Tapetes', 'Rádio / som', 'Antena', 'Calotas / rodas', 'Retrovisores', 'Chave reserva', 'Documentos do veículo', 'Avarias na lataria (riscos/amassados)'];

export const STATUS_CHECKLIST = {
  ok: { label: 'OK', fg: '#2F7D52', bg: '#DEF2E6' },
  avariado: { label: 'Avariado', fg: '#E2242B', bg: '#FBE1DF' },
  ausente: { label: 'Não possui', fg: '#B7791F', bg: '#FBEFD4' },
};

let uidCounter = 0;
export const uid = () => `id-${Date.now()}-${uidCounter++}-${Math.random().toString(16).slice(2)}`;

export function emptyOS() {
  return {
    id: null,
    numero: null,
    cliente: { nome: '', telefone: '' },
    veiculo: { placa: '', modelo: '', ano: '', km: '', chassi: '' },
    problema: '',
    mecanicoId: '',
    vendedorId: '',
    dataEntrada: new Date().toISOString().slice(0, 10),
    previsao: '',
    servicos: [],
    pecas: [],
    observacoes: '',
    laudoTecnico: '',
    formaPagamento: '',
    garantiaDias: '',
    desconto: '',
    nivelCombustivel: '',
    checklist: CHECKLIST_PADRAO.map((nome) => ({ id: uid(), nome, status: '' })),
    avarias: [],
    status: 'aberta',
    createdAt: null,
    dataConclusao: null,
    estoqueBaixado: false,
  };
}
export function emptyCliente() { return { id: null, nome: '', telefone: '', documento: '', endereco: '', veiculos: [] }; }
export function emptyVeiculo() { return { id: uid(), placa: '', modelo: '', ano: '', chassi: '', manutencoes: [] }; }

// ---------- Decodificação gratuita do chassi (VIN) ----------
// Tabela parcial dos prefixos (WMI) mais comuns de fabricantes no Brasil. Não é uma consulta oficial,
// é só a leitura do padrão internacional do próprio número do chassi — por isso não tem custo nem precisa de internet.
export const WMI_TABELA = {
  '9BW': 'Volkswagen', '9BD': 'Fiat', '9BG': 'Chevrolet', '9BF': 'Ford',
  '9BR': 'Toyota', '93H': 'Honda', '9C2': 'Renault', '9BS': 'Scania',
  '935': 'Mitsubishi', '93X': 'Hyundai', '9BH': 'Hyundai', '9BP': 'Peugeot',
  '93Y': 'Citroën', '9BA': 'Audi', '9BM': 'Mercedes-Benz', '9BN': 'Nissan',
  '9BJ': 'Jeep',
};
// Código do 10º caractere do chassi = ano-modelo (padrão internacional, ciclo de 30 anos).
// Mapeado aqui para o ciclo 2010–2039, que cobre os veículos mais comuns numa oficina hoje.
export const ANO_CHASSI_TABELA = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019,
  L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, V: 2027, W: 2028, X: 2029,
  Y: 2030, '1': 2031, '2': 2032, '3': 2033, '4': 2034, '5': 2035, '6': 2036, '7': 2037, '8': 2038, '9': 2039,
};
export function decodificarChassi(chassi) {
  if (!chassi || chassi.length !== 17) return null;
  const c = chassi.toUpperCase();
  const marca = WMI_TABELA[c.slice(0, 3)] || null;
  const ano = ANO_CHASSI_TABELA[c[9]] || null;
  if (!marca && !ano) return null;
  return { marca, ano };
}

// ---------- Manutenções preventivas (lembretes por km/tempo) ----------
export const MANUTENCOES_SUGERIDAS = ['Troca de óleo', 'Correia dentada', 'Correia auxiliar', 'Pastilhas de freio', 'Filtro de ar', 'Filtro de combustível', 'Filtro de cabine', 'Velas de ignição', 'Bateria', 'Fluido de freio'];
export function emptyManutencao() { return { id: uid(), item: '', kmUltima: '', dataUltima: new Date().toISOString().slice(0, 10), intervaloKm: '', intervaloMeses: '' }; }
export function statusManutencao(m) {
  if (!m.dataUltima || !m.intervaloMeses) return { status: 'sem-dados', dataProxima: null, diasRestantes: null };
  const dataUltima = new Date(m.dataUltima + 'T00:00:00');
  const dataProxima = new Date(dataUltima);
  dataProxima.setMonth(dataProxima.getMonth() + (parseInt(m.intervaloMeses, 10) || 0));
  const hoje = new Date();
  const diasRestantes = Math.round((dataProxima - hoje) / (1000 * 60 * 60 * 24));
  let status = 'ok';
  if (diasRestantes < 0) status = 'vencido';
  else if (diasRestantes <= 30) status = 'proximo';
  return { status, dataProxima, diasRestantes };
}
export const STATUS_MANUTENCAO = {
  ok: { label: 'Em dia', fg: COLORS.green, bg: COLORS.greenSoft },
  proximo: { label: 'Vencendo', fg: COLORS.gold, bg: COLORS.goldSoft },
  vencido: { label: 'Vencido', fg: COLORS.red, bg: COLORS.redSoft },
  'sem-dados': { label: 'Sem data', fg: COLORS.textMuted, bg: '#EEECE6' },
};
export function emptyPeca() { return { id: null, codigo: '', descricao: '', categoria: '', custo: '', preco: '', estoqueAtual: '', estoqueMin: '' }; }
export function emptyFuncionario() { return { id: null, nome: '', papel: 'mecanico', percentual: '', telefone: '' }; }
export function emptyServicoCatalogo() { return { id: null, nome: '', categoria: CATEGORIAS_SERVICO[0], valorPadrao: '', descricao: '' }; }

export const totalServicos = (os) => (os.servicos || []).reduce((t, i) => t + (parseFloat(i.valor) || 0), 0);
export const totalPecas = (os) => (os.pecas || []).reduce((t, i) => t + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0);

export function totaisOS(os) {
  const totalServico = totalServicos(os);
  const totalProduto = totalPecas(os);
  const totalBruto = totalServico + totalProduto;
  const desconto = Math.min(parseFloat(os.desconto) || 0, totalBruto);
  const totalLiquido = totalBruto - desconto;
  // rateia o desconto proporcionalmente entre serviço e peça, para base de comissão
  const fracServico = totalBruto > 0 ? totalServico / totalBruto : 0;
  const fracProduto = totalBruto > 0 ? totalProduto / totalBruto : 0;
  const servicoLiquido = totalServico - desconto * fracServico;
  const produtoLiquido = totalProduto - desconto * fracProduto;
  return { totalServico, totalProduto, totalBruto, desconto, totalLiquido, servicoLiquido, produtoLiquido };
}
export const calcTotal = (os) => totaisOS(os).totalLiquido;

export const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
export const brDate = (str) => {
  if (!str) return '—';
  const d = new Date(str.length > 10 ? str : str + 'T00:00:00');
  if (isNaN(d)) return str;
  return d.toLocaleDateString('pt-BR');
};
export const monthKey = (isoStr) => {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
export const thisMonthKey = () => monthKey(new Date().toISOString());

export const inputCls = 'px-3 py-2 text-sm outline-none w-full';
