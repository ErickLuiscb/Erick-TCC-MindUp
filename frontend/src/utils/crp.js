// Regiões dos Conselhos Regionais de Psicologia (CRP).

export const REGIOES_CRP = [
  { valor: 1, rotulo: "Distrito Federal - CRP 1ª Região" },
  { valor: 2, rotulo: "Pernambuco - CRP 2ª Região" },
  { valor: 3, rotulo: "Bahia - CRP 3ª Região" },
  { valor: 4, rotulo: "Minas Gerais - CRP 4ª Região" },
  { valor: 5, rotulo: "Rio de Janeiro - CRP 5ª Região" },
  { valor: 6, rotulo: "São Paulo - CRP 6ª Região" },
  { valor: 7, rotulo: "Rio Grande do Sul - CRP 7ª Região" },
  { valor: 8, rotulo: "Paraná - CRP 8ª Região" },
  { valor: 9, rotulo: "Goiás - CRP 9ª Região" },
  { valor: 10, rotulo: "Pará e Amapá - CRP 10ª Região" },
  { valor: 11, rotulo: "Ceará - CRP 11ª Região" },
  { valor: 12, rotulo: "Santa Catarina - CRP 12ª Região" },
  { valor: 13, rotulo: "Paraíba - CRP 13ª Região" },
  { valor: 14, rotulo: "Mato Grosso do Sul - CRP 14ª Região" },
  { valor: 15, rotulo: "Alagoas - CRP 15ª Região" },
  { valor: 16, rotulo: "Espírito Santo - CRP 16ª Região" },
  { valor: 17, rotulo: "Rio Grande do Norte - CRP 17ª Região" },
  { valor: 18, rotulo: "Mato Grosso - CRP 18ª Região" },
  { valor: 19, rotulo: "Sergipe - CRP 19ª Região" },
  { valor: 20, rotulo: "Amazonas e Roraima - CRP 20ª Região" },
  { valor: 21, rotulo: "Piauí - CRP 21ª Região" },
  { valor: 22, rotulo: "Maranhão - CRP 22ª Região" },
  { valor: 23, rotulo: "Tocantins - CRP 23ª Região" },
  { valor: 24, rotulo: "Acre e Rondônia - CRP 24ª Região" },
];

// Só dígitos, no máximo 11
export const apenasDigitosCpf = (valor) =>
  String(valor ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

// 12345678901 -> 123.456.789-01 (formata conforme digita)
export const formatarCpf = (valor) => {
  const d = apenasDigitosCpf(valor);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

// Confere os dígitos verificadores (mesma regra do backend)
export const cpfValido = (valor) => {
  const cpf = apenasDigitosCpf(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (let posicao = 9; posicao < 11; posicao++) {
    let soma = 0;
    for (let i = 0; i < posicao; i++) {
      soma += Number(cpf[i]) * (posicao + 1 - i);
    }
    const digito = ((10 * soma) % 11) % 10;
    if (Number(cpf[posicao]) !== digito) return false;
  }

  return true;
};

// Número do CRP: só dígitos, sem região nem símbolos (ex.: 31253)
export const crpNumeroValido = (valor) =>
  /^\d{1,10}$/.test(String(valor).trim());
