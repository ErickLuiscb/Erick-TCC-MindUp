// Mapeamento central dos tipos de mídia aceitos pelo backend
// (StoreAutoajudaRequest: enum 'imagem' | 'video')
export const TIPOS_MIDIA_AUTOAJUDA = [
  {
    valor: "imagem",
    label: "Imagem",
    emoji: "🖼️",
    extensoes: ["jpg", "jpeg", "png", "webp"],
    accept: "image/png, image/jpeg, image/webp",
  },
  {
    valor: "video",
    label: "Vídeo",
    emoji: "🎬",
    extensoes: ["mp4", "mov", "avi", "wmv", "webm", "mkv"],
    accept:
      "video/mp4, video/quicktime, video/x-msvideo, video/webm, video/x-matroska",
  },
];

export function infoTipoMidia(valor) {
  return (
    TIPOS_MIDIA_AUTOAJUDA.find((t) => t.valor === valor) ?? {
      valor,
      label: valor,
      emoji: "✨",
    }
  );
}
