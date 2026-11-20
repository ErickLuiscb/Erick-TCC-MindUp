<?php

namespace Tests\Feature;

use Tests\ApiTestCase;

class AuthTest extends ApiTestCase
{
    public function test_login_com_credenciais_corretas_retorna_token_e_usuario(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])
            ->assertOk()
            ->assertJsonStructure(['message', 'token', 'abilities', 'user'])
            ->assertJsonPath('abilities', [])
            ->assertJsonPath('user.email', 'ana@teste.com')
            ->assertJsonMissingPath('user.senha')
            ->assertJsonMissingPath('user.cpf');
    }

    public function test_login_com_senha_errada_retorna_401(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => 'errada'])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'E-mail ou senha incorretos.')
            ->assertJsonMissingPath('token');
    }

    public function test_login_com_email_inexistente_retorna_a_mesma_mensagem_da_senha_errada(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $senhaErrada = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => 'x'])->json('message');
        $emailInexistente = $this->postJson('/api/login', ['email' => 'ninguem@teste.com', 'senha' => 'x']);

        $emailInexistente->assertUnauthorized();
        // Não revela se o e-mail existe ou não
        $this->assertSame($senhaErrada, $emailInexistente->json('message'));
    }

    public function test_login_exige_email_e_senha(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'senha']);
    }

    public function test_login_bloqueado_enquanto_o_email_nao_for_confirmado(): void
    {
        $this->criarUsuario(['email' => 'novo@teste.com', 'email_verified_at' => null]);

        $this->postJson('/api/login', ['email' => 'novo@teste.com', 'senha' => '123456'])
            ->assertForbidden()
            ->assertJsonPath('email_nao_verificado', true)
            ->assertJsonMissingPath('token');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_usuario_comum_nao_recebe_abilities(): void
    {
        $this->criarUsuario(['email' => 'u@teste.com']);

        $this->postJson('/api/login', ['email' => 'u@teste.com', 'senha' => '123456'])
            ->assertJsonPath('abilities', []);
    }

    public function test_psicologo_aprovado_recebe_a_ability_publicador(): void
    {
        $this->criarPsicologo('aprovado', ['email' => 'psi@teste.com']);

        $this->postJson('/api/login', ['email' => 'psi@teste.com', 'senha' => '123456'])
            ->assertOk()
            ->assertJsonPath('abilities', ['publicador']);
    }

    public function test_psicologo_pendente_rejeitado_ou_sem_status_nao_recebe_publicador(): void
    {
        $this->criarPsicologo('pendente', ['email' => 'pendente@teste.com']);
        $this->criarPsicologo('rejeitado', ['email' => 'rejeitado@teste.com']);
        $this->criarPsicologo('aprovado', ['email' => 'semstatus@teste.com', 'crp_status' => null]);

        foreach (['pendente', 'rejeitado', 'semstatus'] as $quem) {
            $this->postJson('/api/login', ['email' => "{$quem}@teste.com", 'senha' => '123456'])
                ->assertOk()
                ->assertJsonPath('abilities', []);
        }
    }

    public function test_admin_recebe_a_ability_admin(): void
    {
        $this->criarAdmin(['email' => 'admin@teste.com']);

        $this->postJson('/api/login', ['email' => 'admin@teste.com', 'senha' => '123456'])
            ->assertOk()
            ->assertJsonPath('abilities', ['admin']);
    }

    public function test_me_exige_login_e_devolve_o_usuario_logado(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();

        $user = $this->criarUsuario(['email' => 'eu@teste.com']);
        $this->autenticarComo($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'eu@teste.com');
    }

    public function test_logout_apaga_somente_o_token_usado(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $tokenCelular = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456']);
        $this->assertDatabaseCount('personal_access_tokens', 2);

        $this->withToken($tokenCelular)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_logout_all_apaga_todos_os_tokens_do_usuario(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $token = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456']);

        $this->withToken($token)->postJson('/api/logout/all')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
