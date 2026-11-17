// Dados falsos usados pelos testes. A API é sempre simulada: nenhum teste
// depende do backend, do banco ou de e-mail de verdade.

const GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// ---------- perfis (o que o login devolve e o que fica no localStorage) ----------

export const usuarioComum = (extra = {}) => ({
  usuario: {
    id: 1,
    nome: "Ana Teste",
    email: "ana@teste.com",
    tipo: "usuario",
    is_admin: false,
    ...extra,
  },
  abilities: [],
});

export const psicologoAprovado = (extra = {}) => ({
  usuario: {
    id: 20,
    nome: "Dra. Ana Souza",
    email: "dra.ana@teste.com",
    tipo: "psicologo",
    is_admin: false,
    crp: "12345",
    crp_regiao: 7,
    crp_status: "aprovado",
    ...extra,
  },
  abilities: ["publicador"],
});

export const psicologoPendente = (extra = {}) => ({
  usuario: {
    id: 21,
    nome: "Dr. Bruno Lima",
    email: "bruno@teste.com",
    tipo: "psicologo",
    is_admin: false,
    crp: "54321",
    crp_regiao: 7,
    crp_status: "pendente",
    ...extra,
  },
  abilities: [], // pendente entra sem a ability "publicador"
});

export const psicologoRejeitado = (
  motivo = "CRP não encontrado no conselho.",
) => psicologoPendente({ crp_status: "rejeitado", crp_motivo: motivo });

export const administrador = (extra = {}) => ({
  usuario: {
    id: 99,
    nome: "Admin Teste",
    email: "admin@teste.com",
    tipo: "usuario",
    is_admin: true,
    ...extra,
  },
  abilities: ["admin"],
});

// ---------- conteúdos ----------

export const autor = (extra = {}) => ({
  id: 20,
  nome: "Dra. Ana Souza",
  imagem_perfil: null,
  crp: "07/12345",
  ...extra,
});

const base = {
  descricao: "Descrição de teste do conteúdo.",
  created_at: "2026-11-01T10:00:00.000000Z",
  updated_at: "2026-11-01T10:00:00.000000Z",
  favoritado: false,
  quantidade_favoritos: 0,
  categorias: [{ id: 1, nome: "Ansiedade" }],
};

export const video = (extra = {}) => ({
  ...base,
  id: 1,
  titulo: "Respiração guiada",
  arquivo: "http://localhost/video.mp4",
  autor: autor(),
  ...extra,
});

export const artigo = (extra = {}) => ({
  ...base,
  id: 1,
  titulo: "Guia do sono",
  arquivo_pdf: "http://localhost/artigo.pdf",
  autor: autor(),
  ...extra,
});

export const autoajuda = (extra = {}) => ({
  ...base,
  id: 1,
  titulo: "Mapa de respiração",
  tipo_midia: "imagem",
  midia: GIF,
  autor: autor(),
  ...extra,
});

export const anotacao = (extra = {}) => ({
  id: 1,
  titulo: "Dia calmo",
  texto: "Foi tranquilo.",
  humor: "calmo",
  created_at: "2026-11-02T10:00:00.000000Z",
  updated_at: "2026-11-02T10:00:00.000000Z",
  ...extra,
});

// ---------- painel do admin ----------

export const pedido = (extra = {}) => ({
  id: 30,
  nome: "Ana Pendente",
  email: "ana.pendente@teste.com",
  email_verificado: true,
  imagem_perfil: null,
  crp: "12345",
  crp_regiao: 7,
  cpf: "52998224725",
  crp_status: "pendente",
  crp_motivo: null,
  crp_analisado_por: null,
  crp_analisado_em: null,
  created_at: "2026-11-10T12:00:00.000000Z",
  ...extra,
});
