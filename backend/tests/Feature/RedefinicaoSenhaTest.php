<?php

namespace Tests\Feature;

use App\Mail\RedefinirSenhaMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\ApiTestCase;

class RedefinicaoSenhaTest extends ApiTestCase
{
    private function criarTokenDeReset(User $user, string $token = 'token-valido', $criadoEm = null): void
    {
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => $criadoEm ?? now(),
        ]);
    }

    private function redefinir(User $user, array $extra = [])
    {
        return $this->postJson('/api/reset-password', array_merge([
            'email' => $user->email,
            'token' => 'token-valido',
            'senha' => 'novaSenha1',
            'senha_confirmation' => 'novaSenha1',
        ], $extra));
    }

    /** Token que foi enviado dentro do link do e-mail (o mais recente ou o de índice informado). */
    private function tokenDoEmail(int $indice = -1): string
    {
        $enviados = Mail::sent(RedefinirSenhaMail::class)->values();
        $mail = $indice < 0 ? $enviados->last() : $enviados->get($indice);

        parse_str((string) parse_url($mail->urlRedefinicao, PHP_URL_QUERY), $query);

        return $query['token'];
    }

    // ---------- passo 1: "esqueci a senha" ----------

    public function test_esqueci_a_senha_envia_o_email_com_link_para_o_front_e_guarda_so_o_hash(): void
    {
        Mail::fake();
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->postJson('/api/forgot-password', ['email' => 'ana@teste.com'])->assertOk();

        Mail::assertSent(RedefinirSenhaMail::class, function ($mail) {
            return $mail->hasTo('ana@teste.com')
                && $mail->hasSubject('Redefinição de senha — MindUp')
                && str_starts_with($mail->urlRedefinicao, 'http://front.test/redefinir-senha?token=')
                && str_contains($mail->urlRedefinicao, 'email=' . urlencode('ana@teste.com'));
        });

        $token = $this->tokenDoEmail();
        $guardado = DB::table('password_reset_tokens')->where('email', 'ana@teste.com')->value('token');

        $this->assertNotSame($token, $guardado, 'O token não pode ficar em texto puro no banco.');
        $this->assertTrue(Hash::check($token, $guardado), 'O banco guarda o hash do token enviado por e-mail.');
    }

    public function test_esqueci_a_senha_responde_igual_para_email_inexistente_e_nao_envia_nada(): void
    {
        Mail::fake();
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $existente = $this->postJson('/api/forgot-password', ['email' => 'ana@teste.com'])->assertOk();
        $inexistente = $this->postJson('/api/forgot-password', ['email' => 'ninguem@teste.com'])->assertOk();

        // Não dá para descobrir quais e-mails têm conta
        $this->assertSame($existente->json(), $inexistente->json());
        Mail::assertSent(RedefinirSenhaMail::class, 1);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'ninguem@teste.com']);
    }

    public function test_esqueci_a_senha_exige_email_valido(): void
    {
        $this->postJson('/api/forgot-password', ['email' => 'invalido'])->assertUnprocessable();
        $this->postJson('/api/forgot-password', [])->assertUnprocessable();
    }

    public function test_pedir_de_novo_invalida_o_link_anterior(): void
    {
        Mail::fake();
        $user = $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->postJson('/api/forgot-password', ['email' => 'ana@teste.com']);
        $this->postJson('/api/forgot-password', ['email' => 'ana@teste.com']);

        $this->assertSame(1, DB::table('password_reset_tokens')->where('email', 'ana@teste.com')->count());

        $primeiro = $this->tokenDoEmail(0);
        $segundo = $this->tokenDoEmail(1);

        $this->redefinir($user, ['token' => $primeiro])->assertUnprocessable();
        $this->redefinir($user, ['token' => $segundo])->assertOk();
    }

    // ---------- passo 2: definir a nova senha ----------

    public function test_fluxo_completo_esqueci_a_senha_redefinir_e_entrar_com_a_nova(): void
    {
        Mail::fake();
        $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->postJson('/api/forgot-password', ['email' => 'ana@teste.com'])->assertOk();

        $this->postJson('/api/reset-password', [
            'email' => 'ana@teste.com',
            'token' => $this->tokenDoEmail(),
            'senha' => 'novaSenha1',
            'senha_confirmation' => 'novaSenha1',
        ])->assertOk();

        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->assertUnauthorized();
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => 'novaSenha1'])->assertOk();
    }

    public function test_redefinir_troca_a_senha_apaga_o_token_e_derruba_as_sessoes(): void
    {
        $user = $this->criarUsuario();
        $user->createToken('celular');
        $this->criarTokenDeReset($user);

        $this->redefinir($user)->assertOk();

        $this->assertTrue(Hash::check('novaSenha1', $user->fresh()->senha));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
        $this->assertSame(0, $user->tokens()->count(), 'Quem estava logado com a senha antiga deve ser deslogado.');
    }

    public function test_o_token_de_redefinicao_so_funciona_uma_vez(): void
    {
        $user = $this->criarUsuario();
        $this->criarTokenDeReset($user);

        $this->redefinir($user)->assertOk();

        $this->redefinir($user, ['senha' => 'outraSenha2', 'senha_confirmation' => 'outraSenha2'])
            ->assertUnprocessable();
        $this->assertTrue(Hash::check('novaSenha1', $user->fresh()->senha));
    }

    public function test_token_errado_e_recusado_sem_mudar_a_senha_nem_gastar_o_link(): void
    {
        $user = $this->criarUsuario();
        $this->criarTokenDeReset($user);

        $this->redefinir($user, ['token' => 'token-errado'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Link de redefinição inválido ou já utilizado.');

        $this->assertTrue(Hash::check('123456', $user->fresh()->senha));
        // O dono do link verdadeiro ainda consegue usar
        $this->redefinir($user)->assertOk();
    }

    public function test_sem_pedido_de_redefinicao_e_recusado(): void
    {
        $user = $this->criarUsuario();

        $this->redefinir($user)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Link de redefinição inválido ou já utilizado.');
    }

    public function test_o_token_de_uma_pessoa_nao_redefine_a_senha_de_outra(): void
    {
        $ana = $this->criarUsuario(['email' => 'ana@teste.com']);
        $bruno = $this->criarUsuario(['email' => 'bruno@teste.com']);
        $this->criarTokenDeReset($ana, 'token-da-ana');
        $this->criarTokenDeReset($bruno, 'token-do-bruno');

        $this->redefinir($bruno, ['token' => 'token-da-ana'])->assertUnprocessable();

        $this->assertTrue(Hash::check('123456', $bruno->fresh()->senha));
    }

    // ---------- expiração (60 minutos) ----------

    public function test_token_com_mais_de_60_minutos_expira_e_e_apagado(): void
    {
        $user = $this->criarUsuario();
        $this->criarTokenDeReset($user, 'token-valido', now()->subMinutes(61));

        $this->redefinir($user)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Este link de redefinição expirou. Solicite um novo.');

        $this->assertTrue(Hash::check('123456', $user->fresh()->senha), 'Com o token expirado a senha não pode mudar.');
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_token_com_menos_de_60_minutos_ainda_vale(): void
    {
        $user = $this->criarUsuario();
        $this->criarTokenDeReset($user, 'token-valido', now()->subMinutes(59));

        $this->redefinir($user)->assertOk();

        $this->assertTrue(Hash::check('novaSenha1', $user->fresh()->senha));
    }

    // ---------- validação da nova senha ----------

    public function test_validacoes_da_nova_senha(): void
    {
        $user = $this->criarUsuario();
        $this->criarTokenDeReset($user);

        $this->postJson('/api/reset-password', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'token', 'senha']);

        $this->redefinir($user, ['senha_confirmation' => 'diferente'])
            ->assertJsonValidationErrors(['senha' => 'A confirmação de senha não corresponde.']);

        $this->redefinir($user, ['senha' => '123', 'senha_confirmation' => '123'])
            ->assertJsonValidationErrors(['senha' => 'A nova senha precisa ter pelo menos 6 caracteres.']);

        $this->redefinir($user, ['senha' => 'com espaco', 'senha_confirmation' => 'com espaco'])
            ->assertJsonValidationErrors('senha');

        // Nada disso gastou o link nem mudou a senha
        $this->assertTrue(Hash::check('123456', $user->fresh()->senha));
        $this->redefinir($user)->assertOk();
    }

    // ---------- o conteúdo do e-mail ----------

    private const LINK = 'http://front.test/redefinir-senha?token=abc123&email=ana%40teste.com';

    public function test_email_mostra_o_nome_o_botao_com_o_link_e_a_validade(): void
    {
        $html = (new RedefinirSenhaMail('Ana', self::LINK))->render();

        $this->assertStringContainsString('Olá, Ana', $html);
        $this->assertStringContainsString('Redefinir minha senha', $html);
        $this->assertStringContainsString('href="' . e(self::LINK) . '"', $html);
        $this->assertStringContainsString('60 minutos', $html);
        $this->assertStringContainsString('pode ignorar este e-mail', $html);
    }

    public function test_email_nao_executa_html_colocado_no_nome(): void
    {
        $html = (new RedefinirSenhaMail('<script>alert(1)</script>', self::LINK))->render();

        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
    }
}
