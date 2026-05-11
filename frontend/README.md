# 🎥  Projeto Parte Front-end

Este projeto corresponde ao **Front-end**, desenvolvido com **React + Vite + TailWind**, consumindo uma API em Laravel.  
A aplicação possui autenticação, controle de permissões e CRUD de vídeos e anotações.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **Vite**
- **React Router**
- **Axios**
- **Tailwind CSS**
- **Cypress (Testes E2E)**
- **Jest / Testing Library (Testes unitários)**
- **ESLint**

---

## 📋 Pré-requisitos

Antes de iniciar, você precisa ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Back-end da aplicação em execução** (Laravel + API)

> ⚠️ Importante: o front depende da API para funcionar corretamente.

---

## 📦 Instalação do Projeto

1. Clone o repositório do front-end:
```bash
git clone <url-do-repositorio-front>


Instale as dependências:

npm install


ou

yarn install

▶️ Executando a Aplicação

Para rodar o projeto em ambiente de desenvolvimento:

npm run dev
ou
yarn dev

A aplicação ficará disponível em:
http://localhost:5173
ou 
http://localhost:5174
(ou outra porta indicada no terminal)

🔗 Configuração da API

Certifique-se de que o back-end esteja rodando corretamente.

O arquivo responsável pela comunicação com a API é:

src/service/api.js

Verifique se a baseURL está apontando para o endereço correto do back-end, por exemplo:

http://localhost:8000/api

🧪 Testes
Testes End-to-End (Cypress)

Para abrir o Cypress:

npx cypress open

Ou para rodar os testes em modo headless:

npx cypress run


Os testes cobrem:
Cadastro;
Login;
Permissões;
CRUD completo de vídeos;
Dashboard do psicólogo;
Testes Unitários;

Para executar os testes unitários:
npm test
ou
yarn test

📂 Scripts Disponíveis

npm run dev → inicia o servidor de desenvolvimento

npm run build → gera build de produção

npm run preview → visualiza o build

npm run lint → analisa o código com ESLint

👥 Perfis de Usuário
Usuário comum

Pode assistir vídeos

Criar, editar e excluir suas próprias anotações

Psicólogo / Admin

Todas as permissões do usuário comum

Acesso ao Dashboard

Pode criar, editar e excluir apenas os próprios vídeos

📌 Observações Importantes

O front não funciona sem o back-end ativo

Upload de vídeos depende do storage configurado no servidor

As permissões são controladas via autenticação e tokens

Autor:
Projeto desenvolvido para fins acadêmicos - Érick Luis Capera Barneche;