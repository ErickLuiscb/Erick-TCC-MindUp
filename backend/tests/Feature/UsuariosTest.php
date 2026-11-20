<?php

namespace Tests\Feature;

use App\Models\Favorito;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\ApiTestCase;

class UsuariosTest extends ApiTestCase
{
    // =====================================================================
    // QUEM PODE LISTAR E CRIAR (somente admin)
    // =====================================================================

    public function test_listar_e_criar_usuarios_exigem_login(): void
    {
        $this->getJson('/api/usuarios')->assertUnauthorized();
        $this->postJson('/api/usuarios', [])->assertUnauthorized();
    }

    public function test_usuario_comum_e_psicologo_nao_listam_nem_criam_usuarios(): void
    {
        $this->autenticarComo($this->criarUsuario(), []);
        $this->getJson('/api/usuarios')->assertForbidden();
        $this->postJson('/api/usuarios', [])->assertForbidden();

        $this->autenticarComo($this->criarPsicologo('aprovado'), ['publicador']);
        $this->getJson('/api/usuarios')->assertForbidden();
        $this->postJson('/api/usuarios', [])->assertForbidden();
    }

    public function test_admin_lista_todos_sem_expor_senha_nem_cpf(): void
    {
        $this->criarUsuario(['email' => 'ana@teste.com']);
        $this->criarPsicologo('pendente');
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $resposta = $this->getJson('/api/usuarios')->assertOk()->assertJsonCount(3, 'data');

        $this->assertStringNotContainsString('52998224725', $resposta->getContent());
        $resposta->assertJsonMissingPath('data.0.senha');
        $resposta->assertJsonMissingPath('data.0.cpf');
    }

    // =====================================================================
    // VER O PERFIL
    // =====================================================================

    public function test_usuario_ve_so_o_proprio_perfil_e_o_admin_ve_qualquer_um(): void
    {
        $ana = $this->criarUsuario(['nome' => 'Ana']);
        $bruno = $this->criarUsuario(['nome' => 'Bruno']);

        $this->autenticarComo($ana);
        $this->getJson("/api/usuarios/{$ana->id}")->assertOk()->assertJsonPath('data.nome', 'Ana');
        $this->getJson("/api/usuarios/{$bruno->id}")->assertForbidden();

        $this->autenticarComo($this->criarAdmin(), ['admin']);
        $this->getJson("/api/usuarios/{$bruno->id}")->assertOk()->assertJsonPath('data.nome', 'Bruno');
    }

    public function test_ver_usuario_inexistente_retorna_404(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->getJson('/api/usuarios/999999')->assertNotFound();
    }

    // =====================================================================
    // CRIAR (admin)
    // =====================================================================

    private function dadosNovoUsuario(array $extra = []): array
    {
        return array_merge([
            'nome' => 'Maria Nova',
            'email' => 'maria@teste.com',
            'senha' => 'segredo1',
            'tipo' => 'usuario',
        ], $extra);
    }

    public function test_admin_cria_usuario_comum_com_senha_em_hash(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario())
            ->assertCreated()
            ->assertJsonPath('data.email', 'maria@teste.com')
            ->assertJsonPath('data.tipo', 'usuario');

        $usuario = User::where('email', 'maria@teste.com')->firstOrFail();
        $this->assertTrue(Hash::check('segredo1', $usuario->senha));
        $this->assertNull($usuario->crp_status);
    }

    public function test_psicologo_criado_pelo_admin_ja_nasce_aprovado_com_o_admin_como_responsavel(): void
    {
        $admin = $this->criarAdmin();
        $this->autenticarComo($admin, ['admin']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['tipo' => 'psicologo', 'crp' => '12345']))
            ->assertCreated()
            ->assertJsonPath('data.crp_status', 'aprovado');

        $psicologo = User::where('email', 'maria@teste.com')->firstOrFail();
        $this->assertSame($admin->id, (int) $psicologo->crp_analisado_por);
        $this->assertNotNull($psicologo->crp_analisado_em);
    }

    public function test_conta_criada_pelo_admin_consegue_entrar(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario())->assertCreated();

        // Não há e-mail de confirmação nesse fluxo: a conta já precisa nascer confirmada
        $this->postJson('/api/login', ['email' => 'maria@teste.com', 'senha' => 'segredo1'])
            ->assertOk()
            ->assertJsonStructure(['token']);
    }

    public function test_psicologo_criado_pelo_admin_entra_ja_com_a_ability_publicador(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['tipo' => 'psicologo']))->assertCreated();

        $this->postJson('/api/login', ['email' => 'maria@teste.com', 'senha' => 'segredo1'])
            ->assertOk()
            ->assertJsonPath('abilities', ['publicador']);
    }

    public function test_admin_pode_criar_outro_admin(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['is_admin' => true]))->assertCreated();

        $this->assertTrue((bool) User::where('email', 'maria@teste.com')->firstOrFail()->is_admin);
    }

    public function test_validacoes_da_criacao_pelo_admin(): void
    {
        $this->criarUsuario(['email' => 'ocupado@teste.com']);
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/usuarios', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome', 'email', 'senha', 'tipo']);

        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['email' => 'ocupado@teste.com']))->assertJsonValidationErrors('email');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['email' => 'invalido']))->assertJsonValidationErrors('email');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['senha' => '123']))->assertJsonValidationErrors('senha');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['senha' => 'com espaco']))->assertJsonValidationErrors('senha');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['tipo' => 'admin']))->assertJsonValidationErrors('tipo');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['role' => 'dono']))->assertJsonValidationErrors('role');
        $this->postJson('/api/usuarios', $this->dadosNovoUsuario(['nome' => str_repeat('a', 101)]))->assertJsonValidationErrors('nome');

        $this->assertDatabaseMissing('usuarios', ['email' => 'maria@teste.com']);
    }

    // =====================================================================
    // EDITAR O PRÓPRIO PERFIL
    // =====================================================================

    public function test_usuario_edita_o_proprio_perfil_mas_nao_o_de_outro(): void
    {
        $ana = $this->criarUsuario(['nome' => 'Ana']);
        $bruno = $this->criarUsuario(['nome' => 'Bruno']);

        $this->autenticarComo($ana);
        $this->putJson("/api/usuarios/{$ana->id}", ['nome' => 'Ana Maria'])
            ->assertOk()
            ->assertJsonPath('data.nome', 'Ana Maria');
        $this->assertSame('Ana Maria', $ana->fresh()->nome);

        $this->putJson("/api/usuarios/{$bruno->id}", ['nome' => 'Invadido'])->assertForbidden();
        $this->assertSame('Bruno', $bruno->fresh()->nome);
    }

    public function test_admin_edita_qualquer_usuario(): void
    {
        $ana = $this->criarUsuario(['nome' => 'Ana']);
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->putJson("/api/usuarios/{$ana->id}", ['nome' => 'Moderada'])->assertOk();

        $this->assertSame('Moderada', $ana->fresh()->nome);
    }

    public function test_editar_nao_deixa_virar_admin_trocar_de_tipo_nem_se_autoaprovar(): void
    {
        $psicologo = $this->criarPsicologo('pendente', ['crp' => '12345']);
        $this->autenticarComo($psicologo);

        $this->putJson("/api/usuarios/{$psicologo->id}", [
            'nome' => 'Nome novo',
            'is_admin' => true,
            'role' => 'admin',
            'tipo' => 'usuario',
            'crp' => '99999',
            'crp_regiao' => 3,
            'crp_status' => 'aprovado',
            'email_verified_at' => null,
        ])->assertOk();

        $psicologo->refresh();
        $this->assertSame('Nome novo', $psicologo->nome);
        $this->assertFalse((bool) $psicologo->is_admin);
        $this->assertNotSame('admin', $psicologo->role);
        $this->assertSame('psicologo', $psicologo->tipo);
        $this->assertSame('12345', $psicologo->crp);
        $this->assertSame('pendente', $psicologo->crp_status);
        $this->assertNotNull($psicologo->email_verified_at);
    }

    public function test_email_novo_nao_pode_ser_o_de_outra_conta_mas_pode_repetir_o_proprio(): void
    {
        $this->criarUsuario(['email' => 'ocupado@teste.com']);
        $ana = $this->autenticarComo($this->criarUsuario(['email' => 'ana@teste.com']));

        $this->putJson("/api/usuarios/{$ana->id}", ['email' => 'ocupado@teste.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->putJson("/api/usuarios/{$ana->id}", ['email' => 'invalido'])->assertJsonValidationErrors('email');

        $this->putJson("/api/usuarios/{$ana->id}", ['email' => 'ana@teste.com', 'nome' => 'Ana'])->assertOk();
    }

    public function test_nome_nao_pode_ficar_vazio_nem_passar_de_100_caracteres(): void
    {
        $ana = $this->autenticarComo($this->criarUsuario(['nome' => 'Ana']));

        $this->putJson("/api/usuarios/{$ana->id}", ['nome' => ''])->assertUnprocessable();
        $this->putJson("/api/usuarios/{$ana->id}", ['nome' => str_repeat('a', 101)])->assertJsonValidationErrors('nome');

        $this->assertSame('Ana', $ana->fresh()->nome);
    }

    public function test_trocar_a_foto_apaga_a_antiga_do_disco(): void
    {
        Storage::disk('public')->put('perfil/antiga.png', 'conteudo');
        $ana = $this->autenticarComo($this->criarUsuario(['imagem_perfil' => 'perfil/antiga.png']));

        $this->putJson("/api/usuarios/{$ana->id}", [
            'imagem_perfil' => UploadedFile::fake()->create('nova.png', 100, 'image/png'),
        ])->assertOk();

        Storage::disk('public')->assertMissing('perfil/antiga.png');
        Storage::disk('public')->assertExists($ana->fresh()->imagem_perfil);
    }

    public function test_foto_precisa_ser_imagem_de_ate_2mb(): void
    {
        $ana = $this->autenticarComo($this->criarUsuario());

        $this->putJson("/api/usuarios/{$ana->id}", [
            'imagem_perfil' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ])->assertJsonValidationErrors('imagem_perfil');

        $this->putJson("/api/usuarios/{$ana->id}", [
            'imagem_perfil' => UploadedFile::fake()->create('grande.png', 2049, 'image/png'),
        ])->assertJsonValidationErrors('imagem_perfil');

        $this->assertNull($ana->fresh()->imagem_perfil);
    }

    // =====================================================================
    // TROCAR A SENHA
    // =====================================================================

    public function test_trocar_a_senha_vale_para_o_proximo_login(): void
    {
        $ana = $this->criarUsuario(['email' => 'ana@teste.com']);
        $token = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');

        $this->withToken($token)
            ->putJson("/api/usuarios/{$ana->id}", ['senha' => 'novaSenha1'])
            ->assertOk();

        $this->assertTrue(Hash::check('novaSenha1', $ana->fresh()->senha));
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->assertUnauthorized();
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => 'novaSenha1'])->assertOk();
    }

    public function test_validacoes_da_nova_senha_no_perfil(): void
    {
        $ana = $this->autenticarComo($this->criarUsuario());

        $this->putJson("/api/usuarios/{$ana->id}", ['senha' => '123'])->assertJsonValidationErrors('senha');
        $this->putJson("/api/usuarios/{$ana->id}", ['senha' => 'com espaco'])->assertJsonValidationErrors('senha');

        $this->assertTrue(Hash::check('123456', $ana->fresh()->senha));
    }

    public function test_trocar_a_propria_senha_derruba_as_outras_sessoes_e_mantem_a_atual(): void
    {
        $ana = $this->criarUsuario(['email' => 'ana@teste.com']);
        $tokenAtual = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');
        $tokenOutroAparelho = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');

        $this->withToken($tokenAtual)
            ->putJson("/api/usuarios/{$ana->id}", ['senha' => 'novaSenha1'])
            ->assertOk();

        $this->assertNotNull(PersonalAccessToken::findToken($tokenAtual), 'Quem trocou a senha continua logado.');
        $this->assertNull(PersonalAccessToken::findToken($tokenOutroAparelho), 'Quem estava logado com a senha antiga deve cair.');
    }

    public function test_admin_trocando_a_senha_de_outra_pessoa_derruba_todas_as_sessoes_dela(): void
    {
        $ana = $this->criarUsuario();
        $ana->createToken('celular');
        $ana->createToken('computador');
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->putJson("/api/usuarios/{$ana->id}", ['senha' => 'novaSenha1'])->assertOk();

        $this->assertSame(0, $ana->tokens()->count());
    }

    public function test_editar_sem_trocar_a_senha_nao_derruba_sessao_nenhuma(): void
    {
        $ana = $this->criarUsuario(['email' => 'ana@teste.com']);
        $tokenAtual = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456']);

        $this->withToken($tokenAtual)
            ->putJson("/api/usuarios/{$ana->id}", ['nome' => 'Ana Maria'])
            ->assertOk();

        $this->assertSame(2, $ana->tokens()->count());
    }

    // =====================================================================
    // EXCLUIR A CONTA
    // =====================================================================

    public function test_excluir_conta_exige_login_e_so_vale_para_a_propria_ou_pelo_admin(): void
    {
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();

        $this->deleteJson("/api/usuarios/{$ana->id}")->assertUnauthorized();

        $this->autenticarComo($ana);
        $this->deleteJson("/api/usuarios/{$bruno->id}")->assertForbidden();
        $this->assertModelExists($bruno);

        $this->deleteJson("/api/usuarios/{$ana->id}")->assertOk();
        $this->assertModelMissing($ana);

        $this->autenticarComo($this->criarAdmin(), ['admin']);
        $this->deleteJson("/api/usuarios/{$bruno->id}")->assertOk();
        $this->assertModelMissing($bruno);
    }

    public function test_excluir_conta_inexistente_retorna_404(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->deleteJson('/api/usuarios/999999')->assertNotFound();
    }

    public function test_excluir_a_conta_apaga_a_foto_os_favoritos_e_as_sessoes(): void
    {
        Storage::disk('public')->put('perfil/ana.png', 'conteudo');
        $video = $this->criarVideo($this->criarPsicologo());
        $ana = $this->criarUsuario(['email' => 'ana@teste.com', 'imagem_perfil' => 'perfil/ana.png']);
        $bruno = $this->criarUsuario();

        // Favoritos criados direto no banco: este teste usa token de verdade (login) mais
        // abaixo, e misturar isso com "autenticarComo" faria o Laravel manter o usuário anterior.
        foreach ([$ana, $bruno] as $pessoa) {
            Favorito::create([
                'usuario_id' => $pessoa->id,
                'favoritavel_id' => $video->id,
                'favoritavel_type' => Video::class,
                'data_criacao' => now(),
            ]);
        }

        $ana->createToken('celular');
        $token = $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->json('token');

        $this->withToken($token)->deleteJson("/api/usuarios/{$ana->id}")->assertOk();

        Storage::disk('public')->assertMissing('perfil/ana.png');
        $this->assertSame(1, Favorito::count(), 'Só o favorito do Bruno deve sobrar.');
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->postJson('/api/login', ['email' => 'ana@teste.com', 'senha' => '123456'])->assertUnauthorized();
    }

    public function test_excluir_a_conta_de_psicologo_apaga_tambem_os_conteudos_e_os_favoritos_deles(): void
    {
        Storage::disk('public')->put('videos/aula.mp4', 'conteudo');
        $psicologo = $this->criarPsicologo();
        $video = $this->criarVideo($psicologo, ['arquivo' => 'videos/aula.mp4']);
        $leitor = $this->criarUsuario();

        $this->autenticarComo($leitor);
        $this->postJson('/api/favoritos', ['tipo' => 'video', 'favoritavel_id' => $video->id])->assertCreated();

        $this->autenticarComo($psicologo, ['publicador']);
        $this->deleteJson("/api/usuarios/{$psicologo->id}")->assertOk();

        $this->assertModelMissing($video);
        Storage::disk('public')->assertMissing('videos/aula.mp4');
        $this->assertDatabaseCount('favoritos', 0);
    }

    public function test_excluir_a_conta_mantendo_os_conteudos_deixa_os_conteudos_sem_autor(): void
    {
        $psicologo = $this->criarPsicologo();
        $video = $this->criarVideo($psicologo, ['titulo' => 'Continua no ar']);
        $this->autenticarComo($psicologo, ['publicador']);

        $this->deleteJson("/api/usuarios/{$psicologo->id}", ['manter_conteudos' => true])->assertOk();

        $this->assertModelExists($video);
        $this->assertNull($video->fresh()->autor_id);

        $this->autenticarComo($this->criarUsuario());
        $this->getJson("/api/videos/{$video->id}")
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Continua no ar')
            ->assertJsonPath('data.autor', null);
    }
}

