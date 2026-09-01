// Lista única de humores disponíveis nas anotações.
// Precisa ficar espelhada com app/Support/Humores.php no backend
// (mesmas chaves em "valor"). Para adicionar um novo humor no futuro,
// basta acrescentar um objeto aqui — todas as telas que usam essa lista
// (criar, editar, listagem, detalhe) atualizam sozinhas.
export const HUMORES = [
  { valor: "feliz", emoji: "😄", label: "Feliz" },
  { valor: "calmo", emoji: "😌", label: "Calmo(a)" },
  { valor: "neutro", emoji: "😐", label: "Neutro" },
  { valor: "triste", emoji: "😢", label: "Triste" },
  { valor: "ansioso", emoji: "😰", label: "Ansioso(a)" },
  { valor: "irritado", emoji: "😠", label: "Irritado(a)" },
  { valor: "cansado", emoji: "😴", label: "Cansado(a)" },
  { valor: "grato", emoji: "🙏", label: "Grato(a)" },
];

export function infoHumor(valor) {
  return HUMORES.find((h) => h.valor === valor) ?? null;
}
