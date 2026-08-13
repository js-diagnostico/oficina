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
    veiculo: { placa: '', modelo: '', ano: '', km: '' },
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
    nivelCombustivel: '',
    checklist: CHECKLIST_PADRAO.map((nome) => ({ id: uid(), nome, status: '' })),
    status: 'aberta',
    createdAt: null,
    dataConclusao: null,
    estoqueBaixado: false,
  };
}
export function emptyCliente() { return { id: null, nome: '', telefone: '', documento: '', endereco: '', veiculos: [] }; }
export function emptyVeiculo() { return { id: uid(), placa: '', modelo: '', ano: '' }; }
export function emptyPeca() { return { id: null, codigo: '', descricao: '', categoria: '', custo: '', preco: '', estoqueAtual: '', estoqueMin: '' }; }
export function emptyFuncionario() { return { id: null, nome: '', papel: 'mecanico', percentual: '', telefone: '' }; }
export function emptyServicoCatalogo() { return { id: null, nome: '', categoria: CATEGORIAS_SERVICO[0], valorPadrao: '', descricao: '' }; }

export const totalServicos = (os) => (os.servicos || []).reduce((t, i) => t + (parseFloat(i.valor) || 0), 0);
export const totalPecas = (os) => (os.pecas || []).reduce((t, i) => t + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0);
export const calcTotal = (os) => totalServicos(os) + totalPecas(os);

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
