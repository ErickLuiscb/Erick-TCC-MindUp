// Mapeamento central dos tipos de sugestão aceitos pelo backend
// (StoreSugestaoRequest: livro, filme, serie, anime, musica, podcast, documentario)
export const TIPOS_SUGESTAO = [
  { valor: "livro", label: "Livro", emoji: "📚" },
  { valor: "filme", label: "Filme", emoji: "🎬" },
  { valor: "serie", label: "Série", emoji: "📺" },
  { valor: "anime", label: "Anime", emoji: "🍥" },
  { valor: "musica", label: "Música", emoji: "🎵" },
  { valor: "podcast", label: "Podcast", emoji: "🎙️" },
  { valor: "documentario", label: "Documentário", emoji: "🎥" },
];

export function infoTipoSugestao(valor) {
  return (
    TIPOS_SUGESTAO.find((t) => t.valor === valor) ?? {
      valor,
      label: valor,
      emoji: "✨",
    }
  );
}

// Texto do botão de ação externa, adaptado ao tipo de mídia
export function acaoExternaLabel(valor) {
  switch (valor) {
    case "livro":
      return "Ver onde encontrar";
    case "filme":
    case "serie":
    case "anime":
    case "documentario":
      return "Assistir";
    case "musica":
    case "podcast":
      return "Ouvir";
    default:
      return "Acessar link";
  }
}
