// Campos de senha ignoram espaços: a tecla de espaço não faz nada, e espaços
// vindos de colagem (Ctrl+V) ou preenchimento automático são removidos.
export const semEspacos = (valor) => valor.replace(/\s/g, "");

export const bloquearEspaco = (e) => {
  if (e.key === " ") e.preventDefault();
};
