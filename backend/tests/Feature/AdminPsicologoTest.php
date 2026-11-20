<?php

namespace Tests\Feature;

use App\Mail\ResultadoVerificacaoMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Tests\ApiTestCase;

class AdminPsicologoTest extends ApiTestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->admin = $this->criarAdmin();
    }

    private function comoAdmin(): void
    {
        $this->autenticarComo($this->admin, ['admin']);
    }

    private function decidir(User $psicologo, string $status, ?string $motivo = null)
    {
        return $this->patchJson("/api/admin/psicologos/{$psicologo->id}/status", array_filter([
            'status' => $status,
            'motivo' => $motivo,
        ]));
    }

    // =====================================================================
    // QUEM PODE ENTRAR NO PAINEL
    // =====================================================================

    public function test_exige_login(): void
    {
        $this->getJson('/api/admin/psicologos')->assertUnauthorized();

        $alvo = $this->criarPsicologo('pendente');
        $this->decidir($alvo, 'aprovado')->assertUnauthorized();
    }

    public function test_usuario_comum_nao_acessa_o_painel(): void
    {
        $alvo = $this->criarPsicologo('pendente');
        $this->autenticarComo($this->criarUsuario(), []);

        $this->getJson('/api/admin/psicologos')->assertForbidden();
        $this->decidir($alvo, 'aprovado')->assertForbidden();

        $this->assertSame('pendente', $alvo->fresh()->crp_status);
    }

    public function test_psicologo_publicador_nao_acessa_o_painel(): void
    {
        $alvo = $this->criarPsicologo('pendente');
        $this->autenticarComo($this->criarPsicologo('aprovado'), ['publicador']);

        $this->getJson('/api/admin/psicologos')->assertForbidden();
        $this->decidir($alvo, 'aprovado')->assertForbidden();

        $this->assertSame('pendente', $alvo->fresh()->crp_status);
    }

    // =====================================================================
    // LISTAGEM
    // =====================================================================

    public function test_lista_somente_psicologos_com_contagem_por_status(): void
    {
        $this->criarPsicologo('pendente');
        $this->criarPsicologo('pendente');
        $this->criarPsicologo('aprovado');
        $this->criarPsicologo('rejeitado');
        $this->criarUsuario(); // usuário comum não entra na lista

        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('contagens.pendente', 2)
            ->assertJsonPath('contagens.aprovado', 1)
            ->assertJsonPath('contagens.rejeitado', 1);
    }

    public function test_sem_psicologos_a_lista_vem_vazia_com_contagens_zeradas(): void
    {
        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('contagens.pendente', 0)
            ->assertJsonPath('contagens.aprovado', 0)
            ->assertJsonPath('contagens.rejeitado', 0);
    }

    public function test_filtra_por_status_e_a_fila_de_pendentes_mostra_o_mais_antigo_primeiro(): void
    {
        $this->criarPsicologo('pendente', ['nome' => 'Recente', 'created_at' => now()->subDay()]);
        $this->criarPsicologo('pendente', ['nome' => 'Antiga', 'created_at' => now()->subDays(5)]);
        $this->criarPsicologo('aprovado', ['nome' => 'Aprovada']);

        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos?status=pendente')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.nome', 'Antiga')
            ->assertJsonPath('data.1.nome', 'Recente')
            // o contador das abas não muda com o filtro
            ->assertJsonPath('contagens.aprovado', 1);
    }

    public function test_as_demais_listas_vem_em_ordem_alfabetica(): void
    {
        $this->criarPsicologo('aprovado', ['nome' => 'Zélia']);
        $this->criarPsicologo('aprovado', ['nome' => 'Alice']);

        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos?status=aprovado')
            ->assertJsonPath('data.0.nome', 'Alice')
            ->assertJsonPath('data.1.nome', 'Zélia');
    }

    public function test_status_invalido_ou_busca_gigante_retornam_422(): void
    {
        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos?status=qualquer')->assertUnprocessable();
        $this->getJson('/api/admin/psicologos?busca=' . str_repeat('a', 101))->assertUnprocessable();
    }

    public function test_busca_por_nome_email_ou_crp_sem_diferenciar_maiusculas(): void
    {
        $this->criarPsicologo('aprovado', ['nome' => 'Ana Souza', 'email' => 'ana@clinica.com', 'crp' => '11111']);
        $this->criarPsicologo('aprovado', ['nome' => 'Bruno Lima', 'email' => 'bruno@outro.com', 'crp' => '22222']);

        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos?busca=ANA')->assertJsonCount(1, 'data')->assertJsonPath('data.0.nome', 'Ana Souza');
        $this->getJson('/api/admin/psicologos?busca=outro.com')->assertJsonCount(1, 'data')->assertJsonPath('data.0.nome', 'Bruno Lima');
        $this->getJson('/api/admin/psicologos?busca=22222')->assertJsonCount(1, 'data')->assertJsonPath('data.0.nome', 'Bruno Lima');
        $this->getJson('/api/admin/psicologos?busca=nao-existe')->assertJsonCount(0, 'data');
    }

    public function test_admin_ve_o_cpf_do_pendente_mas_nao_ha_cpf_para_quem_ja_foi_decidido(): void
    {
        $this->criarPsicologo('pendente', ['nome' => 'Pendente']);
        $this->criarPsicologo('aprovado', ['nome' => 'Aprovada']);
        $this->comoAdmin();

        $this->getJson('/api/admin/psicologos?status=pendente')
            ->assertJsonPath('data.0.cpf', '52998224725');

        $this->getJson('/api/admin/psicologos?status=aprovado')
            ->assertJsonPath('data.0.cpf', null);
    }

    // =====================================================================
    // DECISÕES
    // =====================================================================

    public function test_aprovar_libera_o_psicologo_apaga_o_cpf_derruba_sessoes_e_avisa_por_email(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $psicologo->createToken('sessao-antiga', []);
        $this->comoAdmin();

        $this->decidir($psicologo, 'aprovado')
            ->assertOk()
            ->assertJsonPath('message', 'Psicólogo aprovado.')
            ->assertJsonPath('email_enviado', true)
            ->assertJsonPath('data.crp_status', 'aprovado')
            ->assertJsonPath('data.cpf', null);

        $psicologo->refresh();
        $this->assertSame('aprovado', $psicologo->crp_status);
        $this->assertNull($psicologo->cpf, 'O CPF deve ser apagado depois da decisão (LGPD).');
        $this->assertSame($this->admin->id, (int) $psicologo->crp_analisado_por);
        $this->assertNotNull($psicologo->crp_analisado_em);
        $this->assertSame(0, $psicologo->tokens()->count(), 'As sessões antigas devem ser derrubadas.');

        Mail::assertSent(ResultadoVerificacaoMail::class, fn ($m) => $m->hasTo($psicologo->email) && $m->decisao === 'aprovado');
    }

    public function test_depois_de_aprovado_o_novo_login_concede_a_ability_publicador(): void
    {
        $psicologo = $this->criarPsicologo('pendente', ['email' => 'psi@teste.com']);

        $this->postJson('/api/login', ['email' => 'psi@teste.com', 'senha' => '123456'])
            ->assertJsonPath('abilities', []);

        $this->comoAdmin();
        $this->decidir($psicologo, 'aprovado')->assertOk();

        $this->postJson('/api/login', ['email' => 'psi@teste.com', 'senha' => '123456'])
            ->assertJsonPath('abilities', ['publicador']);
    }

    public function test_aprovar_ignora_um_motivo_enviado_sem_necessidade(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->decidir($psicologo, 'aprovado', 'texto qualquer')->assertOk();

        $this->assertNull($psicologo->fresh()->crp_motivo);
    }

    public function test_rejeitar_exige_motivo(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->decidir($psicologo, 'rejeitado')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['motivo' => 'Informe o motivo da rejeição ou revogação.']);

        $this->assertSame('pendente', $psicologo->fresh()->crp_status);
        $this->assertNotNull($psicologo->fresh()->cpf, 'Sem decisão, o CPF continua guardado.');
        Mail::assertNothingSent();
    }

    public function test_motivo_so_com_espacos_nao_vale(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->decidir($psicologo, 'rejeitado', '     ')->assertUnprocessable();

        $this->assertSame('pendente', $psicologo->fresh()->crp_status);
    }

    public function test_motivo_nao_pode_passar_de_500_caracteres(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->decidir($psicologo, 'rejeitado', str_repeat('a', 501))
            ->assertJsonValidationErrors(['motivo' => 'O motivo deve ter no máximo 500 caracteres.']);

        $this->decidir($psicologo, 'rejeitado', str_repeat('a', 500))->assertOk();
    }

    public function test_rejeitar_com_motivo_grava_o_motivo_apaga_o_cpf_e_manda_no_email(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->decidir($psicologo, 'rejeitado', 'CRP não encontrado no conselho.')
            ->assertOk()
            ->assertJsonPath('message', 'Solicitação rejeitada.')
            ->assertJsonPath('data.crp_status', 'rejeitado')
            ->assertJsonPath('data.crp_motivo', 'CRP não encontrado no conselho.');

        $this->assertNull($psicologo->fresh()->cpf);
        Mail::assertSent(ResultadoVerificacaoMail::class, fn ($m) => $m->decisao === 'rejeitado'
            && $m->motivo === 'CRP não encontrado no conselho.');
    }

    public function test_revogar_um_aprovado_tira_a_permissao_e_derruba_as_sessoes(): void
    {
        $psicologo = $this->criarPsicologo('aprovado', ['email' => 'psi@teste.com']);
        $psicologo->createToken('sessao', ['publicador']);
        $this->comoAdmin();

        $this->decidir($psicologo, 'rejeitado', 'Registro suspenso.')
            ->assertOk()
            ->assertJsonPath('message', 'Permissão de publicação revogada.');

        $this->assertSame('rejeitado', $psicologo->fresh()->crp_status);
        $this->assertSame(0, $psicologo->tokens()->count());
        Mail::assertSent(ResultadoVerificacaoMail::class, fn ($m) => $m->decisao === 'revogado');

        // No próximo login ele já não publica mais
        $this->postJson('/api/login', ['email' => 'psi@teste.com', 'senha' => '123456'])
            ->assertJsonPath('abilities', []);
    }

    public function test_reativar_um_rejeitado_limpa_o_motivo_e_devolve_a_permissao(): void
    {
        $psicologo = $this->criarPsicologo('rejeitado', ['email' => 'psi@teste.com', 'crp_motivo' => 'Motivo antigo']);
        $this->comoAdmin();

        $this->decidir($psicologo, 'aprovado')
            ->assertOk()
            ->assertJsonPath('message', 'Permissão de publicação reativada.');

        $psicologo->refresh();
        $this->assertSame('aprovado', $psicologo->crp_status);
        $this->assertNull($psicologo->crp_motivo);
        Mail::assertSent(ResultadoVerificacaoMail::class, fn ($m) => $m->decisao === 'reativado');

        $this->postJson('/api/login', ['email' => 'psi@teste.com', 'senha' => '123456'])
            ->assertJsonPath('abilities', ['publicador']);
    }

    public function test_status_nulo_e_tratado_como_pendente(): void
    {
        $psicologo = $this->criarPsicologo('aprovado', ['crp_status' => null]);
        $this->comoAdmin();

        $this->decidir($psicologo, 'aprovado')->assertOk();

        $this->assertSame('aprovado', $psicologo->fresh()->crp_status);
    }

    // =====================================================================
    // O QUE NÃO PODE ACONTECER
    // =====================================================================

    public function test_transicoes_invalidas_sao_recusadas_sem_efeito_nenhum(): void
    {
        $this->comoAdmin();

        $aprovado = $this->criarPsicologo('aprovado');
        $rejeitado = $this->criarPsicologo('rejeitado');

        $this->decidir($aprovado, 'aprovado')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Não é possível mudar o status de "aprovado" para "aprovado".');
        $this->decidir($rejeitado, 'rejeitado', 'de novo')->assertUnprocessable();
        // O admin nunca devolve alguém para "pendente"
        $this->decidir($aprovado, 'pendente')->assertUnprocessable();

        $this->assertSame('aprovado', $aprovado->fresh()->crp_status);
        $this->assertSame('rejeitado', $rejeitado->fresh()->crp_status);
        Mail::assertNothingSent();
    }

    public function test_admin_nao_pode_alterar_o_proprio_status(): void
    {
        $adminPsicologo = $this->criarAdmin([
            'tipo' => 'psicologo', 'crp' => '99999', 'crp_regiao' => 7, 'crp_status' => 'aprovado',
        ]);
        $this->autenticarComo($adminPsicologo, ['admin']);

        $this->decidir($adminPsicologo, 'rejeitado', 'teste')
            ->assertForbidden()
            ->assertJsonPath('message', 'Você não pode alterar o seu próprio status.');

        $this->assertSame('aprovado', $adminPsicologo->fresh()->crp_status);
    }

    public function test_so_psicologo_pode_ter_o_status_alterado(): void
    {
        $comum = $this->criarUsuario();
        $this->comoAdmin();

        $this->decidir($comum, 'aprovado')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Este usuário não é psicólogo.');
    }

    public function test_status_invalido_ou_ausente_retorna_422(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        $this->patchJson("/api/admin/psicologos/{$psicologo->id}/status", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->patchJson("/api/admin/psicologos/{$psicologo->id}/status", ['status' => 'pendente'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_psicologo_inexistente_retorna_404(): void
    {
        $this->comoAdmin();

        $this->patchJson('/api/admin/psicologos/999999/status', ['status' => 'aprovado'])->assertNotFound();
    }

    public function test_se_o_email_falhar_a_decisao_continua_valendo(): void
    {
        $psicologo = $this->criarPsicologo('pendente');
        $this->comoAdmin();

        // Simula o Brevo fora do ar
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('Brevo fora do ar'));

        $this->decidir($psicologo, 'aprovado')
            ->assertOk()
            ->assertJsonPath('email_enviado', false)
            ->assertJsonPath('data.crp_status', 'aprovado');

        $this->assertSame('aprovado', $psicologo->fresh()->crp_status);
        $this->assertNull($psicologo->fresh()->cpf);
    }

    // =====================================================================
    // O E-MAIL DE RESULTADO (o HTML que o psicólogo recebe)
    // =====================================================================

    private const LOGIN = 'http://front.test/login';

    private function html(string $decisao, ?string $motivo = null, string $nome = 'Dra. Ana'): string
    {
        return (new ResultadoVerificacaoMail($nome, $decisao, $motivo, self::LOGIN))->render();
    }

    public function test_email_de_aprovacao_tem_o_botao_para_entrar(): void
    {
        $html = $this->html('aprovado');

        $this->assertStringContainsString('Olá, Dra. Ana', $html);
        $this->assertStringContainsString('Boa notícia!', $html);
        $this->assertStringContainsString('Entrar no MindUp', $html);
        $this->assertStringContainsString('href="' . self::LOGIN . '"', $html);
    }

    public function test_email_de_reativacao_tem_o_botao_para_entrar(): void
    {
        $html = $this->html('reativado');

        $this->assertStringContainsString('reativada', $html);
        $this->assertStringContainsString('Entrar no MindUp', $html);
    }

    public function test_email_de_rejeicao_e_de_revogacao_mostram_o_motivo_e_nao_tem_botao_de_entrar(): void
    {
        $rejeitado = $this->html('rejeitado', 'CRP não encontrado.');
        $revogado = $this->html('revogado', 'Registro suspenso.');

        $this->assertStringContainsString('não foi possível aprová-lo', $rejeitado);
        $this->assertStringContainsString('CRP não encontrado.', $rejeitado);
        $this->assertStringNotContainsString('Entrar no MindUp', $rejeitado);

        $this->assertStringContainsString('revogada', $revogado);
        $this->assertStringContainsString('Registro suspenso.', $revogado);
        $this->assertStringNotContainsString('Entrar no MindUp', $revogado);
    }

    public function test_email_nao_executa_html_colocado_no_motivo_nem_no_nome_e_preserva_quebras_de_linha(): void
    {
        $html = $this->html('rejeitado', "linha 1\nlinha 2 <script>alert(1)</script>", '<b>Nome</b>');

        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
        $this->assertStringNotContainsString('<b>Nome</b>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringContainsString('linha 1<br />', $html);
    }
}
