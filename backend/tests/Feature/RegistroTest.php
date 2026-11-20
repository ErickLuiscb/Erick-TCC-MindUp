<?php

namespace Tests\Feature;

use App\Mail\VerificarEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\ApiTestCase;

class RegistroTest extends ApiTestCase
{
    private const CPF_VALIDO = '52998224725';

    protected function setUp(): void
    {
        parent::setUp();

        // Nenhum e-mail de verdade sai nos testes: o Mail::fake guarda os envios
        Mail::fake();
    }

    private function dadosUsuario(array $extra = []): array
    {
        return array_merge([
            'nome' => 'Maria',
            'email' => 'maria@teste.com',
            'senha' => 'segredo1',
            'tipo' => 'usuario',
        ], $extra);
    }

    private function dadosPsicologo(array $extra = []): array
    {
        return $this->dadosUsuario(array_merge([
            'tipo' => 'psicologo',
            'crp_regiao' => 7,
            'crp' => '12345',
            'cpf' => self::CPF_VALIDO,
        ], $extra));
    }

    // ---------- usuário comum ----------

    public function test_cadastro_de_usuario_comum_cria_conta_sem_email_confirmado_e_envia_o_email(): void
    {
        $this->postJson('/api/register', $this->dadosUsuario())
            ->assertCreated()
            ->assertJsonPath('user.email', 'maria@teste.com')
            ->assertJsonMissingPath('token'); // não loga direto: precisa confirmar o e-mail

        $user = User::where('email', 'maria@teste.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);
        $this->assertTrue(Hash::check('segredo1', $user->senha), 'A senha deve ser salva com hash.');

        Mail::assertSent(VerificarEmailMail::class, fn ($mail) => $mail->hasTo('maria@teste.com'));
    }

    public function test_cadastro_nao_permite_virar_admin_enviando_campos_extras(): void
    {
        $this->postJson('/api/register', $this->dadosUsuario(['is_admin' => true, 'role' => 'admin']))
            ->assertCreated();

        $user = User::where('email', 'maria@teste.com')->first();
        $this->assertFalse((bool) $user->is_admin);
        $this->assertNotSame('admin', $user->role);
    }

    public function test_usuario_comum_nunca_grava_crp_nem_cpf(): void
    {
        $this->postJson('/api/register', $this->dadosUsuario([
            'crp' => '99999', 'crp_regiao' => 7, 'cpf' => self::CPF_VALIDO,
        ]))->assertCreated();

        $user = User::where('email', 'maria@teste.com')->first();
        $this->assertNull($user->crp);
        $this->assertNull($user->crp_regiao);
        $this->assertNull($user->cpf);
        $this->assertNull($user->crp_status);
    }

    public function test_validacoes_basicas_do_cadastro(): void
    {
        $this->postJson('/api/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome', 'email', 'senha', 'tipo']);

        $this->postJson('/api/register', $this->dadosUsuario(['email' => 'invalido']))
            ->assertJsonValidationErrors('email');

        $this->postJson('/api/register', $this->dadosUsuario(['senha' => '123']))
            ->assertJsonValidationErrors('senha');

        $this->postJson('/api/register', $this->dadosUsuario(['senha' => 'abc 1234']))
            ->assertJsonValidationErrors('senha');

        $this->postJson('/api/register', $this->dadosUsuario(['tipo' => 'admin']))
            ->assertJsonValidationErrors('tipo');
    }

    public function test_email_duplicado_e_recusado(): void
    {
        $this->criarUsuario(['email' => 'maria@teste.com']);

        $this->postJson('/api/register', $this->dadosUsuario())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        Mail::assertNothingSent();
    }

    // ---------- psicólogo ----------

    public function test_psicologo_nasce_pendente_com_cpf_criptografado(): void
    {
        $this->postJson('/api/register', $this->dadosPsicologo(['cpf' => '529.982.247-25'])) // aceita máscara
            ->assertCreated()
            ->assertJsonPath('user.crp_status', 'pendente')
            ->assertJsonMissingPath('user.cpf');

        $user = User::where('email', 'maria@teste.com')->first();
        $this->assertSame('pendente', $user->crp_status);
        $this->assertSame(self::CPF_VALIDO, $user->cpf, 'Só os dígitos devem ser guardados.');

        $bruto = DB::table('usuarios')->where('email', 'maria@teste.com')->value('cpf');
        $this->assertNotSame(self::CPF_VALIDO, $bruto, 'O CPF não pode ficar em texto puro no banco.');
    }

    public function test_psicologo_nao_consegue_se_cadastrar_ja_aprovado(): void
    {
        $this->postJson('/api/register', $this->dadosPsicologo(['crp_status' => 'aprovado']))
            ->assertCreated();

        $this->assertSame('pendente', User::where('email', 'maria@teste.com')->first()->crp_status);
    }

    public function test_psicologo_precisa_informar_regiao_crp_e_cpf(): void
    {
        $this->postJson('/api/register', $this->dadosUsuario(['tipo' => 'psicologo']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['crp_regiao', 'crp', 'cpf']);
    }

    public function test_cpf_invalido_e_recusado(): void
    {
        foreach (['52998224726', '11111111111', '123'] as $cpf) {
            $this->postJson('/api/register', $this->dadosPsicologo(['cpf' => $cpf]))
                ->assertUnprocessable()
                ->assertJsonValidationErrors('cpf');
        }
    }

    public function test_regiao_do_crp_precisa_estar_entre_1_e_24(): void
    {
        // Inclui lixo e números gigantes: devem dar erro de validação (422),
        // nunca erro de servidor (500) por tipo inválido no banco.
        foreach ([0, 25, -1, 'abc', '7abc', 99999999999] as $regiao) {
            $this->postJson('/api/register', $this->dadosPsicologo(['crp_regiao' => $regiao]))
                ->assertUnprocessable()
                ->assertJsonValidationErrors('crp_regiao');
        }

        $this->postJson('/api/register', $this->dadosPsicologo(['crp_regiao' => 24]))->assertCreated();
    }

    public function test_crp_aceita_somente_numeros(): void
    {
        foreach (['12A45', '07/12345', '12 345', ''] as $crp) {
            $this->postJson('/api/register', $this->dadosPsicologo(['crp' => $crp]))
                ->assertJsonValidationErrors('crp');
        }
    }

    public function test_crp_duplicado_na_mesma_regiao_e_recusado_mas_em_outra_regiao_e_aceito(): void
    {
        $this->criarPsicologo('aprovado', ['crp' => '12345', 'crp_regiao' => 7]);

        $this->postJson('/api/register', $this->dadosPsicologo(['crp' => '12345', 'crp_regiao' => 7]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('crp');

        $this->postJson('/api/register', $this->dadosPsicologo(['crp' => '12345', 'crp_regiao' => 8]))
            ->assertCreated();
    }

    // ---------- cadastro + confirmação de e-mail + login ----------

    public function test_fluxo_completo_cadastro_confirmacao_de_email_e_login(): void
    {
        $this->postJson('/api/register', $this->dadosUsuario())->assertCreated();

        // Antes de confirmar, o login é bloqueado
        $this->postJson('/api/login', ['email' => 'maria@teste.com', 'senha' => 'segredo1'])
            ->assertForbidden();

        // Pega o link que foi enviado por e-mail e o "clica"
        $url = null;
        Mail::assertSent(VerificarEmailMail::class, function ($mail) use (&$url) {
            $url = $mail->urlVerificacao;

            return true;
        });
        $this->get($url)->assertRedirect('http://front.test/email-verificado?status=sucesso');

        // Agora entra
        $this->postJson('/api/login', ['email' => 'maria@teste.com', 'senha' => 'segredo1'])
            ->assertOk()
            ->assertJsonStructure(['token']);
    }
}
