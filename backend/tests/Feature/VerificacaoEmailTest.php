<?php

namespace Tests\Feature;

use App\Mail\VerificarEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\ApiTestCase;

class VerificacaoEmailTest extends ApiTestCase
{
    private function linkAssinado(User $user, $validoAte = null, ?string $hash = null): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            $validoAte ?? now()->addMinutes(60),
            ['id' => $user->id, 'hash' => $hash ?? sha1($user->email)]
        );
    }

    // ---------- o link que chega por e-mail ----------

    public function test_link_valido_confirma_o_email_e_redireciona_para_o_front(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);

        $this->get($this->linkAssinado($user))
            ->assertRedirect('http://front.test/email-verificado?status=sucesso');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_link_sem_assinatura_e_recusado(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);

        $this->get("/api/email/verify/{$user->id}/" . sha1($user->email))->assertForbidden();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_link_adulterado_e_recusado(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);
        $outro = $this->criarUsuario(['email_verified_at' => null]);

        // Pega o link legítimo de um usuário e troca o id para o de outro:
        // a assinatura deixa de valer.
        $link = str_replace("/verify/{$user->id}/", "/verify/{$outro->id}/", $this->linkAssinado($user));

        $this->get($link)->assertForbidden();

        $this->assertNull($outro->fresh()->email_verified_at);
    }

    public function test_link_expirado_e_recusado(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);

        $this->get($this->linkAssinado($user, now()->subMinute()))->assertForbidden();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_link_com_hash_de_outro_email_redireciona_com_erro_e_nao_confirma(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);

        $this->get($this->linkAssinado($user, null, sha1('outro@teste.com')))
            ->assertRedirect('http://front.test/email-verificado?status=erro');

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_link_de_usuario_que_nao_existe_redireciona_com_erro(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);
        $link = $this->linkAssinado($user);
        $user->delete();

        $this->get($link)->assertRedirect('http://front.test/email-verificado?status=erro');
    }

    public function test_clicar_duas_vezes_no_link_nao_muda_a_data_da_confirmacao(): void
    {
        $user = $this->criarUsuario(['email_verified_at' => null]);
        $link = $this->linkAssinado($user);

        $this->get($link)->assertRedirect('http://front.test/email-verificado?status=sucesso');
        $primeiraConfirmacao = $user->fresh()->email_verified_at->timestamp;

        $this->travel(5)->minutes();
        $this->get($link)->assertRedirect('http://front.test/email-verificado?status=sucesso');

        $this->assertSame($primeiraConfirmacao, $user->fresh()->email_verified_at->timestamp);
    }

    // ---------- reenvio ----------

    public function test_reenvio_manda_o_email_somente_para_conta_nao_confirmada(): void
    {
        Mail::fake();
        $pendente = $this->criarUsuario(['email' => 'pendente@teste.com', 'email_verified_at' => null]);
        $this->criarUsuario(['email' => 'confirmado@teste.com']);

        $resposta1 = $this->postJson('/api/email/reenviar', ['email' => 'pendente@teste.com'])->assertOk();
        $resposta2 = $this->postJson('/api/email/reenviar', ['email' => 'confirmado@teste.com'])->assertOk();
        $resposta3 = $this->postJson('/api/email/reenviar', ['email' => 'ninguem@teste.com'])->assertOk();

        Mail::assertSent(VerificarEmailMail::class, 1);
        Mail::assertSent(VerificarEmailMail::class, fn ($mail) => $mail->hasTo($pendente->email)
            && $mail->hasSubject('Confirme seu e-mail — MindUp'));

        // A resposta é sempre a mesma: não dá para descobrir quais e-mails existem
        $this->assertSame($resposta1->json(), $resposta2->json());
        $this->assertSame($resposta1->json(), $resposta3->json());
    }

    public function test_reenvio_exige_um_email_valido(): void
    {
        $this->postJson('/api/email/reenviar', ['email' => 'invalido'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_o_link_do_email_reenviado_funciona(): void
    {
        Mail::fake();
        $user = $this->criarUsuario(['email' => 'pendente@teste.com', 'email_verified_at' => null]);

        $this->postJson('/api/email/reenviar', ['email' => 'pendente@teste.com'])->assertOk();

        $url = null;
        Mail::assertSent(VerificarEmailMail::class, function ($mail) use (&$url) {
            $url = $mail->urlVerificacao;

            return true;
        });

        $this->get($url)->assertRedirect('http://front.test/email-verificado?status=sucesso');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    // ---------- o conteúdo do e-mail (o HTML que a pessoa recebe) ----------

    private const LINK = 'http://api.test/api/email/verify/1/abc?expires=123&signature=xyz';

    public function test_email_mostra_o_nome_o_botao_com_o_link_e_a_validade(): void
    {
        $html = (new VerificarEmailMail('Ana', 'usuario', self::LINK))->render();

        $this->assertStringContainsString('Olá, Ana', $html);
        $this->assertStringContainsString('Confirmar meu e-mail', $html);
        $this->assertStringContainsString('href="' . e(self::LINK) . '"', $html);
        $this->assertStringContainsString('60 minutos', $html);
    }

    public function test_email_do_psicologo_avisa_da_analise_do_crp_e_o_do_usuario_comum_nao(): void
    {
        $psicologo = (new VerificarEmailMail('Dra. Ana', 'psicologo', self::LINK))->render();
        $comum = (new VerificarEmailMail('Ana', 'usuario', self::LINK))->render();

        $this->assertStringContainsString('CRP', $psicologo);
        $this->assertStringNotContainsString('CRP', $comum);
    }

    public function test_email_nao_executa_html_colocado_no_nome(): void
    {
        $html = (new VerificarEmailMail('<script>alert(1)</script>', 'usuario', self::LINK))->render();

        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
    }
}
