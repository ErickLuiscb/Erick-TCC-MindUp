# 🧠 Back-end (API)

Este projeto corresponde ao **Back-end**, desenvolvido em **Laravel**, responsável por fornecer a API REST utilizada pelo front-end em React.

A API possui:
- Autenticação com Laravel Sanctum
- Controle de permissões (usuário / psicólogo / admin)
- CRUD de vídeos
- CRUD de anotações
- Upload de arquivos
- Proteção de rotas

---

## 🛠️ Tecnologias Utilizadas

- **PHP 8.2+**
- **Laravel 11**
- **Laravel Sanctum**
- **MySQL**
- **Eloquent ORM**
- **Migrations & Seeders**
- **API Resources**

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **PHP 8.2 ou superior**
- **Composer**
- **MySQL**
- **Docker + Docker Compose** (opcional, caso utilize Laravel Sail)
- **Node.js** (opcional, apenas para build de assets)

---

## 📦 Instalação do Projeto

1. Clone o repositório do back-end:
```bash
git clone <url-do-repositorio-back>


Acesse a pasta do projeto:

cd backend

Instale as dependências do Laravel:

composer install

⚙️ Configuração do Ambiente

Crie o arquivo .env:

cp .env.example .env

Configure o banco de dados no .env:

DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=LaravelDockerImagem
DB_USERNAME=LaravelDockerImagem
DB_PASSWORD=password
FORWARD_DB_PORT=5433


Gere a chave da aplicação:

php artisan key:generate

🗄️ Banco de Dados
Rodar as migrations e seeders

⚠️ Este comando apaga e recria o banco de dados.

php artisan migrate:fresh --seed


Isso irá:

Criar todas as tabelas

Criar usuários iniciais (admin, psicólogo e usuário)

Preparar o ambiente para testes

🔐 Autenticação

A autenticação é feita utilizando Laravel Sanctum.

Fluxo:

Login gera token

Token é enviado via Authorization: Bearer

Permissões são controladas via abilities

Exemplo de abilities:

admin

publicador

user

📂 Upload de Arquivos

Para que o upload de vídeos funcione corretamente:

php artisan storage:link


Isso cria o link simbólico:

public/storage → storage/app/public

▶️ Executando a API
Sem Docker
php artisan serve


API disponível em:

http://localhost:8000

Com Laravel Sail (Docker)
./vendor/bin/sail up -d


Principais Rotas da API
Autenticação

POST /api/login

POST /api/register

POST /api/logout

GET /api/me

Vídeos

GET /api/videosapi → vídeos públicos

GET /api/videosapi/{id} → visualizar vídeo

GET /api/dashboard/videos → vídeos do psicólogo

POST /api/videosapi → criar vídeo

PUT /api/videosapi/{id} → editar vídeo

DELETE /api/videosapi/{id} → excluir vídeo

Anotações

GET /api/anotacoesapi → anotações do usuário

POST /api/anotacoesapi

PUT /api/anotacoesapi/{id}

DELETE /api/anotacoesapi/{id}

👥 Regras de Acesso
Usuário comum

Pode assistir vídeos

Criar, editar e excluir suas próprias anotações

Psicólogo / Admin

Todas as permissões do usuário comum

Acesso ao dashboard

Criar, editar e excluir apenas os próprios vídeos

Não visualiza anotações de outros usuários

📎 Observações Importantes

Todas as rotas privadas usam auth:sanctum

O controle de acesso é feito no controller

O front depende totalmente desta API

Autor:
Projeto desenvolvido para fins acadêmicos - Érick Luis Capera Barneche;
